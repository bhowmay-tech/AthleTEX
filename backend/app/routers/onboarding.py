from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc
from app.routers.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import OnboardingStepSave, OnboardingStatusResponse, OnboardingProfileUpdate

router = APIRouter(prefix="/onboarding", tags=["Onboarding & Sports Profile"])

def calculate_completion_percentage(profile_doc: dict) -> int:
    """Calculate profile completion percentage based on filled fields."""
    if not profile_doc:
        return 0
        
    score = 0
    total_sections = 10
    
    # 1. Primary Sport
    sports = profile_doc.get("sports", {})
    if sports.get("primary"):
        score += 10
        
    # 2. Sports Played
    if sports.get("played") and len(sports.get("played")) > 0:
        score += 10
        
    # 3. Experience & Skill
    exp = profile_doc.get("experience", {})
    if exp.get("skill_level") and exp.get("years"):
        score += 10
        
    # 4. Sport Specific
    if profile_doc.get("sport_specific"):
        score += 10
        
    # 5. Fitness Profile
    fitness = profile_doc.get("fitness", {})
    if fitness.get("goals") or fitness.get("fitness_level"):
        score += 10
        
    # 6. Training Preferences
    training = profile_doc.get("training", {})
    if training.get("locations") or training.get("types"):
        score += 10
        
    # 7. Goals & Help Topics
    if profile_doc.get("goals") or profile_doc.get("help_topics"):
        score += 10
        
    # 8. Availability
    avail = profile_doc.get("availability", {})
    if avail and len(avail) > 0:
        score += 10
        
    # 9. Location & Radius
    loc = profile_doc.get("location", {})
    if loc.get("city") or loc.get("area"):
        score += 10
        
    # 10. Equipment or Coaching or Stats
    if profile_doc.get("equipment") or profile_doc.get("coaching") or profile_doc.get("stats"):
        score += 10
        
    return min(100, max(15, score))

def sync_onboarding_to_athlete_profile(db, user_id: str, onboarding_profile: dict, user_name: str):
    """Sync onboarding data to athlete_profiles and athlete_sports collections."""
    sports = onboarding_profile.get("sports", {})
    exp = onboarding_profile.get("experience", {})
    loc = onboarding_profile.get("location", {})
    avail = onboarding_profile.get("availability", {})
    fitness = onboarding_profile.get("fitness", {})
    
    primary_sport = sports.get("primary", "Cricket")
    city = loc.get("city", "Hyderabad")
    area = loc.get("area", "Kukatpally")
    location_str = f"{area}, {city}" if area and city else (city or "Hyderabad")
    
    skill_level = exp.get("skill_level", "Intermediate").capitalize()
    
    # Calculate synthetic rating based on skill level
    rating_map = {"Beginner": 70, "Intermediate": 82, "Advanced": 91, "Professional": 96}
    base_rating = rating_map.get(skill_level, 84)
    
    # Simple bio text
    goals_list = onboarding_profile.get("goals", [])
    goals_str = ", ".join(goals_list[:2]) if goals_list else "Sports athlete"
    bio = f"{primary_sport} enthusiast ({skill_level}). Goals: {goals_str}."
    
    # Update or insert athlete_profile
    ath_prof = db.athlete_profiles.find_one({"user_id": user_id})
    prof_update = {
        "user_id": user_id,
        "sport": primary_sport,
        "location": location_str,
        "bio": bio,
        "skill_rating": base_rating,
        "updated_at": datetime.utcnow()
    }
    
    # Simple day availability mapping
    avail_bool_map = {}
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for d in days:
        full_day = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"}[d]
        avail_bool_map[d] = full_day in avail or d in avail
    prof_update["availability"] = avail_bool_map
    
    if ath_prof:
        db.athlete_profiles.update_one({"_id": ath_prof["_id"]}, {"$set": prof_update})
        profile_id_str = str(ath_prof["_id"])
    else:
        prof_update["age"] = 22
        prof_update["height"] = 178.0
        prof_update["weight"] = 72.0
        prof_update["pace"] = base_rating
        prof_update["shooting"] = base_rating
        prof_update["passing"] = base_rating
        prof_update["dribbling"] = base_rating
        prof_update["defense"] = base_rating
        prof_update["physical"] = base_rating
        prof_update["verified"] = False
        prof_update["qr_code"] = f"ATH-{user_id[:8].upper()}"
        prof_update["avatar_url"] = ""
        prof_update["shareable_url"] = f"/public/profile/{user_id}"
        res = db.athlete_profiles.insert_one(prof_update)
        profile_id_str = str(res.inserted_id)
        
    # Sync athlete sports played
    played_sports = sports.get("played", [primary_sport])
    if primary_sport not in played_sports:
        played_sports.insert(0, primary_sport)
        
    for s_name in played_sports:
        s_name_cap = s_name.capitalize()
        is_prim = (s_name_cap.lower() == primary_sport.lower())
        existing_sport = db.athlete_sports.find_one({
            "athlete_id": profile_id_str,
            "sport_name": {"$regex": f"^{s_name_cap}$", "$options": "i"}
        })
        if not existing_sport:
            db.athlete_sports.insert_one({
                "athlete_id": profile_id_str,
                "sport_name": s_name_cap,
                "skill_level": skill_level,
                "rating": base_rating if is_prim else base_rating - 5,
                "is_primary": is_prim,
                "stats": onboarding_profile.get("stats", {})
            })
        else:
            db.athlete_sports.update_one(
                {"_id": existing_sport["_id"]},
                {"$set": {"is_primary": is_prim, "skill_level": skill_level}}
            )


@router.get("/status", response_model=OnboardingStatusResponse)
def get_onboarding_status(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Retrieve user onboarding progress, completion state, and stored profile."""
    prof = db.onboarding_profiles.find_one({"user_id": current_user.id})
    if not prof:
        prof = {
            "user_id": current_user.id,
            "sports": {},
            "experience": {},
            "sport_specific": {},
            "fitness": {},
            "training": {},
            "availability": {},
            "location": {},
            "equipment": [],
            "coaching": {},
            "goals": [],
            "help_topics": [],
            "stats": {},
            "profile_completion": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = db.onboarding_profiles.insert_one(prof)
        prof["_id"] = res.inserted_id

    pct = calculate_completion_percentage(prof)
    return {
        "profile_completed": current_user.profile_completed,
        "onboarding_step": getattr(current_user, "onboarding_step", 1) or 1,
        "profile_completion": pct,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "user_email": current_user.email,
        "profile": serialize_doc(prof)
    }


@router.post("/step")
def save_onboarding_step(
    step_in: OnboardingStepSave,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Save an individual onboarding step to MongoDB and update user progress."""
    step = step_in.step
    data = step_in.data or {}
    
    prof = db.onboarding_profiles.find_one({"user_id": current_user.id})
    if not prof:
        prof = {
            "user_id": current_user.id,
            "sports": {},
            "experience": {},
            "sport_specific": {},
            "fitness": {},
            "training": {},
            "availability": {},
            "location": {},
            "equipment": [],
            "coaching": {},
            "goals": [],
            "help_topics": [],
            "stats": {},
            "profile_completion": 0,
            "created_at": datetime.utcnow()
        }
        res = db.onboarding_profiles.insert_one(prof)
        prof["_id"] = res.inserted_id

    update_fields = {"updated_at": datetime.utcnow()}
    
    # Route step data to specific sections
    if step == 1:
        sports_data = dict(prof.get("sports", {}))
        sports_data.update({
            "primary": data.get("primary_sport") or data.get("primary") or sports_data.get("primary", "Cricket"),
            "played": data.get("sports_played") or data.get("played") or sports_data.get("played", []),
            "favorite": data.get("favorite_sport") or data.get("favorite") or sports_data.get("favorite", ""),
            "improvement": data.get("improvement_sport") or data.get("improvement") or sports_data.get("improvement", "")
        })
        update_fields["sports"] = sports_data
        
    elif step == 2:
        exp_data = dict(prof.get("experience", {}))
        exp_data.update({
            "years": data.get("years") or data.get("duration") or exp_data.get("years", ""),
            "skill_level": data.get("skill_level") or exp_data.get("skill_level", "Intermediate"),
            "frequency": data.get("frequency") or exp_data.get("frequency", ""),
            "location_type": data.get("location_type") or exp_data.get("location_type", ""),
            "competition": data.get("competition") if "competition" in data else exp_data.get("competition", "")
        })
        update_fields["experience"] = exp_data
        
    elif step == 3:
        sport_spec = dict(prof.get("sport_specific", {}))
        sport_spec.update(data.get("sport_specific") or data)
        update_fields["sport_specific"] = sport_spec
        
    elif step == 4:
        fit_data = dict(prof.get("fitness", {}))
        fit_data.update({
            "goals": data.get("fitness_goals") or data.get("goals") or fit_data.get("goals", []),
            "fitness_level": data.get("fitness_level") or fit_data.get("fitness_level", ""),
            "exercise_days": data.get("exercise_days") or fit_data.get("exercise_days", ""),
            "session_duration": data.get("session_duration") or fit_data.get("session_duration", "")
        })
        update_fields["fitness"] = fit_data
        
    elif step == 5:
        train_data = dict(prof.get("training", {}))
        train_data.update({
            "locations": data.get("locations") or train_data.get("locations", []),
            "types": data.get("types") or train_data.get("types", []),
            "preferred_time": data.get("preferred_time") or train_data.get("preferred_time", ""),
            "weekly_hours": data.get("weekly_hours") or train_data.get("weekly_hours", "")
        })
        update_fields["training"] = train_data
        
        if "equipment" in data:
            update_fields["equipment"] = data["equipment"]
        if "coaching" in data:
            update_fields["coaching"] = data["coaching"]
            
    elif step == 6:
        if "goals" in data:
            update_fields["goals"] = data["goals"]
        if "help_topics" in data:
            update_fields["help_topics"] = data["help_topics"]
        if "location" in data:
            update_fields["location"] = data["location"]
        if "stats" in data:
            update_fields["stats"] = data["stats"]
            
    elif step == 7:
        if "availability" in data:
            update_fields["availability"] = data["availability"]

    # Also apply direct top-level fields if provided in data dict
    for k in ["sports", "experience", "sport_specific", "fitness", "training", "availability", "location", "equipment", "coaching", "goals", "help_topics", "stats"]:
        if k in data:
            update_fields[k] = data[k]

    # Save to onboarding_profiles
    db.onboarding_profiles.update_one({"_id": prof["_id"]}, {"$set": update_fields})
    
    # Reload profile & calculate completion percentage
    updated_prof = db.onboarding_profiles.find_one({"_id": prof["_id"]})
    completion_pct = calculate_completion_percentage(updated_prof)
    db.onboarding_profiles.update_one({"_id": prof["_id"]}, {"$set": {"profile_completion": completion_pct}})
    updated_prof["profile_completion"] = completion_pct

    # Determine if user completed onboarding or reached step 7
    is_finish = (step >= 7) or data.get("finish", False) or data.get("complete", False)
    next_step = max(getattr(current_user, "onboarding_step", 1) or 1, step + 1 if not is_finish else 7)
    
    user_update = {
        "onboarding_step": min(7, next_step),
        "updated_at": datetime.utcnow()
    }
    
    if is_finish:
        user_update["profile_completed"] = True
        user_update["onboarding_step"] = 7

    db.users.update_one({"_id": to_object_id(current_user.id)}, {"$set": user_update})
    
    # Sync with athlete_profiles & athlete_sports
    sync_onboarding_to_athlete_profile(db, current_user.id, updated_prof, current_user.name)

    return {
        "status": "success",
        "step_saved": step,
        "profile_completed": user_update.get("profile_completed", current_user.profile_completed or is_finish),
        "onboarding_step": user_update["onboarding_step"],
        "profile_completion": completion_pct,
        "profile": serialize_doc(updated_prof)
    }


@router.get("/profile")
def get_onboarding_profile(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Retrieve full onboarding profile document for profile page and edit modal."""
    prof = db.onboarding_profiles.find_one({"user_id": current_user.id})
    if not prof:
        prof = {
            "user_id": current_user.id,
            "sports": {"primary": "Cricket", "played": ["Cricket"]},
            "experience": {"skill_level": "Intermediate", "years": "1-3 years"},
            "sport_specific": {},
            "fitness": {"goals": ["Improve sports performance"]},
            "training": {},
            "availability": {},
            "location": {"city": "Hyderabad", "area": "Kukatpally", "radius_km": 10},
            "equipment": [],
            "coaching": {},
            "goals": ["Join a team"],
            "help_topics": ["Match discovery"],
            "stats": {},
            "profile_completion": 50
        }
    return serialize_doc(prof)


@router.put("/profile")
def update_onboarding_profile(
    profile_in: OnboardingProfileUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Full edit endpoint to modify stored sports and fitness onboarding data."""
    prof = db.onboarding_profiles.find_one({"user_id": current_user.id})
    if not prof:
        prof = {
            "user_id": current_user.id,
            "created_at": datetime.utcnow()
        }
        res = db.onboarding_profiles.insert_one(prof)
        prof["_id"] = res.inserted_id

    update_data = profile_in.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    db.onboarding_profiles.update_one({"_id": prof["_id"]}, {"$set": update_data})
    
    updated_prof = db.onboarding_profiles.find_one({"_id": prof["_id"]})
    completion_pct = calculate_completion_percentage(updated_prof)
    db.onboarding_profiles.update_one({"_id": prof["_id"]}, {"$set": {"profile_completion": completion_pct}})
    updated_prof["profile_completion"] = completion_pct

    # Ensure profile_completed flag is set
    db.users.update_one({"_id": to_object_id(current_user.id)}, {"$set": {"profile_completed": True, "updated_at": datetime.utcnow()}})
    
    # Sync with athlete_profiles & athlete_sports
    sync_onboarding_to_athlete_profile(db, current_user.id, updated_prof, current_user.name)

    return {
        "status": "success",
        "profile_completion": completion_pct,
        "profile": serialize_doc(updated_prof)
    }
