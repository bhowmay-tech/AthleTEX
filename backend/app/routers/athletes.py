from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Optional
import os
import uuid
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, AthleteProfile, AthleteSport, Application, Achievement
from app.schemas.schemas import (
    AthleteProfileUpdate, AthleteProfileResponse, 
    AthleteSportResponse, AthleteSportCreate, AthleteSportUpdate,
    ApplicationCreate, ApplicationResponse, 
    AchievementCreate, AchievementResponse
)

router = APIRouter(prefix="/athletes", tags=["Athletes Profile"])

UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[dict])
def list_discover_athletes(
    sport: Optional[str] = None,
    location: Optional[str] = None,
    skill_level: Optional[str] = None,
    min_rating: Optional[int] = None,
    verified_only: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Search and discover athletes with filters. Used by the Discover page.
    """
    # Base query for athlete users
    user_query = {"role": "athlete"}
    if search:
        user_query["name"] = {"$regex": search, "$options": "i"}
        
    users = list(db.users.find(user_query))
    athletes_list = []
    
    for u in users:
        u_id_str = str(u["_id"])
        
        # Query profile
        prof_query = {"user_id": u_id_str}
        if verified_only:
            prof_query["verified"] = True
        if location:
            prof_query["location"] = {"$regex": location, "$options": "i"}
            
        profile = db.athlete_profiles.find_one(prof_query)
        if not profile:
            # If search matches user but location/verified didn't match profile
            if search and not location and not verified_only:
                # Still try to find profile without filters to see if bio matches search
                profile = db.athlete_profiles.find_one({"user_id": u_id_str})
                if profile and not (search.lower() in profile.get("bio", "").lower()):
                    continue
            else:
                continue
                
        # If search query didn't match name, check if it matches bio
        if search and not (search.lower() in u.get("name", "").lower()):
            if not (search.lower() in profile.get("bio", "").lower()):
                continue
                
        profile_id_str = str(profile["_id"])
        
        # Check sports sub-records
        sport_query = {"athlete_id": profile_id_str}
        if sport and sport != "All":
            sport_query["sport_name"] = {"$regex": f"^{sport}$", "$options": "i"}
        if skill_level and skill_level != "All":
            sport_query["skill_level"] = skill_level
        if min_rating:
            sport_query["rating"] = {"$gte": min_rating}
            
        matching_sports = list(db.athlete_sports.find(sport_query))
        
        # If sport filter is set and no records match, skip this athlete
        if (sport and sport != "All") or (skill_level and skill_level != "All") or min_rating:
            if not matching_sports:
                continue
                
        # Fetch all sports for this athlete to return
        all_sports = list(db.athlete_sports.find({"athlete_id": profile_id_str}))
        athlete_sports_list = [serialize_doc(s) for s in all_sports]
        
        athletes_list.append({
            "id": u_id_str,
            "name": u.get("name"),
            "email": u.get("email"),
            "role": u.get("role"),
            "sport": profile.get("sport", "Soccer"),
            "age": profile.get("age", 24),
            "height": profile.get("height", 180.0),
            "weight": profile.get("weight", 75.0),
            "location": profile.get("location", ""),
            "bio": profile.get("bio", ""),
            "skill_rating": profile.get("skill_rating", 75),
            "verified": profile.get("verified", False),
            "qr_code": profile.get("qr_code", ""),
            "avatar_url": profile.get("avatar_url", ""),
            "shareable_url": profile.get("shareable_url", ""),
            "availability": profile.get("availability", {}),
            "sports": athlete_sports_list
        })
        
    return athletes_list

@router.get("/profile", response_model=AthleteProfileResponse)
def get_athlete_profile(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    if current_user.role != "athlete":
        raise HTTPException(status_code=400, detail="User is not registered as an athlete")
        
    profile = db.athlete_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    return serialize_doc(profile)

@router.put("/profile", response_model=AthleteProfileResponse)
def update_athlete_profile(
    profile_in: AthleteProfileUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "athlete":
        raise HTTPException(status_code=400, detail="User is not registered as an athlete")
        
    profile = db.athlete_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    update_data = profile_in.model_dump(exclude_unset=True)
    if update_data:
        db.athlete_profiles.update_one(
            {"_id": profile["_id"]},
            {"$set": update_data}
        )
        
    updated_profile = db.athlete_profiles.find_one({"_id": profile["_id"]})
    return serialize_doc(updated_profile)

@router.post("/avatar", response_model=dict)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Handle uploading profile photo.
    Validates image type and file size (max 5MB).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")
        
    max_size = 5 * 1024 * 1024  # 5MB
    contents = file.file.read(max_size + 1)
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="Image size exceeds the 5MB maximum limit.")
    file.file.seek(0)
    
    ext = os.path.splitext(file.filename)[1]
    if ext.lower() not in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
        raise HTTPException(status_code=400, detail="Invalid image file extension.")
        
    safe_filename = f"avatar_{current_user.id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
        
    avatar_url = f"/api/v1/athletes/avatar/{safe_filename}"
    if current_user.role == "athlete":
        db.athlete_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": {"avatar_url": avatar_url}}
        )
    elif current_user.role == "mentor":
        db.mentor_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": {"avatar_url": avatar_url}}
        )
        
    return {"status": "success", "avatar_url": avatar_url}

@router.get("/avatar/{filename}")
def serve_avatar(filename: str):
    """Serve uploaded avatars."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Avatar image not found")
    return FileResponse(file_path)

@router.get("/sports", response_model=List[AthleteSportResponse])
def get_athlete_sports(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    profile = db.athlete_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    sports = list(db.athlete_sports.find({"athlete_id": str(profile["_id"])}))
    return serialize_docs(sports)

@router.post("/sports", response_model=AthleteSportResponse)
def add_athlete_sport(
    sport_in: AthleteSportCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    profile = db.athlete_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile_id_str = str(profile["_id"])
    existing = db.athlete_sports.find_one({
        "athlete_id": profile_id_str,
        "sport_name": {"$regex": f"^{sport_in.sport_name}$", "$options": "i"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Sport already added to profile")
        
    sport_doc = {
        "athlete_id": profile_id_str,
        "sport_name": sport_in.sport_name,
        "skill_level": sport_in.skill_level,
        "rating": sport_in.rating,
        "is_primary": sport_in.is_primary,
        "stats": sport_in.stats
    }
    
    # If this is set to primary, unset previous primary sports
    if sport_in.is_primary:
        db.athlete_sports.update_many(
            {"athlete_id": profile_id_str},
            {"$set": {"is_primary": False}}
        )
        
    res = db.athlete_sports.insert_one(sport_doc)
    sport_doc["id"] = str(res.inserted_id)
    return serialize_doc(sport_doc)

@router.put("/sports/{sport_id}", response_model=AthleteSportResponse)
def update_athlete_sport(
    sport_id: str,
    sport_in: AthleteSportUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    profile = db.athlete_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile_id_str = str(profile["_id"])
    s_oid = to_object_id(sport_id)
    sport = db.athlete_sports.find_one({
        "_id": s_oid,
        "athlete_id": profile_id_str
    })
    if not sport:
        raise HTTPException(status_code=404, detail="Sport entry not found")
        
    update_data = sport_in.model_dump(exclude_unset=True)
    if update_data:
        if update_data.get("is_primary"):
            db.athlete_sports.update_many(
                {"athlete_id": profile_id_str},
                {"$set": {"is_primary": False}}
            )
        db.athlete_sports.update_one(
            {"_id": s_oid},
            {"$set": update_data}
        )
        
    updated = db.athlete_sports.find_one({"_id": s_oid})
    return serialize_doc(updated)

@router.post("/apply", response_model=ApplicationResponse)
def apply_to_program(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "athlete":
        raise HTTPException(status_code=400, detail="Only athletes can apply to programs")
        
    app_doc = {
        "athlete_id": current_user.id,
        "target_entity": app_in.target_entity,
        "type": app_in.type,
        "applied_role": app_in.applied_role,
        "status": "Pending",
        "created_at": datetime.utcnow()
    }
    res = db.applications.insert_one(app_doc)
    app_doc["id"] = str(res.inserted_id)
    return serialize_doc(app_doc)

@router.get("/applications", response_model=List[ApplicationResponse])
def get_applications(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "athlete":
        raise HTTPException(status_code=400, detail="User is not registered as an athlete")
        
    apps = list(db.applications.find({"athlete_id": current_user.id}))
    return serialize_docs(apps)

@router.post("/achievements", response_model=AchievementResponse)
def create_achievement(
    ach_in: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "athlete":
        raise HTTPException(status_code=400, detail="Only athletes can add achievements")
        
    ach_doc = {
        "athlete_id": current_user.id,
        "title": ach_in.title,
        "organization": ach_in.organization,
        "date_earned": datetime.utcnow(),
        "certificate_url": ach_in.certificate_url
    }
    res = db.achievements.insert_one(ach_doc)
    ach_doc["id"] = str(res.inserted_id)
    return serialize_doc(ach_doc)

@router.get("/achievements", response_model=List[AchievementResponse])
def list_achievements(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    achievements = list(db.achievements.find({"athlete_id": current_user.id}))
    return serialize_docs(achievements)

@router.get("/public/{user_id}", response_model=dict)
def get_public_resume(user_id: str, db = Depends(get_db)):
    """Fetch public sports resume for shareable URL / QR view."""
    athlete = db.users.find_one({"_id": to_object_id(user_id), "role": "athlete"})
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile = db.athlete_profiles.find_one({"user_id": user_id})
    achievements = list(db.achievements.find({"athlete_id": user_id}))
    
    athlete_sports_list = []
    if profile:
        profile_id_str = str(profile["_id"])
        sports = list(db.athlete_sports.find({"athlete_id": profile_id_str}))
        athlete_sports_list = [
            {
                "sport_name": s.get("sport_name"),
                "skill_level": s.get("skill_level"),
                "rating": s.get("rating"),
                "stats": s.get("stats")
            }
            for s in sports
        ]
        
    return {
        "athlete_name": athlete.get("name"),
        "email": athlete.get("email"),
        "profile": {
            "sport": profile.get("sport", "Soccer") if profile else "Soccer",
            "age": profile.get("age", 18) if profile else 18,
            "height": profile.get("height", 175.0) if profile else 175.0,
            "weight": profile.get("weight", 70.0) if profile else 70.0,
            "location": profile.get("location", "") if profile else "",
            "bio": profile.get("bio", "") if profile else "",
            "skill_rating": profile.get("skill_rating", 75) if profile else 75,
            "pace": profile.get("pace", 75) if profile else 75,
            "shooting": profile.get("shooting", 75) if profile else 75,
            "passing": profile.get("passing", 75) if profile else 75,
            "dribbling": profile.get("dribbling", 75) if profile else 75,
            "defense": profile.get("defense", 75) if profile else 75,
            "physical": profile.get("physical", 75) if profile else 75,
            "verified": profile.get("verified", False) if profile else False,
            "availability": profile.get("availability", {}) if profile else {}
        },
        "achievements": [
            {"title": a.get("title"), "organization": a.get("organization"), "date": a.get("date_earned").isoformat()}
            for a in achievements
        ],
        "sports": athlete_sports_list
    }
