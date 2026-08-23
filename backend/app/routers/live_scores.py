from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from typing import List, Dict, Any
from app.core.database import get_db
import json
import asyncio

router = APIRouter(tags=["Live Scores"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

DEFAULT_LIVE_MATCHES = [
  {
    "match_id": "live_101",
    "sport": "Cricket",
    "teams": "IND vs AUS",
    "score": "184/4 (18.2 ov)",
    "status": "LIVE",
    "venue": "Uppal Stadium, Hyderabad",
    "summary": "India need 12 runs off 10 balls"
  },
  {
    "match_id": "live_102",
    "sport": "Football",
    "teams": "Hyderabad FC vs Bengaluru FC",
    "score": "2 - 1",
    "status": "LIVE 74'",
    "venue": "Gachibowli Stadium, Hyderabad",
    "summary": "Chhetri header saved by Kattimani"
  },
  {
    "match_id": "live_103",
    "sport": "Badminton",
    "teams": "P.V. Sindhu vs C. Marin",
    "score": "21-19, 18-21, 14-11",
    "status": "SET 3",
    "venue": "Pullela Gopichand Academy",
    "summary": "Deciding game in progress"
  }
]

@router.get("/live-scores")
def get_live_scores(db = Depends(get_db)):
    # Retrieve live matches from database or return default active fixtures
    db_matches = list(db.matches.find({"status": "LIVE"}))
    if not db_matches:
        return DEFAULT_LIVE_MATCHES
    
    result = []
    for m in db_matches:
        result.append({
            "match_id": str(m["_id"]),
            "sport": m.get("sport", "Cricket"),
            "teams": m.get("title", "Match"),
            "score": m.get("score", "In Progress"),
            "status": "LIVE",
            "venue": m.get("venue", "Stadium"),
            "summary": m.get("format", "Live Match")
        })
    return result

@router.get("/live-scores/{match_id}")
def get_live_match(match_id: str, db = Depends(get_db)):
    for m in DEFAULT_LIVE_MATCHES:
        if m["match_id"] == match_id:
            return m
    raise HTTPException(status_code=404, detail="Live match not found")

@router.websocket("/ws/live-scores")
async def websocket_live_scores(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial data
        await websocket.send_text(json.dumps({
            "type": "INITIAL_DATA",
            "matches": DEFAULT_LIVE_MATCHES
        }))
        while True:
            # Keep connection open and broadcast periodic score ticks
            await asyncio.sleep(10)
            await websocket.send_text(json.dumps({
                "type": "SCORE_UPDATE",
                "timestamp": asyncio.get_event_loop().time(),
                "matches": DEFAULT_LIVE_MATCHES
            }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
