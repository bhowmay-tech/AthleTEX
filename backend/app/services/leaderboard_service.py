from bson import ObjectId
from app.core.database import serialize_doc

class LeaderboardService:
    @staticmethod
    def get_rankings(db, sport_name: str, location: str = None):
        """
        Retrieve deterministic leaderboard rankings for a sport.
        Rankings are sorted by athlete rating descending.
        """
        # Fetch all sports matching sport_name (case-insensitive)
        sports = list(db.athlete_sports.find({
            "sport_name": {"$regex": f"^{sport_name}$", "$options": "i"}
        }).sort("rating", -1))
        
        leaderboard = []
        rank_idx = 1
        
        for sport_entry in sports:
            athlete_id = sport_entry.get("athlete_id")
            if not athlete_id:
                continue
                
            # Fetch profile
            profile = db.athlete_profiles.find_one({"_id": ObjectId(athlete_id)})
            if not profile:
                continue
                
            # Filter by location if specified
            if location:
                prof_loc = profile.get("location", "") or ""
                if location.lower() not in prof_loc.lower():
                    continue
                    
            # Fetch user
            user_id = profile.get("user_id")
            if not user_id:
                continue
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                continue
                
            stats = sport_entry.get("stats") or {}
            wins = stats.get("wins", stats.get("Wins", 0))
            matches_count = stats.get("matches", stats.get("Matches", 0))
            
            leaderboard.append({
                "rank": rank_idx,
                "athlete_id": str(user["_id"]),
                "name": user.get("name"),
                "sport": sport_entry.get("sport_name"),
                "rating": sport_entry.get("rating"),
                "skill": sport_entry.get("skill_level"),
                "location": profile.get("location"),
                "wins": wins,
                "matches": matches_count,
                "avatar_url": profile.get("avatar_url"),
                "verified": profile.get("verified", False)
            })
            rank_idx += 1
            
        return leaderboard
