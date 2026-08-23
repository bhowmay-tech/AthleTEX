from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Tournament, TournamentParticipant, TournamentMatch, Team
from app.schemas.schemas import (
    TournamentCreate, TournamentResponse, TournamentParticipantResponse,
    TournamentMatchResponse, TournamentMatchScoreSubmit
)
from app.services.tournament_service import TournamentService

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

def hydrate_tournament(tour_doc, db) -> dict:
    if not tour_doc:
        return None
    tour_id_str = str(tour_doc["_id"])
    serialized = serialize_doc(tour_doc)
    
    # Hydrate organizer
    org = db.users.find_one({"_id": ObjectId(serialized["organizer_id"])})
    serialized["organizer"] = serialize_doc(org) if org else None
    
    # Hydrate participants
    parts = list(db.tournament_participants.find({"tournament_id": tour_id_str}))
    hydrated_parts = []
    for p in parts:
        p_ser = serialize_doc(p)
        if p_ser.get("user_id"):
            u = db.users.find_one({"_id": ObjectId(p_ser["user_id"])})
            p_ser["user"] = serialize_doc(u) if u else None
        else:
            p_ser["user"] = None
            
        if p_ser.get("team_id"):
            team = db.teams.find_one({"_id": ObjectId(p_ser["team_id"])})
            p_ser["team"] = serialize_doc(team) if team else None
        else:
            p_ser["team"] = None
            
        hydrated_parts.append(p_ser)
    serialized["participants"] = hydrated_parts
    
    # Hydrate matches
    t_matches = list(db.tournament_matches.find({"tournament_id": tour_id_str}))
    hydrated_matches = []
    for m in t_matches:
        m_ser = serialize_doc(m)
        if m_ser.get("player1_id"):
            p1 = db.users.find_one({"_id": ObjectId(m_ser["player1_id"])})
            m_ser["player1"] = serialize_doc(p1) if p1 else None
        else:
            m_ser["player1"] = None
            
        if m_ser.get("player2_id"):
            p2 = db.users.find_one({"_id": ObjectId(m_ser["player2_id"])})
            m_ser["player2"] = serialize_doc(p2) if p2 else None
        else:
            m_ser["player2"] = None
            
        hydrated_matches.append(m_ser)
    serialized["matches"] = hydrated_matches
    
    return serialized

@router.get("/", response_model=List[TournamentResponse])
def list_tournaments(
    sport: Optional[str] = None,
    location: Optional[str] = None,
    db = Depends(get_db)
):
    query = {}
    if sport and sport != "All":
        query["sport"] = {"$regex": f"^{sport}$", "$options": "i"}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
        
    tournaments = list(db.tournaments.find(query).sort("tournament_start", 1))
    return [hydrate_tournament(t, db) for t in tournaments]

@router.post("/create", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_tournament(
    tour_in: TournamentCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    tour_doc = {
        "name": tour_in.name,
        "sport": tour_in.sport,
        "description": tour_in.description,
        "organizer_id": current_user.id,
        "location": tour_in.location,
        "venue": tour_in.venue,
        "registration_start": tour_in.registration_start,
        "registration_end": tour_in.registration_end,
        "tournament_start": tour_in.tournament_start,
        "tournament_end": tour_in.tournament_end,
        "max_participants": tour_in.max_participants,
        "entry_fee": tour_in.entry_fee,
        "prize_pool": tour_in.prize_pool,
        "format": tour_in.format,
        "status": "Upcoming",
        "image": "",
        "created_at": datetime.utcnow()
    }
    res = db.tournaments.insert_one(tour_doc)
    tour_doc["_id"] = res.inserted_id
    return hydrate_tournament(tour_doc, db)

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(tournament_id: str, db = Depends(get_db)):
    t_oid = to_object_id(tournament_id)
    tour = db.tournaments.find_one({"_id": t_oid})
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return hydrate_tournament(tour, db)

@router.post("/{tournament_id}/register", response_model=TournamentParticipantResponse)
def register_for_tournament(
    tournament_id: str,
    team_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    t_oid = to_object_id(tournament_id)
    tournament = db.tournaments.find_one({"_id": t_oid})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    # Check if registration is already full
    approved_count = db.tournament_participants.count_documents({
        "tournament_id": str(tournament_id),
        "status": "Approved"
    })
    if approved_count >= tournament.get("max_participants", 16):
        raise HTTPException(status_code=400, detail="Tournament registration is full")
        
    # Check duplicate
    dup_query = {"tournament_id": str(tournament_id)}
    if team_id:
        dup_query["team_id"] = team_id
    else:
        dup_query["user_id"] = current_user.id
        
    existing = db.tournament_participants.find_one(dup_query)
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this tournament")
        
    part_doc = {
        "tournament_id": str(tournament_id),
        "user_id": None if team_id else current_user.id,
        "team_id": team_id,
        "status": "Approved" if tournament.get("organizer_id") == current_user.id else "Pending",
        "registered_at": datetime.utcnow()
    }
    res = db.tournament_participants.insert_one(part_doc)
    part_doc["id"] = str(res.inserted_id)
    
    # Notify organizer
    db.notifications.insert_one({
        "user_id": str(tournament.get("organizer_id")),
        "icon": "🏆",
        "text": f"{current_user.name} registered for your tournament '{tournament.get('name')}'.",
        "is_read": False,
        "created_at": datetime.utcnow()
    })
    
    # Return serializable dict
    p_ser = serialize_doc(part_doc)
    p_ser["user"] = serialize_doc(db.users.find_one({"_id": ObjectId(current_user.id)})) if not team_id else None
    p_ser["team"] = serialize_doc(db.teams.find_one({"_id": ObjectId(team_id)})) if team_id else None
    return p_ser

@router.post("/{tournament_id}/approve/{participant_id}", response_model=TournamentParticipantResponse)
def approve_registration(
    tournament_id: str,
    participant_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    t_oid = to_object_id(tournament_id)
    tournament = db.tournaments.find_one({"_id": t_oid})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    if tournament.get("organizer_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the organizer can approve tournament registrations")
        
    p_oid = to_object_id(participant_id)
    participant = db.tournament_participants.find_one({
        "_id": p_oid,
        "tournament_id": str(tournament_id)
    })
    if not participant:
        raise HTTPException(status_code=404, detail="Registration record not found")
        
    db.tournament_participants.update_one(
        {"_id": p_oid},
        {"$set": {"status": "Approved"}}
    )
    
    # Notify user/team
    target_user_id = participant.get("user_id")
    if not target_user_id and participant.get("team_id"):
        team = db.teams.find_one({"_id": ObjectId(participant["team_id"])})
        if team:
            target_user_id = team.get("captain_id")
            
    if target_user_id:
        db.notifications.insert_one({
            "user_id": str(target_user_id),
            "icon": "🏆",
            "text": f"Your registration for '{tournament.get('name')}' has been approved!",
            "is_read": False,
            "created_at": datetime.utcnow()
        })
        
    updated = db.tournament_participants.find_one({"_id": p_oid})
    p_ser = serialize_doc(updated)
    if p_ser.get("user_id"):
        p_ser["user"] = serialize_doc(db.users.find_one({"_id": ObjectId(p_ser["user_id"])}))
    if p_ser.get("team_id"):
        p_ser["team"] = serialize_doc(db.teams.find_one({"_id": ObjectId(p_ser["team_id"])}))
    return p_ser

@router.post("/{tournament_id}/start", response_model=List[TournamentMatchResponse])
def start_tournament(
    tournament_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    t_oid = to_object_id(tournament_id)
    tournament = db.tournaments.find_one({"_id": t_oid})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    if tournament.get("organizer_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the organizer can start the tournament")
        
    try:
        rounds_matches = TournamentService.generate_bracket(db, tournament_id)
        # Flatten matches
        flat_matches = []
        for r in rounds_matches:
            for m in rounds_matches[r]:
                # Hydrate player1 and player2 info
                if m.get("player1_id"):
                    m["player1"] = serialize_doc(db.users.find_one({"_id": ObjectId(m["player1_id"])}))
                if m.get("player2_id"):
                    m["player2"] = serialize_doc(db.users.find_one({"_id": ObjectId(m["player2_id"])}))
                flat_matches.append(m)
        return flat_matches
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tournament_id}/bracket", response_model=List[TournamentMatchResponse])
def get_tournament_bracket(tournament_id: str, db = Depends(get_db)):
    matches = list(db.tournament_matches.find({
        "tournament_id": str(tournament_id)
    }).sort([("round", 1), ("match_index", 1)]))
    
    flat_matches = []
    for m in matches:
        m_ser = serialize_doc(m)
        if m_ser.get("player1_id"):
            m_ser["player1"] = serialize_doc(db.users.find_one({"_id": ObjectId(m_ser["player1_id"])}))
        if m_ser.get("player2_id"):
            m_ser["player2"] = serialize_doc(db.users.find_one({"_id": ObjectId(m_ser["player2_id"])}))
        flat_matches.append(m_ser)
    return flat_matches

@router.post("/match/{match_id}/score", response_model=TournamentMatchResponse)
def submit_tournament_match_score(
    match_id: str,
    score_in: TournamentMatchScoreSubmit,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    m_oid = to_object_id(match_id)
    tour_match = db.tournament_matches.find_one({"_id": m_oid})
    if not tour_match:
        raise HTTPException(status_code=404, detail="Tournament match not found")
        
    tournament = db.tournaments.find_one({"_id": ObjectId(tour_match.get("tournament_id"))})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    if tournament.get("organizer_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the tournament organizer can submit match scores")
        
    try:
        updated_match = TournamentService.submit_match_score(db, match_id, score_in.score1, score_in.score2)
        # Hydrate players
        if updated_match.get("player1_id"):
            updated_match["player1"] = serialize_doc(db.users.find_one({"_id": ObjectId(updated_match["player1_id"])}))
        if updated_match.get("player2_id"):
            updated_match["player2"] = serialize_doc(db.users.find_one({"_id": ObjectId(updated_match["player2_id"])}))
        return updated_match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
