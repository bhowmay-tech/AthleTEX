from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    email: str
    hashed_password: str
    name: str
    role: str = "athlete" # "athlete", "mentor", "admin"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = Field(default_factory=datetime.utcnow)
    profile_completed: bool = False
    onboarding_step: int = 1
    is_active: bool = True

class AthleteProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    sport: str = "Soccer"
    age: int = 24
    height: float = 180.0
    weight: float = 75.0
    location: str = "Los Angeles, CA"
    bio: str = ""
    skill_rating: int = 90
    pace: int = 80
    shooting: int = 80
    passing: int = 80
    dribbling: int = 80
    defense: int = 80
    physical: int = 80
    verified: bool = False
    qr_code: str = ""
    avatar_url: str = ""
    shareable_url: str = ""
    availability: Dict[str, bool] = Field(default_factory=dict)

class MentorProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    specialty: str = ""
    credentials: str = ""
    company: str = ""
    location: str = ""
    bio: str = ""
    avatar_url: str = ""

class AthleteSport(BaseModel):
    id: Optional[str] = None
    athlete_id: str
    sport_name: str
    skill_level: str = "Intermediate"
    rating: int = 75
    is_primary: bool = False
    stats: Dict[str, Any] = Field(default_factory=dict)

class Achievement(BaseModel):
    id: Optional[str] = None
    athlete_id: str
    title: str
    organization: str
    sport: str = ""
    achievement_type: str = "" # Trophy, Medal, Certificate
    date_earned: datetime = Field(default_factory=datetime.utcnow)
    certificate_url: str = ""

class Match(BaseModel):
    id: Optional[str] = None
    title: str
    sport: str
    organizer_id: str
    location: str
    venue: str
    date: str
    start_time: str
    end_time: str
    skill_level: str = "Intermediate"
    max_players: int = 10
    status: str = "Open" # Open, Full, Completed, Cancelled
    description: str = ""
    score: str = ""
    winner_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MatchParticipant(BaseModel):
    id: Optional[str] = None
    match_id: str
    user_id: str
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "accepted" # invited, accepted

class Tournament(BaseModel):
    id: Optional[str] = None
    name: str
    sport: str
    description: str = ""
    organizer_id: str
    location: str
    venue: str
    registration_start: datetime
    registration_end: datetime
    tournament_start: datetime
    tournament_end: datetime
    max_participants: int = 16
    entry_fee: float = 0.0
    prize_pool: str = "Trophy"
    format: str = "Single elimination"
    status: str = "Upcoming" # Upcoming, Registration Open, Live, Completed, Cancelled
    image: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TournamentParticipant(BaseModel):
    id: Optional[str] = None
    tournament_id: str
    user_id: Optional[str] = None
    team_id: Optional[str] = None
    registered_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "Pending" # Pending, Approved, Declined

class TournamentMatch(BaseModel):
    id: Optional[str] = None
    tournament_id: str
    round: int
    match_index: int
    player1_id: Optional[str] = None
    player2_id: Optional[str] = None
    player1_team_id: Optional[str] = None
    player2_team_id: Optional[str] = None
    score1: Optional[int] = None
    score2: Optional[int] = None
    winner_id: Optional[str] = None
    winner_team_id: Optional[str] = None
    next_match_id: Optional[str] = None
    next_match_slot: Optional[int] = None
    status: str = "Scheduled" # Scheduled, Completed

class Team(BaseModel):
    id: Optional[str] = None
    name: str
    sport: str
    description: str = ""
    location: str
    captain_id: str
    logo: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TeamMember(BaseModel):
    id: Optional[str] = None
    team_id: str
    user_id: str
    role: str = "Player" # Captain, Vice Captain, Player
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "Pending" # Pending, Approved, Declined

class Event(BaseModel):
    id: Optional[str] = None
    name: str
    sport: str
    description: str = ""
    date: str
    venue: str
    location: str
    max_participants: int = 100
    prize: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EventParticipant(BaseModel):
    id: Optional[str] = None
    event_id: str
    user_id: str
    registered_at: datetime = Field(default_factory=datetime.utcnow)

class Connection(BaseModel):
    id: Optional[str] = None
    sender_id: str
    receiver_id: str
    status: str = "Requested" # Requested, Accepted, Rejected, Blocked
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    id: Optional[str] = None
    user_id: str
    icon: str = "🔔"
    text: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserSetting(BaseModel):
    id: Optional[str] = None
    user_id: str
    profile_visibility: str = "Public"
    show_location: bool = True
    show_rating: bool = True
    match_notifications: bool = True
    event_notifications: bool = True
    message_notifications: bool = True
    ai_coach_updates: bool = True
    reduced_motion: bool = False

class CommunityPost(BaseModel):
    id: Optional[str] = None
    author_id: str
    title: str
    content: str
    image_url: str = ""
    category: str = "General"
    likes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Message(BaseModel):
    id: Optional[str] = None
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

class Video(BaseModel):
    id: Optional[str] = None
    uploader_id: str
    video_type: str
    title: str
    description: str = ""
    filepath: str
    thumbnail_url: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Report(BaseModel):
    id: Optional[str] = None
    video_id: Optional[str] = None
    user_id: str
    report_type: str
    safety_score: int
    data: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Application(BaseModel):
    id: Optional[str] = None
    athlete_id: str
    target_entity: str
    type: str
    status: str = "Pending"
    applied_role: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
