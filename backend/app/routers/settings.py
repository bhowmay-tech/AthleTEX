from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc
from app.routers.auth import get_current_user
from app.models.models import User, UserSetting
from app.schemas.schemas import UserSettingResponse, UserSettingUpdate

router = APIRouter(prefix="/settings", tags=["User Settings"])

@router.get("/", response_model=UserSettingResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    settings = db.user_settings.find_one({"user_id": current_user.id})
    if not settings:
        # Create default settings
        settings = {
            "user_id": current_user.id,
            "profile_visibility": "Public",
            "show_location": True,
            "show_rating": True,
            "match_notifications": True,
            "event_notifications": True,
            "message_notifications": True,
            "ai_coach_updates": True,
            "reduced_motion": False
        }
        res = db.user_settings.insert_one(settings)
        settings["_id"] = res.inserted_id
        
    return serialize_doc(settings)

@router.put("/", response_model=UserSettingResponse)
def update_user_settings(
    settings_in: UserSettingUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    settings = db.user_settings.find_one({"user_id": current_user.id})
    if not settings:
        # Create default settings first
        settings = {
            "user_id": current_user.id,
            "profile_visibility": "Public",
            "show_location": True,
            "show_rating": True,
            "match_notifications": True,
            "event_notifications": True,
            "message_notifications": True,
            "ai_coach_updates": True,
            "reduced_motion": False
        }
        res = db.user_settings.insert_one(settings)
        settings["_id"] = res.inserted_id
        
    update_data = settings_in.model_dump(exclude_unset=True)
    if update_data:
        db.user_settings.update_one(
            {"_id": settings["_id"]},
            {"$set": update_data}
        )
        
    updated = db.user_settings.find_one({"_id": settings["_id"]})
    return serialize_doc(updated)
