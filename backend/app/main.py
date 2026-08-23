import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, athletes, mentors, ai, messaging, matches, tournaments, teams, events, connections, notifications, leaderboards, community, onboarding, search, live_scores, settings as settings_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AthleTEX AI-Powered Sports Intelligence API Platform Backend",
    version="2.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API endpoints
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(onboarding.router, prefix=settings.API_V1_STR)
app.include_router(athletes.router, prefix=settings.API_V1_STR)
app.include_router(mentors.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(messaging.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)
app.include_router(tournaments.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(connections.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(leaderboards.router, prefix=settings.API_V1_STR)
app.include_router(community.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(live_scores.router, prefix=settings.API_V1_STR)
app.include_router(live_scores.router) # Allows /ws/live-scores
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_db_client():
    from app.core.database import db
    db.users.create_index("email", unique=True)
    db.match_participants.create_index([("match_id", 1), ("user_id", 1)], unique=True)
    db.tournament_participants.create_index([("tournament_id", 1), ("user_id", 1)], unique=True)
    db.team_members.create_index([("team_id", 1), ("user_id", 1)], unique=True)
    db.post_likes.create_index([("post_id", 1), ("user_id", 1)], unique=True)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "database": "connected",
        "ai": "configured" if getattr(settings, "AI_API_KEY", None) else "ready_fallback",
        "version": "2.0.0"
    }

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AthleTEX Sports Intelligence Core API",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

