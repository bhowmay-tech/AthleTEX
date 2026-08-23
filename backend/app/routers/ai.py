import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import Dict, Any, List
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, AthleteProfile, Video, Report
from app.schemas.schemas import CoachMessageInput, ReportResponse
from app.services.motion_guard import MotionGuardService
from app.services.match_lens import MatchLensService
from app.services.open_scout import OpenScoutService
from app.services.ai_coach import AICoachService
from app.services.ai_match_service import AIMatchService

router = APIRouter(prefix="/ai", tags=["AI Processing Modules"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/motion-guard", response_model=ReportResponse)
def run_motion_guard(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Upload a biomechanics analysis video. Run Pose calculations, knee/hip
    bending checks, and return a safety injury report.
    """
    file_location = os.path.join(UPLOAD_DIR, f"motion_guard_{current_user.id}_{file.filename}")
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    video_doc = {
        "uploader_id": current_user.id,
        "video_type": "motion_guard",
        "title": f"MotionGuard: {file.filename}",
        "description": "Biomechanical pose telemetry analysis video",
        "filepath": file_location,
        "created_at": datetime.utcnow()
    }
    res = db.videos.insert_one(video_doc)
    video_id_str = str(res.inserted_id)
    
    # Perform computer vision calculations
    analysis_results = MotionGuardService.analyze_video(file_location, file.filename)
    
    report_doc = {
        "video_id": video_id_str,
        "user_id": current_user.id,
        "report_type": "motion_guard",
        "safety_score": analysis_results["safety_score"],
        "data": analysis_results,
        "created_at": datetime.utcnow()
    }
    res_rep = db.reports.insert_one(report_doc)
    report_doc["_id"] = res_rep.inserted_id
    
    return serialize_doc(report_doc)

@router.post("/match-lens", response_model=ReportResponse)
def run_match_lens(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Upload match footage. Track speed, distance covered, build a heat-map,
    and tag strategic action highlights.
    """
    file_location = os.path.join(UPLOAD_DIR, f"match_lens_{current_user.id}_{file.filename}")
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    video_doc = {
        "uploader_id": current_user.id,
        "video_type": "match_lens",
        "title": f"MatchLens: {file.filename}",
        "description": "Tactical game tracking footage",
        "filepath": file_location,
        "created_at": datetime.utcnow()
    }
    res = db.videos.insert_one(video_doc)
    video_id_str = str(res.inserted_id)
    
    analysis_results = MatchLensService.analyze_match(file_location, file.filename)
    
    report_doc = {
        "video_id": video_id_str,
        "user_id": current_user.id,
        "report_type": "match_lens",
        "safety_score": 100,
        "data": analysis_results,
        "created_at": datetime.utcnow()
    }
    res_rep = db.reports.insert_one(report_doc)
    report_doc["_id"] = res_rep.inserted_id
    
    return serialize_doc(report_doc)

@router.post("/open-scout/{athlete_id}", response_model=Dict[str, Any])
def run_open_scout(
    athlete_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Run scouting intelligence on a specified athlete ID. Matches rating details
    and outputs potential development index and valuation.
    """
    if current_user.role not in ["mentor", "admin"] and current_user.id != athlete_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Scouting reports are restricted to authorized mentors or the profile owner."
        )
        
    athlete = db.users.find_one({"_id": to_object_id(athlete_id), "role": "athlete"})
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    profile = db.athlete_profiles.find_one({"user_id": athlete_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    stats = {
        "pace": profile.get("pace", 75),
        "shooting": profile.get("shooting", 75),
        "passing": profile.get("passing", 75),
        "dribbling": profile.get("dribbling", 75),
        "defense": profile.get("defense", 75),
        "physical": profile.get("physical", 75),
        "age": profile.get("age", 18)
    }
    
    report_data = OpenScoutService.generate_scouting_report(athlete.get("name"), profile.get("sport"), stats)
    
    report_doc = {
        "user_id": athlete_id,
        "report_type": "open_scout",
        "safety_score": 100,
        "data": report_data,
        "created_at": datetime.utcnow()
    }
    db.reports.insert_one(report_doc)
    
    return report_data

@router.post("/coach", response_model=Dict[str, Any])
def consult_ai_coach(
    input_data: CoachMessageInput,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Conversational AI coach. Responds to training, nutrition, tactics, drills, and recovery queries.
    """
    profile_context = {}
    if current_user.role == "athlete":
        profile = None
        try:
            profile = db.athlete_profiles.find_one({"user_id": current_user.id})
            if not profile:
                profile = db.athlete_profiles.find_one({"user_id": to_object_id(current_user.id)})
        except Exception:
            pass
            
        if profile:
            profile_context = {
                "name": current_user.name,
                "sport": profile.get("sport", "Cricket"),
                "height": profile.get("height", 175.0),
                "weight": profile.get("weight", 70.0),
                "overall_rating": profile.get("skill_rating", 75)
            }
            
    if not profile_context:
        profile_context = {
            "name": current_user.name,
            "role": current_user.role,
            "sport": "Cricket"
        }
        
    response = AICoachService.get_coach_response(input_data.message, profile_context)
    return response

@router.post("/player-match", response_model=List[dict])
def get_ai_player_matches(
    sport: str = "Cricket",
    skill: str = "Intermediate",
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get deterministic AI player matches based on current user context.
    """
    current_profile_dict = None
    try:
        current_profile_dict = db.athlete_profiles.find_one({"user_id": current_user.id})
        if not current_profile_dict:
            current_profile_dict = db.athlete_profiles.find_one({"user_id": to_object_id(current_user.id)})
    except Exception:
        pass
        
    if not current_profile_dict:
        current_profile_dict = {
            "_id": current_user.id,
            "id": current_user.id,
            "user_id": current_user.id,
            "name": current_user.name,
            "sport": sport or "Cricket",
            "location": "Kukatpally, Hyderabad",
            "skill_rating": 75,
            "pace": 75, "shooting": 75, "passing": 75, "dribbling": 75, "defense": 75, "physical": 75,
            "availability": {}
        }
        
    current_profile = AthleteProfile(**serialize_doc(current_profile_dict))
    
    # Get all other athlete profiles
    other_profiles_dict = list(db.athlete_profiles.find({"user_id": {"$ne": current_user.id}}))
    
    matches = []
    for profile_dict in other_profiles_dict:
        p_ser = serialize_doc(profile_dict)
        profile_id_str = str(p_ser.get("id") or p_ser.get("_id"))
        user_id_str = str(p_ser.get("user_id"))
        
        # Check if the player plays the requested sport
        sport_stat = None
        try:
            sport_stat = db.athlete_sports.find_one({
                "$or": [
                    {"athlete_id": profile_id_str},
                    {"athlete_id": user_id_str}
                ],
                "sport_name": {"$regex": f"^{sport}$", "$options": "i"}
            })
        except Exception:
            pass
            
        is_sport_match = False
        skill_level = skill or "Intermediate"
        rating = p_ser.get("skill_rating", 75)

        if sport_stat:
            is_sport_match = True
            skill_level = sport_stat.get("skill_level", skill_level)
            rating = sport_stat.get("rating", rating)
        elif p_ser.get("sport", "").lower() == (sport or "").lower() or not sport or sport.lower() == "all":
            is_sport_match = True
        elif isinstance(p_ser.get("sports"), list) and any(str(s).lower() == (sport or "").lower() for s in p_ser.get("sports", [])):
            is_sport_match = True
            
        if not is_sport_match:
            continue
            
        user = None
        try:
            user = db.users.find_one({"_id": to_object_id(user_id_str)})
        except Exception:
            pass
        if not user:
            user = db.users.find_one({"user_id": user_id_str}) or {"name": p_ser.get("name", "Athlete")}
            
        profile_obj = AthleteProfile(**p_ser)
        compatibility = AIMatchService.calculate_compatibility(current_profile, profile_obj)
        
        # Override sport alignment specifically since the query filters by sport
        compatibility["breakdown"]["sport"] = 100.0
        
        matches.append({
            "athlete_id": str(user_id_str),
            "name": user.get("name") or p_ser.get("name", "Athlete"),
            "sport": sport,
            "skill": skill_level,
            "rating": rating,
            "location": p_ser.get("location", "Hyderabad"),
            "avatar_url": p_ser.get("avatar_url"),
            "verified": p_ser.get("verified", False),
            "compatibility": compatibility["overall"],
            "breakdown": compatibility["breakdown"]
        })
        
    # Sort by compatibility descending
    matches.sort(key=lambda x: x["compatibility"], reverse=True)
    return matches[:5]

@router.get("/reports", response_model=List[Dict[str, Any]])
def get_user_ai_reports(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get all AI analysis reports for the authenticated user.
    """
    reports = list(db.reports.find({"user_id": current_user.id}).sort("created_at", -1))
    return serialize_docs(reports)

@router.get("/reports/{report_id}", response_model=Dict[str, Any])
def get_ai_report_by_id(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get a specific AI analysis report by ID.
    """
    report = db.reports.find_one({"_id": to_object_id(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.get("user_id") != current_user.id and current_user.role not in ["mentor", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return serialize_doc(report)

