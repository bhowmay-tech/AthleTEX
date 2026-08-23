from fastapi import APIRouter, Depends, Query
from app.core.database import get_db

router = APIRouter(tags=["Search"])

@router.get("/search")
def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    db = Depends(get_db)
):
    query_regex = {"$regex": q, "$options": "i"}

    # Search athletes / users
    user_results = list(db.users.find({
        "$or": [
            {"name": query_regex},
            {"email": query_regex},
            {"role": query_regex}
        ]
    }, {"hashed_password": 0}).limit(5))

    formatted_users = []
    for u in user_results:
        formatted_users.append({
            "id": str(u["_id"]),
            "type": "athlete",
            "title": u.get("name", "Athlete"),
            "subtitle": u.get("role", "Athlete").capitalize(),
            "url": f"#profile"
        })

    # Search matches
    match_results = list(db.matches.find({
        "$or": [
            {"title": query_regex},
            {"sport": query_regex},
            {"venue": query_regex}
        ]
    }).limit(5))

    formatted_matches = []
    for m in match_results:
        formatted_matches.append({
            "id": str(m["_id"]),
            "type": "match",
            "title": m.get("title", "Match"),
            "subtitle": f"{m.get('sport', 'Sports')} · {m.get('venue', 'Local venue')}",
            "url": f"#play"
        })

    # Search tournaments
    tour_results = list(db.tournaments.find({
        "$or": [
            {"name": query_regex},
            {"sport": query_regex},
            {"location": query_regex}
        ]
    }).limit(5))

    formatted_tours = []
    for t in tour_results:
        formatted_tours.append({
            "id": str(t["_id"]),
            "type": "tournament",
            "title": t.get("name", "Tournament"),
            "subtitle": f"{t.get('sport', 'Sports')} · {t.get('location', 'Venue')}",
            "url": f"#play"
        })

    # Search teams
    team_results = list(db.teams.find({
        "$or": [
            {"name": query_regex},
            {"sport": query_regex},
            {"location": query_regex}
        ]
    }).limit(5))

    formatted_teams = []
    for tm in team_results:
        formatted_teams.append({
            "id": str(tm["_id"]),
            "type": "team",
            "title": tm.get("name", "Team"),
            "subtitle": f"{tm.get('sport', 'Sports')} · {tm.get('location', 'Location')}",
            "url": f"#play"
        })

    return {
        "query": q,
        "results": formatted_users + formatted_matches + formatted_tours + formatted_teams
    }
