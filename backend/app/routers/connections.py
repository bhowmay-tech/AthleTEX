from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Connection
from app.schemas.schemas import ConnectionResponse

router = APIRouter(prefix="/connections", tags=["Connections & Network"])

def hydrate_connection(conn_doc, db) -> dict:
    if not conn_doc:
        return None
    serialized = serialize_doc(conn_doc)
    
    # Hydrate sender
    sender = db.users.find_one({"_id": ObjectId(serialized["sender_id"])})
    serialized["sender"] = serialize_doc(sender) if sender else None
    
    # Hydrate receiver
    receiver = db.users.find_one({"_id": ObjectId(serialized["receiver_id"])})
    serialized["receiver"] = serialize_doc(receiver) if receiver else None
    
    return serialized

@router.post("/request", response_model=ConnectionResponse)
def send_connection_request(
    receiver_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot connect with yourself")
        
    recipient = db.users.find_one({"_id": to_object_id(receiver_id)})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found")
        
    # Check if a connection request already exists in either direction
    existing = db.connections.find_one({
        "$or": [
            {"sender_id": current_user.id, "receiver_id": receiver_id},
            {"sender_id": receiver_id, "receiver_id": current_user.id}
        ]
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Connection request already exists with status: {existing.get('status')}"
        )
        
    conn_doc = {
        "sender_id": current_user.id,
        "receiver_id": receiver_id,
        "status": "Requested",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    res = db.connections.insert_one(conn_doc)
    conn_doc["_id"] = res.inserted_id
    
    # Notify recipient
    db.notifications.insert_one({
        "user_id": receiver_id,
        "icon": "🤝",
        "text": f"{current_user.name} sent you a connection request.",
        "is_read": False,
        "created_at": datetime.utcnow()
    })
    
    return hydrate_connection(conn_doc, db)

@router.get("/pending", response_model=List[ConnectionResponse])
def get_pending_requests(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """List pending requests received by the current user."""
    requests = list(db.connections.find({
        "receiver_id": current_user.id,
        "status": "Requested"
    }))
    return [hydrate_connection(r, db) for r in requests]

@router.post("/respond/{request_id}", response_model=ConnectionResponse)
def respond_to_connection_request(
    request_id: str,
    accept: bool,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    r_oid = to_object_id(request_id)
    connection = db.connections.find_one({
        "_id": r_oid,
        "receiver_id": current_user.id
    })
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")
        
    if connection.get("status") != "Requested":
        raise HTTPException(status_code=400, detail="This connection request has already been handled")
        
    if accept:
        db.connections.update_one(
            {"_id": r_oid},
            {"$set": {"status": "Accepted", "updated_at": datetime.utcnow()}}
        )
        # Notify sender
        db.notifications.insert_one({
            "user_id": str(connection.get("sender_id")),
            "icon": "🤝",
            "text": f"{current_user.name} accepted your connection request!",
            "is_read": False,
            "created_at": datetime.utcnow()
        })
        
        updated = db.connections.find_one({"_id": r_oid})
        return hydrate_connection(updated, db)
    else:
        db.connections.delete_one({"_id": r_oid})
        
        # Return mock rejected object representation
        rejected_doc = {
            "id": request_id,
            "sender_id": connection.get("sender_id"),
            "receiver_id": connection.get("receiver_id"),
            "status": "Rejected",
            "created_at": connection.get("created_at"),
            "updated_at": datetime.utcnow()
        }
        return hydrate_connection(rejected_doc, db)

@router.get("/list", response_model=List[ConnectionResponse])
def list_connections(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Retrieve all accepted connections for the current user."""
    conns = list(db.connections.find({
        "$or": [
            {"sender_id": current_user.id},
            {"receiver_id": current_user.id}
        ],
        "status": "Accepted"
    }))
    return [hydrate_connection(c, db) for c in conns]
