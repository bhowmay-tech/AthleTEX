from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Match, MatchParticipant
from app.schemas.schemas import MatchCreate, MatchResponse, MatchResultSubmit

router = APIRouter(prefix="/matches", tags=["Matches"])

def hydrate_match(match_doc, db) -> dict:
    if not match_doc:
        return None
    match_id_str = str(match_doc["_id"])
    serialized = serialize_doc(match_doc)
    
    # Hydrate organizer
    org = db.users.find_one({"_id": ObjectId(serialized["organizer_id"])})
    serialized["organizer"] = serialize_doc(org) if org else None
    
    # Hydrate participants
    parts = list(db.match_participants.find({"match_id": match_id_str}))
    hydrated_parts = []
    for p in parts:
        p_ser = serialize_doc(p)
        u = db.users.find_one({"_id": ObjectId(p_ser["user_id"])})
        p_ser["user"] = serialize_doc(u) if u else None
        hydrated_parts.append(p_ser)
    serialized["participants"] = hydrated_parts
    return serialized

@router.get("/", response_model=List[MatchResponse])
def list_matches(
    sport: Optional[str] = None,
    location: Optional[str] = None,
    skill_level: Optional[str] = None,
    db = Depends(get_db)
):
    query = {}
    if sport and sport != "All":
        query["sport"] = {"$regex": f"^{sport}$", "$options": "i"}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if skill_level and skill_level != "All":
        query["skill_level"] = skill_level
        
    matches = list(db.matches.find(query).sort([("date", 1), ("start_time", 1)]))
    return [hydrate_match(m, db) for m in matches]

@router.post("/create", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def create_match(
    match_in: MatchCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    match_doc = {
        "title": match_in.title,
        "sport": match_in.sport,
        "organizer_id": current_user.id,
        "location": match_in.location,
        "venue": match_in.venue,
        "date": match_in.date,
        "start_time": match_in.start_time,
        "end_time": match_in.end_time,
        "skill_level": match_in.skill_level,
        "max_players": match_in.max_players,
        "status": "Open",
        "description": match_in.description,
        "score": "",
        "winner_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    res = db.matches.insert_one(match_doc)
    match_id_str = str(res.inserted_id)
    
    # Automatically add organizer as participant
    db.match_participants.insert_one({
        "match_id": match_id_str,
        "user_id": current_user.id,
        "joined_at": datetime.utcnow(),
        "status": "accepted"
    })
    
    match_doc["_id"] = res.inserted_id
    return hydrate_match(match_doc, db)

@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: str, db = Depends(get_db)):
    m_oid = to_object_id(match_id)
    match = db.matches.find_one({"_id": m_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return hydrate_match(match, db)

@router.post("/{match_id}/join", response_model=MatchResponse)
def join_match(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    m_oid = to_object_id(match_id)
    match = db.matches.find_one({"_id": m_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if match.get("status") in ["Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot join a completed or cancelled match")
        
    # Check if user is already a participant
    existing = db.match_participants.find_one({
        "match_id": str(match_id),
        "user_id": current_user.id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already joined this match")
        
    # Check max players limit
    participants_count = db.match_participants.count_documents({"match_id": str(match_id)})
    if participants_count >= match.get("max_players", 10):
        raise HTTPException(status_code=400, detail="This match is already full")
        
    db.match_participants.insert_one({
        "match_id": str(match_id),
        "user_id": current_user.id,
        "joined_at": datetime.utcnow(),
        "status": "accepted"
    })
    
    # Update match status if it is now full
    new_status = "Open"
    if participants_count + 1 >= match.get("max_players", 10):
        new_status = "Full"
        db.matches.update_one({"_id": m_oid}, {"$set": {"status": "Full"}})
        
    # Create notification for organizer
    if match.get("organizer_id") != current_user.id:
        db.notifications.insert_one({
            "user_id": str(match.get("organizer_id")),
            "icon": "⚽" if match.get("sport") == "Football" else "🏏" if match.get("sport") == "Cricket" else "🔔",
            "text": f"{current_user.name} joined your match: {match.get('title')}",
            "is_read": False,
            "created_at": datetime.utcnow()
        })
        
    updated_match = db.matches.find_one({"_id": m_oid})
    return hydrate_match(updated_match, db)

@router.post("/{match_id}/leave", response_model=MatchResponse)
def leave_match(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    m_oid = to_object_id(match_id)
    match = db.matches.find_one({"_id": m_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if match.get("organizer_id") == current_user.id:
        raise HTTPException(status_code=400, detail="Organizer cannot leave the match. You must cancel it instead.")
        
    participant = db.match_participants.find_one({
        "match_id": str(match_id),
        "user_id": current_user.id
    })
    
    if not participant:
        raise HTTPException(status_code=400, detail="You are not a participant in this match")
        
    db.match_participants.delete_one({"_id": participant["_id"]})
    
    # Update status back to Open if it was Full
    if match.get("status") == "Full":
        db.matches.update_one({"_id": m_oid}, {"$set": {"status": "Open"}})
        
    updated_match = db.matches.find_one({"_id": m_oid})
    return hydrate_match(updated_match, db)

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_match(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    m_oid = to_object_id(match_id)
    match = db.matches.find_one({"_id": m_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if match.get("organizer_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to cancel this match")
        
    db.matches.update_one({"_id": m_oid}, {"$set": {"status": "Cancelled"}})
    
    # Notify participants
    participants = list(db.match_participants.find({"match_id": str(match_id)}))
    for p in participants:
        p_user_id = p.get("user_id")
        if p_user_id != current_user.id:
            db.notifications.insert_one({
                "user_id": str(p_user_id),
                "icon": "❌",
                "text": f"Match '{match.get('title')}' has been cancelled by the organizer.",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
            
    return None

@router.post("/{match_id}/result", response_model=MatchResponse)
def submit_match_result(
    match_id: str,
    result_in: MatchResultSubmit,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    m_oid = to_object_id(match_id)
    match = db.matches.find_one({"_id": m_oid})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if match.get("organizer_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the organizer can submit match results")
        
    db.matches.update_one(
        {"_id": m_oid},
        {
            "$set": {
                "score": result_in.score,
                "winner_id": result_in.winner_id,
                "status": "Completed",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update winner stats
    if result_in.winner_id:
        winner_profile = db.athlete_profiles.find_one({"user_id": result_in.winner_id})
        if winner_profile:
            wp_id_str = str(winner_profile["_id"])
            sport_stat = db.athlete_sports.find_one({
                "athlete_id": wp_id_str,
                "sport_name": {"$regex": f"^{match.get('sport')}$", "$options": "i"}
            })
            if sport_stat:
                stats = dict(sport_stat.get("stats") or {})
                stats["wins"] = stats.get("wins", 0) + 1
                stats["matches"] = stats.get("matches", 0) + 1
                new_rating = min(99, sport_stat.get("rating", 75) + 1)
                db.athlete_sports.update_one(
                    {"_id": sport_stat["_id"]},
                    {"$set": {"stats": stats, "rating": new_rating}}
                )
                
    # Update other participants matches count
    participants = list(db.match_participants.find({"match_id": str(match_id)}))
    for p in participants:
        p_user_id = p.get("user_id")
        if p_user_id != result_in.winner_id:
            profile = db.athlete_profiles.find_one({"user_id": p_user_id})
            if profile:
                prof_id_str = str(profile["_id"])
                sport_stat = db.athlete_sports.find_one({
                    "athlete_id": prof_id_str,
                    "sport_name": {"$regex": f"^{match.get('sport')}$", "$options": "i"}
                })
                if sport_stat:
                    stats = dict(sport_stat.get("stats") or {})
                    stats["matches"] = stats.get("matches", 0) + 1
                    db.athlete_sports.update_one(
                        {"_id": sport_stat["_id"]},
                        {"$set": {"stats": stats}}
                    )
                    
        # Send completion notifications
        if p_user_id != current_user.id:
            db.notifications.insert_one({
                "user_id": str(p_user_id),
                "icon": "🏆",
                "text": f"Results submitted for match '{match.get('title')}': {result_in.score}",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
            
    updated_match = db.matches.find_one({"_id": m_oid})
    return hydrate_match(updated_match, db)
