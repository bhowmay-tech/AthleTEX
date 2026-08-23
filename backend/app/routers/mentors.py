from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, MentorProfile
from app.schemas.schemas import MentorProfileUpdate, MentorProfileResponse

router = APIRouter(prefix="/mentors", tags=["Mentors & Scouting"])

@router.get("/profile", response_model=MentorProfileResponse)
def get_mentor_profile(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    if current_user.role != "mentor":
        raise HTTPException(status_code=400, detail="User is not registered as a mentor/scout")
        
    profile = db.mentor_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return serialize_doc(profile)

@router.put("/profile", response_model=MentorProfileResponse)
def update_mentor_profile(
    profile_in: MentorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "mentor":
        raise HTTPException(status_code=400, detail="User is not registered as a mentor/scout")
        
    profile = db.mentor_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
        
    update_data = profile_in.model_dump(exclude_unset=True)
    if update_data:
        db.mentor_profiles.update_one(
            {"_id": profile["_id"]},
            {"$set": update_data}
        )
        
    updated = db.mentor_profiles.find_one({"_id": profile["_id"]})
    return serialize_doc(updated)

@router.get("/scout", response_model=List[dict])
def scout_athletes(
    sport: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_skill: Optional[int] = Query(None),
    min_pace: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Search and filter athletes. Requires Mentor or Admin authorization.
    """
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Scouting operations reserved for recruiters.")

    # Retrieve all athlete profiles
    prof_query = {}
    if sport:
        prof_query["sport"] = {"$regex": sport, "$options": "i"}
    if location:
        prof_query["location"] = {"$regex": location, "$options": "i"}
    if min_skill:
        prof_query["skill_rating"] = {"$gte": min_skill}
    if min_pace:
        prof_query["pace"] = {"$gte": min_pace}
        
    profiles = list(db.athlete_profiles.find(prof_query))
    
    response_data = []
    for profile in profiles:
        u_id = profile.get("user_id")
        user = db.users.find_one({"_id": ObjectId(u_id)})
        if not user:
            continue
            
        p_ser = serialize_doc(profile)
        response_data.append({
            "user_id": u_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "sport": p_ser.get("sport"),
            "age": p_ser.get("age"),
            "location": p_ser.get("location"),
            "skill_rating": p_ser.get("skill_rating"),
            "pace": p_ser.get("pace"),
            "shooting": p_ser.get("shooting"),
            "passing": p_ser.get("passing"),
            "dribbling": p_ser.get("dribbling"),
            "defense": p_ser.get("defense"),
            "physical": p_ser.get("physical"),
            "verified": p_ser.get("verified", False),
            "avatar_url": p_ser.get("avatar_url"),
            "shareable_url": p_ser.get("shareable_url")
        })
        
    return response_data
