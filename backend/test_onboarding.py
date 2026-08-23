import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

TEST_DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "athletex_onboarding_test_db.json")
os.environ["ATHLETEX_TEST_DB"] = TEST_DB_FILE

from app.core.database import FileMongoClient, get_db
from app.main import app
from app.core.config import settings

def _get_test_db():
    file_client = FileMongoClient(TEST_DB_FILE)
    yield file_client["athletex_test"]

app.dependency_overrides[get_db] = _get_test_db
client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
    yield
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

def test_demo_auth_signup_and_login_bypass():
    """Verify demo mode allows signup and login with any password and signs into existing accounts."""
    settings.AUTH_MODE = "demo"
    
    # 1. Signup new user
    res = client.post("/api/v1/auth/signup", json={
        "name": "Gagan",
        "email": "gagan@example.com",
        "password": "anything_password_1",
        "role": "athlete"
    })
    assert res.status_code == 201
    token1 = res.json()["access_token"]
    assert token1 is not None

    # 2. Signup again with same email -> Signs into existing account without 400 error
    res_dupe = client.post("/api/v1/auth/signup", json={
        "name": "Gagan",
        "email": "gagan@example.com",
        "password": "different_password_2",
        "role": "athlete"
    })
    assert res_dupe.status_code == 201
    assert res_dupe.json()["access_token"] is not None

    # 3. Login with any password in demo mode
    login_res = client.post("/api/v1/auth/login-json", json={
        "email": "gagan@example.com",
        "password": "totally_different_password"
    })
    assert login_res.status_code == 200
    assert login_res.json()["access_token"] is not None

def test_onboarding_7_steps_flow():
    """Verify saving all 7 steps of onboarding to MongoDB and completing profile."""
    # Authenticate user
    login_res = client.post("/api/v1/auth/login-json", json={
        "email": "gagan@example.com",
        "password": "any"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check initial onboarding status (profile_completed = False, step = 1)
    status_res = client.get("/api/v1/onboarding/status", headers=headers)
    assert status_res.status_code == 200
    st_data = status_res.json()
    assert st_data["profile_completed"] is False
    assert st_data["onboarding_step"] == 1

    # Step 1: Basic Sports
    s1 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 1,
        "data": {
            "primary_sport": "Cricket",
            "sports_played": ["Cricket", "Badminton"],
            "favorite_sport": "Cricket",
            "improvement_sport": "Badminton"
        }
    })
    assert s1.status_code == 200
    assert s1.json()["onboarding_step"] == 2

    # Step 2: Experience & Skill
    s2 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 2,
        "data": {
            "years": "3–5 years",
            "skill_level": "Intermediate",
            "frequency": "3–4 times per week",
            "location_type": "Local ground/court",
            "competition": "Sometimes"
        }
    })
    assert s2.status_code == 200

    # Step 3: Sport Specific
    s3 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 3,
        "data": {
            "sport_specific": {
                "cricket_role": "All-rounder",
                "bowling_style": "Medium pace",
                "batting_style": "Right-handed",
                "format": "T20"
            }
        }
    })
    assert s3.status_code == 200

    # Step 4: Fitness Profile
    s4 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 4,
        "data": {
            "fitness_goals": ["Build strength", "Improve sports performance"],
            "fitness_level": "Good",
            "exercise_days": "3–4",
            "session_duration": "60–90 minutes"
        }
    })
    assert s4.status_code == 200

    # Step 5: Training Preferences
    s5 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 5,
        "data": {
            "locations": ["Gym", "Outdoor"],
            "types": ["Strength training", "Sports drills"],
            "preferred_time": "Evening",
            "weekly_hours": "4–7",
            "equipment": ["Gym equipment", "Cricket ground"]
        }
    })
    assert s5.status_code == 200

    # Step 6: Goals & Location
    s6 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 6,
        "data": {
            "goals": ["Join a team", "Participate in tournaments"],
            "help_topics": ["Match discovery", "Tournament discovery"],
            "city": "Hyderabad",
            "area": "Kukatpally",
            "radius_km": 10,
            "stats": {"matches_played": 25, "runs": 480}
        }
    })
    assert s6.status_code == 200

    # Step 7: Availability & Complete Profile
    s7 = client.post("/api/v1/onboarding/step", headers=headers, json={
        "step": 7,
        "data": {
            "availability": {
                "Saturday": {"start": "08:00 AM", "end": "12:00 PM"},
                "Sunday": {"start": "04:00 PM", "end": "08:00 PM"}
            },
            "finish": True
        }
    })
    assert s7.status_code == 200
    assert s7.json()["profile_completed"] is True

    # Verify status after completion
    status_after = client.get("/api/v1/onboarding/status", headers=headers).json()
    assert status_after["profile_completed"] is True
    assert status_after["profile_completion"] >= 80

def test_edit_profile_persistence():
    """Verify editing profile updates stored data in MongoDB."""
    login_res = client.post("/api/v1/auth/login-json", json={
        "email": "gagan@example.com",
        "password": "any"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    edit_res = client.put("/api/v1/onboarding/profile", headers=headers, json={
        "sports": {"primary": "Badminton", "played": ["Badminton", "Cricket"]},
        "experience": {"skill_level": "Advanced", "frequency": "5+ times per week"},
        "fitness": {"goals": ["Improve endurance", "Increase speed"]},
        "location": {"city": "Hyderabad", "area": "Madhapur"}
    })
    assert edit_res.status_code == 200

    # Retrieve profile to verify changes persisted
    prof_res = client.get("/api/v1/onboarding/profile", headers=headers).json()
    assert prof_res["sports"]["primary"] == "Badminton"
    assert prof_res["experience"]["skill_level"] == "Advanced"
    assert prof_res["location"]["area"] == "Madhapur"
