from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, Event, EventParticipant
from app.schemas.schemas import EventCreate, EventResponse

router = APIRouter(prefix="/events", tags=["Events"])

def hydrate_event(event_doc, db) -> dict:
    if not event_doc:
        return None
    event_id_str = str(event_doc["_id"])
    serialized = serialize_doc(event_doc)
    
    # Hydrate participants
    parts = list(db.event_participants.find({"event_id": event_id_str}))
    hydrated_parts = []
    for p in parts:
        p_ser = serialize_doc(p)
        u = db.users.find_one({"_id": ObjectId(p_ser["user_id"])})
        p_ser["user"] = serialize_doc(u) if u else None
        hydrated_parts.append(p_ser)
    serialized["participants"] = hydrated_parts
    return serialized

@router.get("/", response_model=List[EventResponse])
def list_events(
    sport: Optional[str] = None,
    db = Depends(get_db)
):
    query = {}
    if sport and sport != "All":
        query["sport"] = {"$regex": f"^{sport}$", "$options": "i"}
    events = list(db.events.find(query).sort("date", 1))
    return [hydrate_event(e, db) for e in events]

@router.post("/create", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    event_doc = {
        "name": event_in.name,
        "sport": event_in.sport,
        "description": event_in.description,
        "date": event_in.date,
        "venue": event_in.venue,
        "location": event_in.location,
        "max_participants": event_in.max_participants,
        "prize": event_in.prize,
        "created_at": datetime.utcnow()
    }
    res = db.events.insert_one(event_doc)
    event_doc["_id"] = res.inserted_id
    return hydrate_event(event_doc, db)

@router.post("/{event_id}/register", response_model=EventResponse)
def register_for_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    e_oid = to_object_id(event_id)
    event = db.events.find_one({"_id": e_oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Check if already registered
    existing = db.event_participants.find_one({
        "event_id": str(event_id),
        "user_id": current_user.id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
        
    # Check max capacity
    reg_count = db.event_participants.count_documents({"event_id": str(event_id)})
    if reg_count >= event.get("max_participants", 100):
        raise HTTPException(status_code=400, detail="This event is already full")
        
    db.event_participants.insert_one({
        "event_id": str(event_id),
        "user_id": current_user.id,
        "registered_at": datetime.utcnow()
    })
    
    # Notify user
    db.notifications.insert_one({
        "user_id": current_user.id,
        "icon": "🏆",
        "text": f"Successfully registered for official event: '{event.get('name')}'.",
        "is_read": False,
        "created_at": datetime.utcnow()
    })
    
    updated_event = db.events.find_one({"_id": e_oid})
    return hydrate_event(updated_event, db)
