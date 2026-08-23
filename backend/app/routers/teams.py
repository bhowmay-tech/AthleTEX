from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Team, TeamMember
from app.schemas.schemas import TeamCreate, TeamResponse, TeamMemberResponse

router = APIRouter(prefix="/teams", tags=["Teams"])

def hydrate_team(team_doc, db) -> dict:
    if not team_doc:
        return None
    team_id_str = str(team_doc["_id"])
    serialized = serialize_doc(team_doc)
    
    # Hydrate captain
    captain = db.users.find_one({"_id": ObjectId(serialized["captain_id"])})
    serialized["captain"] = serialize_doc(captain) if captain else None
    
    # Hydrate members
    members = list(db.team_members.find({"team_id": team_id_str}))
    hydrated_members = []
    for m in members:
        m_ser = serialize_doc(m)
        u = db.users.find_one({"_id": ObjectId(m_ser["user_id"])})
        m_ser["user"] = serialize_doc(u) if u else None
        hydrated_members.append(m_ser)
    serialized["members"] = hydrated_members
    return serialized

def hydrate_member(member_doc, db) -> dict:
    if not member_doc:
        return None
    serialized = serialize_doc(member_doc)
    u = db.users.find_one({"_id": ObjectId(serialized["user_id"])})
    serialized["user"] = serialize_doc(u) if u else None
    return serialized

@router.get("/", response_model=List[TeamResponse])
def list_teams(
    sport: Optional[str] = None,
    location: Optional[str] = None,
    db = Depends(get_db)
):
    query = {}
    if sport and sport != "All":
        query["sport"] = {"$regex": f"^{sport}$", "$options": "i"}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
        
    teams = list(db.teams.find(query).sort("name", 1))
    return [hydrate_team(t, db) for t in teams]

@router.post("/create", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team_in: TeamCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Check if team name is already taken
    existing = db.teams.find_one({"name": {"$regex": f"^{team_in.name}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="Team name is already taken")
        
    team_doc = {
        "name": team_in.name,
        "sport": team_in.sport,
        "description": team_in.description,
        "location": team_in.location,
        "captain_id": current_user.id,
        "logo": team_in.logo or "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80",
        "created_at": datetime.utcnow()
    }
    res = db.teams.insert_one(team_doc)
    team_id_str = str(res.inserted_id)
    
    # Automatically add Captain as an approved TeamMember
    db.team_members.insert_one({
        "team_id": team_id_str,
        "user_id": current_user.id,
        "role": "Captain",
        "status": "Approved",
        "joined_at": datetime.utcnow()
    })
    
    team_doc["_id"] = res.inserted_id
    return hydrate_team(team_doc, db)

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, db = Depends(get_db)):
    t_oid = to_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return hydrate_team(team, db)

@router.post("/{team_id}/join", response_model=TeamMemberResponse)
def request_to_join_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    t_oid = to_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    # Check if already a member or pending request
    existing = db.team_members.find_one({
        "team_id": str(team_id),
        "user_id": current_user.id
    })
    
    if existing:
        if existing.get("status") == "Approved":
            raise HTTPException(status_code=400, detail="You are already a member of this team")
        else:
            raise HTTPException(status_code=400, detail="You have a pending join request for this team")
            
    member_doc = {
        "team_id": str(team_id),
        "user_id": current_user.id,
        "role": "Player",
        "status": "Pending",
        "joined_at": datetime.utcnow()
    }
    res = db.team_members.insert_one(member_doc)
    member_doc["_id"] = res.inserted_id
    
    # Notify captain
    db.notifications.insert_one({
        "user_id": str(team.get("captain_id")),
        "icon": "🤝",
        "text": f"{current_user.name} requested to join your team '{team.get('name')}'.",
        "is_read": False,
        "created_at": datetime.utcnow()
    })
    
    return hydrate_member(member_doc, db)

@router.post("/{team_id}/respond/{member_id}", response_model=TeamMemberResponse)
def respond_to_join_request(
    team_id: str,
    member_id: str,
    approve: bool,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    t_oid = to_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.get("captain_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the captain can approve join requests")
        
    m_oid = to_object_id(member_id)
    member = db.team_members.find_one({
        "_id": m_oid,
        "team_id": str(team_id)
    })
    
    if not member:
        raise HTTPException(status_code=404, detail="Member record not found")
        
    if approve:
        db.team_members.update_one(
            {"_id": m_oid},
            {"$set": {"status": "Approved"}}
        )
        # Notify user
        db.notifications.insert_one({
            "user_id": str(member.get("user_id")),
            "icon": "✅",
            "text": f"Your request to join team '{team.get('name')}' has been approved!",
            "is_read": False,
            "created_at": datetime.utcnow()
        })
        updated = db.team_members.find_one({"_id": m_oid})
        return hydrate_member(updated, db)
    else:
        db.team_members.delete_one({"_id": m_oid})
        # Notify user
        db.notifications.insert_one({
            "user_id": str(member.get("user_id")),
            "icon": "❌",
            "text": f"Your request to join team '{team.get('name')}' was declined.",
            "is_read": False,
            "created_at": datetime.utcnow()
        })
        # Return mock response representing declined status (deleted from DB)
        declined_doc = {
            "id": member_id,
            "team_id": team_id,
            "user_id": member.get("user_id"),
            "role": "Player",
            "joined_at": datetime.utcnow(),
            "status": "Declined"
        }
        return hydrate_member(declined_doc, db)

@router.post("/{team_id}/leave", response_model=dict)
def leave_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    t_oid = to_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.get("captain_id") == current_user.id:
        raise HTTPException(status_code=400, detail="Team captain cannot leave. You must pass captaincy or delete the team.")
        
    member = db.team_members.find_one({
        "team_id": str(team_id),
        "user_id": current_user.id
    })
    
    if not member:
        raise HTTPException(status_code=400, detail="You are not a member of this team")
        
    db.team_members.delete_one({"_id": member["_id"]})
    return {"status": "success", "message": f"Successfully left team '{team.get('name')}'"}
