from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.core.database import get_db
from app.services.leaderboard_service import LeaderboardService

router = APIRouter(prefix="/leaderboards", tags=["Leaderboards"])

@router.get("/")
def get_leaderboard(
    sport: str = "Cricket",
    location: Optional[str] = None,
    db = Depends(get_db)
):
    try:
        rankings = LeaderboardService.get_rankings(db, sport, location)
        return rankings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate leaderboard: {str(e)}")
