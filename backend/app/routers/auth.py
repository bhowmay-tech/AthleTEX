from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta
# pyrefly: ignore [missing-import]
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.models import User
from app.schemas.schemas import UserCreate, Token, UserResponse, GoogleAuthInput, LoginInput
from app.services.google_auth_service import GoogleAuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user_dict = db.users.find_one({"email": email})
    if user_dict is None:
        raise credentials_exception
    return User(**serialize_doc(user_dict))

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db = Depends(get_db)):
    is_demo = settings.AUTH_MODE.lower() == "demo"
    db_user = db.users.find_one({"email": user_in.email})
    
    if db_user:
        # If user already exists, update last_login and sign into existing account
        db.users.update_one(
            {"_id": db_user["_id"]},
            {"$set": {"last_login": datetime.utcnow(), "updated_at": datetime.utcnow()}}
        )
        access_token = create_access_token(subject=user_in.email)
        return {"access_token": access_token, "token_type": "bearer"}
        
    hashed_password = get_password_hash(user_in.password)
    now = datetime.utcnow()
    user_doc = {
        "email": user_in.email,
        "hashed_password": hashed_password,
        "name": user_in.name,
        "role": user_in.role or "athlete",
        "created_at": now,
        "updated_at": now,
        "last_login": now,
        "profile_completed": False,
        "onboarding_step": 1,
        "is_active": True
    }
    res = db.users.insert_one(user_doc)
    user_id_str = str(res.inserted_id)

    # Initialize default settings
    user_settings = {
        "user_id": user_id_str,
        "profile_visibility": "Public",
        "show_location": True,
        "show_rating": True,
        "match_notifications": True,
        "event_notifications": True,
        "message_notifications": True,
        "ai_coach_updates": True,
        "reduced_motion": False
    }
    db.user_settings.insert_one(user_settings)

    # Initialize athlete profile
    if user_in.role == "athlete":
        profile = {
            "user_id": user_id_str,
            "sport": "Cricket",
            "age": 22,
            "height": 178.0,
            "weight": 72.0,
            "location": "Kukatpally, Hyderabad",
            "bio": "Competitive athlete striving for peak performance on AthleTEX.",
            "skill_rating": 88,
            "pace": 82,
            "shooting": 84,
            "passing": 80,
            "dribbling": 85,
            "defense": 78,
            "physical": 82,
            "verified": False,
            "qr_code": f"ATH-{user_id_str[:8].upper()}",
            "avatar_url": "",
            "shareable_url": f"/public/profile/{user_id_str}",
            "availability": {
                "Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True
            }
        }
        res_profile = db.athlete_profiles.insert_one(profile)
        profile_id_str = str(res_profile.inserted_id)
        
        cricket = {
            "athlete_id": profile_id_str,
            "sport_name": "Cricket",
            "skill_level": "Advanced",
            "rating": 91,
            "is_primary": True,
            "stats": {"runs": 1240, "wickets": 18, "matches": 54, "wins": 36}
        }
        db.athlete_sports.insert_one(cricket)
        
    elif user_in.role == "mentor":
        profile = {
            "user_id": user_id_str,
            "specialty": "Head Coach / Mentor",
            "credentials": "Certified Athletic Coach",
            "company": "Hyderabad Sports Academy",
            "location": "Hyderabad",
            "bio": "Mentoring young sports talent across Hyderabad.",
            "avatar_url": ""
        }
        db.mentor_profiles.insert_one(profile)
        
    access_token = create_access_token(subject=user_in.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    is_demo = settings.AUTH_MODE.lower() == "demo"
    email = form_data.username.strip()
    user = db.users.find_one({"email": email})
    
    if not user:
        if is_demo:
            # In demo mode, auto-create user for new email on login
            now = datetime.utcnow()
            name_part = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
            user_doc = {
                "email": email,
                "hashed_password": get_password_hash(form_data.password or "demo123"),
                "name": name_part,
                "role": "athlete",
                "created_at": now,
                "updated_at": now,
                "last_login": now,
                "profile_completed": False,
                "onboarding_step": 1,
                "is_active": True
            }
            res = db.users.insert_one(user_doc)
            user_id_str = str(res.inserted_id)
            user = db.users.find_one({"_id": res.inserted_id})
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )
    else:
        if not is_demo:
            if not verify_password(form_data.password, user.get("hashed_password")):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password"
                )
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow(), "updated_at": datetime.utcnow()}}
        )

    access_token = create_access_token(subject=email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
def login_json(login_in: LoginInput, db = Depends(get_db)):
    is_demo = settings.AUTH_MODE.lower() == "demo"
    email = login_in.email.strip()
    user = db.users.find_one({"email": email})
    
    if not user:
        if is_demo:
            now = datetime.utcnow()
            name_part = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
            user_doc = {
                "email": email,
                "hashed_password": get_password_hash(login_in.password or "demo123"),
                "name": name_part,
                "role": "athlete",
                "created_at": now,
                "updated_at": now,
                "last_login": now,
                "profile_completed": False,
                "onboarding_step": 1,
                "is_active": True
            }
            res = db.users.insert_one(user_doc)
            user_id_str = str(res.inserted_id)
            user = db.users.find_one({"_id": res.inserted_id})
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )
    else:
        if not is_demo:
            if not verify_password(login_in.password, user.get("hashed_password")):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password"
                )
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow(), "updated_at": datetime.utcnow()}}
        )

    access_token = create_access_token(subject=email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
def google_auth(auth_in: GoogleAuthInput, db = Depends(get_db)):
    """
    Python Google OAuth / Sign In endpoint.
    Retrieves and verifies Gmail user profile data from Google servers,
    persists new user/profile to database, and issues JWT access token.
    """
    email = auth_in.email
    name = auth_in.name
    avatar_url = auth_in.avatar_url or ""
    google_id = auth_in.google_id or ""

    # If a token/credential was passed, verify & retrieve live Google Gmail data
    if auth_in.credential:
        retrieved_data = GoogleAuthService.verify_and_retrieve_google_user(credential=auth_in.credential)
        if retrieved_data.get("email"):
            email = retrieved_data.get("email")
            name = retrieved_data.get("name") or name
            avatar_url = retrieved_data.get("avatar_url") or avatar_url
            google_id = retrieved_data.get("google_id") or google_id

    user_dict = db.users.find_one({"email": email})
    
    if not user_dict:
        # Create new user from Google Gmail profile
        user_doc = {
            "email": email,
            "hashed_password": get_password_hash(f"GOOGLE_{email}_{settings.SECRET_KEY[:8]}"),
            "name": name,
            "role": auth_in.role or "athlete",
            "google_id": google_id,
            "avatar_url": avatar_url,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        res = db.users.insert_one(user_doc)
        user_id_str = str(res.inserted_id)

        # Initialize default settings
        user_settings = {
            "user_id": user_id_str,
            "profile_visibility": "Public",
            "show_location": True,
            "show_rating": True,
            "match_notifications": True,
            "event_notifications": True,
            "message_notifications": True,
            "ai_coach_updates": True,
            "reduced_motion": False
        }
        db.user_settings.insert_one(user_settings)

        # Initialize athlete profile
        if auth_in.role != "mentor":
            profile = {
                "user_id": user_id_str,
                "sport": "Cricket",
                "age": 22,
                "height": 178.0,
                "weight": 72.0,
                "location": "Kukatpally, Hyderabad",
                "bio": "Competitive athlete on AthleTEX verified via Google.",
                "skill_rating": 89,
                "pace": 83,
                "shooting": 85,
                "passing": 82,
                "dribbling": 84,
                "defense": 79,
                "physical": 83,
                "verified": True,
                "qr_code": f"ATH-{user_id_str[:8].upper()}",
                "avatar_url": avatar_url,
                "shareable_url": f"/public/profile/{user_id_str}",
                "availability": {
                    "Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True
                }
            }
            res_profile = db.athlete_profiles.insert_one(profile)
            profile_id_str = str(res_profile.inserted_id)

            cricket = {
                "athlete_id": profile_id_str,
                "sport_name": "Cricket",
                "skill_level": "Advanced",
                "rating": 91,
                "is_primary": True,
                "stats": {"runs": 1240, "wickets": 18, "matches": 54, "wins": 36}
            }
            football = {
                "athlete_id": profile_id_str,
                "sport_name": "Football",
                "skill_level": "Intermediate",
                "rating": 85,
                "is_primary": False,
                "stats": {"goals": 24, "assists": 16, "matches": 42}
            }
            badminton = {
                "athlete_id": profile_id_str,
                "sport_name": "Badminton",
                "skill_level": "Intermediate",
                "rating": 80,
                "is_primary": False,
                "stats": {"matches": 28, "wins": 19, "win_rate": "68%"}
            }
            db.athlete_sports.insert_many([cricket, football, badminton])
        else:
            profile = {
                "user_id": user_id_str,
                "specialty": "Head Coach / Mentor",
                "credentials": "Certified Athletic Coach",
                "company": "Hyderabad Sports Academy",
                "location": "Hyderabad",
                "bio": "Mentoring young sports talent.",
                "avatar_url": avatar_url
            }
            db.mentor_profiles.insert_one(profile)
    else:
        # Update profile avatar/name if fresh data from Google
        update_fields = {}
        if avatar_url and user_dict.get("avatar_url") != avatar_url:
            update_fields["avatar_url"] = avatar_url
        if name and user_dict.get("name") != name:
            update_fields["name"] = name
        if update_fields:
            db.users.update_one({"_id": user_dict["_id"]}, {"$set": update_fields})

    access_token = create_access_token(subject=email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
