from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# Auth / Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[str] = None

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthInput(BaseModel):
    credential: Optional[str] = None
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None
    role: Optional[str] = "athlete"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    confirm_password: Optional[str] = None
    role: str = "athlete" # "athlete", "mentor"

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    profile_completed: bool = False
    onboarding_step: int = 1
    is_active: bool

    class Config:
        from_attributes = True

# Onboarding Schemas
class OnboardingStepSave(BaseModel):
    step: int
    data: Dict[str, Any] = Field(default_factory=dict)

class OnboardingStatusResponse(BaseModel):
    profile_completed: bool
    onboarding_step: int
    profile_completion: int
    user_id: str
    user_name: str
    user_email: str
    profile: Optional[Dict[str, Any]] = None

class OnboardingProfileUpdate(BaseModel):
    sports: Optional[Dict[str, Any]] = None
    experience: Optional[Dict[str, Any]] = None
    sport_specific: Optional[Dict[str, Any]] = None
    fitness: Optional[Dict[str, Any]] = None
    training: Optional[Dict[str, Any]] = None
    availability: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    equipment: Optional[List[str]] = None
    coaching: Optional[Dict[str, Any]] = None
    goals: Optional[List[str]] = None
    help_topics: Optional[List[str]] = None
    stats: Optional[Dict[str, Any]] = None
    profile_completion: Optional[int] = None


# Profile Schemas
class AthleteProfileUpdate(BaseModel):
    sport: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skill_rating: Optional[int] = None
    pace: Optional[int] = None
    shooting: Optional[int] = None
    passing: Optional[int] = None
    dribbling: Optional[int] = None
    defense: Optional[int] = None
    physical: Optional[int] = None
    avatar_url: Optional[str] = None
    availability: Optional[Dict[str, bool]] = None

class AthleteProfileResponse(BaseModel):
    id: str
    user_id: str
    sport: str
    age: int
    height: float
    weight: float
    location: str
    bio: str
    skill_rating: int
    pace: int
    shooting: int
    passing: int
    dribbling: int
    defense: int
    physical: int
    verified: bool
    qr_code: str
    avatar_url: str
    shareable_url: str
    availability: Dict[str, bool] = Field(default_factory=dict)

    class Config:
        from_attributes = True

class MentorProfileUpdate(BaseModel):
    specialty: Optional[str] = None
    credentials: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class MentorProfileResponse(BaseModel):
    id: str
    user_id: str
    specialty: str
    credentials: str
    company: str
    location: str
    bio: str
    avatar_url: str

    class Config:
        from_attributes = True

# Video Schemas
class VideoCreate(BaseModel):
    video_type: str  # "motion_guard", "match_lens", "general"
    title: str
    description: Optional[str] = ""

class VideoResponse(BaseModel):
    id: str
    uploader_id: str
    video_type: str
    title: str
    description: str
    filepath: str
    thumbnail_url: str
    created_at: datetime

    class Config:
        from_attributes = True

# Report Schemas
class ReportResponse(BaseModel):
    id: str
    video_id: Optional[str] = None
    user_id: str
    report_type: str
    safety_score: int
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Application Schemas
class ApplicationCreate(BaseModel):
    target_entity: str
    type: str  # "academy", "club", "university", "scholarship"
    applied_role: str

class ApplicationResponse(BaseModel):
    id: str
    athlete_id: str
    target_entity: str
    type: str
    status: str
    applied_role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Message Schemas
class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

# Achievement Schemas
class AchievementCreate(BaseModel):
    title: str
    organization: str
    certificate_url: Optional[str] = ""

class AchievementResponse(BaseModel):
    id: str
    athlete_id: str
    title: str
    organization: str
    date_earned: datetime
    certificate_url: str

    class Config:
        from_attributes = True

# CommunityPost Schemas
class CommunityPostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = ""
    category: Optional[str] = "General"

class CommunityPostResponse(BaseModel):
    id: str
    author_id: str
    title: str
    content: str
    image_url: str
    category: str
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True

# AI Coach interaction schemas
class CoachMessageInput(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

# ==================== NEW SCHEMAS ====================

# AthleteSport Schemas
class AthleteSportBase(BaseModel):
    sport_name: str
    skill_level: str = "Intermediate"
    rating: int = 75
    is_primary: bool = False
    stats: Dict[str, Any] = Field(default_factory=dict)

class AthleteSportCreate(AthleteSportBase):
    pass

class AthleteSportUpdate(BaseModel):
    skill_level: Optional[str] = None
    rating: Optional[int] = None
    is_primary: Optional[bool] = None
    stats: Optional[Dict[str, Any]] = None

class AthleteSportResponse(AthleteSportBase):
    id: str
    athlete_id: str

    class Config:
        from_attributes = True

# Settings Schemas
class UserSettingResponse(BaseModel):
    id: str
    user_id: str
    profile_visibility: str
    show_location: bool
    show_rating: bool
    match_notifications: bool
    event_notifications: bool
    message_notifications: bool
    ai_coach_updates: bool
    reduced_motion: bool

    class Config:
        from_attributes = True

class UserSettingUpdate(BaseModel):
    profile_visibility: Optional[str] = None
    show_location: Optional[bool] = None
    show_rating: Optional[bool] = None
    match_notifications: Optional[bool] = None
    event_notifications: Optional[bool] = None
    message_notifications: Optional[bool] = None
    ai_coach_updates: Optional[bool] = None
    reduced_motion: Optional[bool] = None

# Match Participant Nested Schema
class ParticipantUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class MatchParticipantResponse(BaseModel):
    id: str
    match_id: str
    user_id: str
    joined_at: datetime
    status: str
    user: ParticipantUserResponse

    class Config:
        from_attributes = True

# Match Schemas
class MatchCreate(BaseModel):
    title: str
    sport: str
    location: str
    venue: str
    date: str
    start_time: str
    end_time: str
    skill_level: str = "Intermediate"
    max_players: int = 10
    description: Optional[str] = ""

class MatchResponse(BaseModel):
    id: str
    title: str
    sport: str
    organizer_id: str
    location: str
    venue: str
    date: str
    start_time: str
    end_time: str
    skill_level: str
    max_players: int
    status: str
    description: str
    score: str
    winner_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    organizer: ParticipantUserResponse
    participants: List[MatchParticipantResponse] = []

    class Config:
        from_attributes = True

class MatchResultSubmit(BaseModel):
    score: str
    winner_id: Optional[str] = None

# Connection Schemas
class ConnectionResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    sender: ParticipantUserResponse
    receiver: ParticipantUserResponse

    class Config:
        from_attributes = True

# Team Member Schema
class TeamMemberResponse(BaseModel):
    id: str
    team_id: str
    user_id: str
    role: str
    joined_at: datetime
    status: str
    user: ParticipantUserResponse

    class Config:
        from_attributes = True

# Team Schemas
class TeamCreate(BaseModel):
    name: str
    sport: str
    description: Optional[str] = ""
    location: str
    logo: Optional[str] = ""

class TeamResponse(BaseModel):
    id: str
    name: str
    sport: str
    description: str
    location: str
    captain_id: str
    logo: str
    created_at: datetime
    captain: ParticipantUserResponse
    members: List[TeamMemberResponse] = []

    class Config:
        from_attributes = True

# Tournament Participant Schema
class TournamentParticipantResponse(BaseModel):
    id: str
    tournament_id: str
    user_id: Optional[str] = None
    team_id: Optional[str] = None
    registered_at: datetime
    status: str
    user: Optional[ParticipantUserResponse] = None
    team: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Tournament Match Schema
class TournamentMatchResponse(BaseModel):
    id: str
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
    status: str
    player1: Optional[ParticipantUserResponse] = None
    player2: Optional[ParticipantUserResponse] = None

    class Config:
        from_attributes = True

# Tournament Schemas
class TournamentCreate(BaseModel):
    name: str
    sport: str
    description: Optional[str] = ""
    location: str
    venue: str
    registration_start: datetime
    registration_end: datetime
    tournament_start: datetime
    tournament_end: datetime
    max_participants: int = 16
    entry_fee: float = 0.0
    prize_pool: Optional[str] = "Trophies"
    format: str = "Single elimination"

class TournamentResponse(BaseModel):
    id: str
    name: str
    sport: str
    description: str
    organizer_id: str
    location: str
    venue: str
    registration_start: datetime
    registration_end: datetime
    tournament_start: datetime
    tournament_end: datetime
    max_participants: int
    entry_fee: float
    prize_pool: str
    format: str
    status: str
    image: str
    created_at: datetime
    organizer: ParticipantUserResponse
    participants: List[TournamentParticipantResponse] = []
    matches: List[TournamentMatchResponse] = []

    class Config:
        from_attributes = True

class TournamentMatchScoreSubmit(BaseModel):
    score1: int
    score2: int

# Event Schemas
class EventCreate(BaseModel):
    name: str
    sport: str
    description: Optional[str] = ""
    date: str
    venue: str
    location: str
    max_participants: int = 100
    prize: Optional[str] = ""

class EventParticipantResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    registered_at: datetime
    user: ParticipantUserResponse

    class Config:
        from_attributes = True

class EventResponse(BaseModel):
    id: str
    name: str
    sport: str
    description: str
    date: str
    venue: str
    location: str
    max_participants: int
    prize: str
    created_at: datetime
    participants: List[EventParticipantResponse] = []

    class Config:
        from_attributes = True

# Notification Schema
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    icon: str
    text: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
