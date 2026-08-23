from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Notification
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications System"])

@router.get("/", response_model=List[NotificationResponse])
def list_notifications(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    notifs = list(db.notifications.find({"user_id": current_user.id}).sort("created_at", -1))
    return serialize_docs(notifs)

@router.get("/unread-count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    count = db.notifications.count_documents({
        "user_id": current_user.id,
        "is_read": False
    })
    return {"unread_count": count}

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    n_oid = to_object_id(notification_id)
    notif = db.notifications.find_one({
        "_id": n_oid,
        "user_id": current_user.id
    })
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.notifications.update_one(
        {"_id": n_oid},
        {"$set": {"is_read": True}}
    )
    
    updated = db.notifications.find_one({"_id": n_oid})
    return serialize_doc(updated)

@router.post("/read-all", response_model=dict)
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    db.notifications.update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"status": "success", "message": "All notifications marked as read"}
