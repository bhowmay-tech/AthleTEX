from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Message
from app.schemas.schemas import MessageCreate, MessageResponse

router = APIRouter(prefix="/messages", tags=["Messaging & Communications"])

@router.post("/send", response_model=MessageResponse)
def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Send message to another athlete or mentor."""
    recipient = db.users.find_one({"_id": to_object_id(msg_in.receiver_id)})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found")
        
    msg_doc = {
        "sender_id": current_user.id,
        "receiver_id": msg_in.receiver_id,
        "content": msg_in.content,
        "timestamp": datetime.utcnow(),
        "is_read": False
    }
    res = db.messages.insert_one(msg_doc)
    msg_doc["_id"] = res.inserted_id
    return serialize_doc(msg_doc)

@router.get("/chat/{other_user_id}", response_model=List[MessageResponse])
def get_chat_history(
    other_user_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Retrieve chronologically ordered message history between current user and another user."""
    messages = list(db.messages.find({
        "$or": [
            {"sender_id": current_user.id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": current_user.id}
        ]
    }).sort("timestamp", 1))
    
    # Mark messages sent by the other user to current user as read
    db.messages.update_many(
        {"sender_id": other_user_id, "receiver_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    # Refresh list locally to return read status correctly
    for m in messages:
        if m.get("receiver_id") == current_user.id:
            m["is_read"] = True
            
    return serialize_docs(messages)

@router.get("/recent", response_model=List[dict])
def get_recent_conversations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Retrieve list of users the current user has exchanged messages with, along with their last message."""
    all_msgs = list(db.messages.find({
        "$or": [
            {"sender_id": current_user.id},
            {"receiver_id": current_user.id}
        ]
    }).sort("timestamp", -1))
    
    seen_users = set()
    conversations = []
    
    for msg in all_msgs:
        other_id = msg.get("receiver_id") if msg.get("sender_id") == current_user.id else msg.get("sender_id")
        if other_id in seen_users:
            continue
        seen_users.add(other_id)
        
        other_user = db.users.find_one({"_id": ObjectId(other_id)})
        if other_user:
            conversations.append({
                "other_user_id": str(other_user["_id"]),
                "name": other_user.get("name"),
                "role": other_user.get("role"),
                "last_message": msg.get("content"),
                "timestamp": msg.get("timestamp"),
                "is_unread": not msg.get("is_read") and msg.get("receiver_id") == current_user.id
            })
            
    return conversations
