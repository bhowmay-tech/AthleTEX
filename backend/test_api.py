import sys
import os
import pytest
from fastapi.testclient import TestClient

# Set search path to include backend root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Point to an isolated test JSON DB file so tests never touch real data
os.environ["ATHLETEX_TEST_DB"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "athletex_test_db.json")

from app.core.database import FileMongoClient, get_db
from app.main import app
from app.services.motion_guard import MotionGuardService
from app.services.open_scout import OpenScoutService

# Create isolated test file DB
TEST_DB_FILE = os.environ["ATHLETEX_TEST_DB"]

def _get_test_db():
    file_client = FileMongoClient(TEST_DB_FILE)
    yield file_client["athletex_test"]

app.dependency_overrides[get_db] = _get_test_db
client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    # Remove test DB before tests start so we begin fresh
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
    yield
    # Optionally cleanup afterwards
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)


def test_api_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"


def test_cv_motion_guard_and_scout():
    telemetry = MotionGuardService.analyze_video("dummy_path.mp4", "sprint_check.mp4")
    assert telemetry["safety_score"] > 50
    assert len(telemetry["joint_telemetry"]) == 60
    assert "knee_extension" in telemetry["joint_telemetry"][0]["angles"]

    stats = {"pace": 90, "shooting": 80, "passing": 75, "dribbling": 85, "defense": 60, "physical": 80, "age": 18}
    report = OpenScoutService.generate_scouting_report("Test Winger", "Soccer", stats)
    assert report["overall_rating"] == 78  # Math output matches service calculation
    assert report["potential_rating"] >= 78


def test_auth_signup_login():
    # Signup user 1 (Organizer/Athlete)
    res1 = client.post("/api/v1/auth/signup", json={
        "email": "test_organizer@athletex.app",
        "password": "password123",
        "name": "Test Organizer",
        "role": "athlete"
    })
    assert res1.status_code == 201

    # Signup user 2 (Joiner/Athlete)
    res2 = client.post("/api/v1/auth/signup", json={
        "email": "test_joiner@athletex.app",
        "password": "password123",
        "name": "Test Joiner",
        "role": "athlete"
    })
    assert res2.status_code == 201

    # Signup user 3 (Extra/Athlete)
    res3 = client.post("/api/v1/auth/signup", json={
        "email": "test_extra@athletex.app",
        "password": "password123",
        "name": "Test Extra",
        "role": "athlete"
    })
    assert res3.status_code == 201

    # Login user 1
    login_res = client.post("/api/v1/auth/login", data={
        "username": "test_organizer@athletex.app",
        "password": "password123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # Get /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test_organizer@athletex.app"


def test_athlete_profile_and_stats():
    login_res = client.post("/api/v1/auth/login", data={
        "username": "test_organizer@athletex.app",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Profile is auto-created on signup
    profile_res = client.get("/api/v1/athletes/profile", headers=headers)
    assert profile_res.status_code == 200

    # Update profile
    update_res = client.put("/api/v1/athletes/profile", headers=headers, json={
        "age": 22,
        "location": "Madhapur, Hyderabad",
        "bio": "Competitive sprinter."
    })
    assert update_res.status_code == 200
    assert update_res.json()["age"] == 22
    assert update_res.json()["location"] == "Madhapur, Hyderabad"


def test_match_creation_join_limits():
    # Login organizer
    login_org = client.post("/api/v1/auth/login", data={"username": "test_organizer@athletex.app", "password": "password123"})
    org_headers = {"Authorization": f"Bearer {login_org.json()['access_token']}"}

    # Login joiner
    login_join = client.post("/api/v1/auth/login", data={"username": "test_joiner@athletex.app", "password": "password123"})
    join_headers = {"Authorization": f"Bearer {login_join.json()['access_token']}"}

    # Login extra
    login_extra = client.post("/api/v1/auth/login", data={"username": "test_extra@athletex.app", "password": "password123"})
    extra_headers = {"Authorization": f"Bearer {login_extra.json()['access_token']}"}

    # Create match with capacity = 2
    match_res = client.post("/api/v1/matches/create", headers=org_headers, json={
        "title": "Weekend 1v1 Basketball",
        "sport": "Basketball",
        "skill_level": "Intermediate",
        "date": "2026-09-01",
        "start_time": "18:00",
        "end_time": "19:00",
        "location": "Madhapur",
        "venue": "Indoor Court",
        "max_players": 2,
        "description": "Short 1v1 showdown."
    })
    assert match_res.status_code == 201
    match_id = match_res.json()["id"]

    # Joiner joins
    join_res = client.post(f"/api/v1/matches/{match_id}/join", headers=join_headers)
    assert join_res.status_code == 200

    # Duplicate join attempt
    dup_res = client.post(f"/api/v1/matches/{match_id}/join", headers=join_headers)
    assert dup_res.status_code == 400  # Already joined

    # Third player attempt (capacity full: organizer auto-joined + joiner = 2)
    cap_res = client.post(f"/api/v1/matches/{match_id}/join", headers=extra_headers)
    assert cap_res.status_code == 400  # Match is full


def test_tournament_bracket_progression():
    # Login organizer
    login_org = client.post("/api/v1/auth/login", data={"username": "test_organizer@athletex.app", "password": "password123"})
    org_headers = {"Authorization": f"Bearer {login_org.json()['access_token']}"}

    players_headers = []
    player_ids = []

    # Make 4th player
    client.post("/api/v1/auth/signup", json={"email": "player4@athletex.app", "password": "password123", "name": "Player Four", "role": "athlete"})

    emails = ["test_organizer@athletex.app", "test_joiner@athletex.app", "test_extra@athletex.app", "player4@athletex.app"]
    for email in emails:
        login = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
        tok = login.json()["access_token"]
        players_headers.append({"Authorization": f"Bearer {tok}"})
        me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tok}"})
        player_ids.append(me.json()["id"])

    # Create tournament
    tour_res = client.post("/api/v1/tournaments/create", headers=org_headers, json={
        "name": "Kukatpally Open 4v4",
        "sport": "Badminton",
        "max_participants": 4,
        "location": "Kukatpally",
        "venue": "Badminton Complex",
        "registration_start": "2026-08-20T00:00:00Z",
        "registration_end": "2026-08-25T00:00:00Z",
        "tournament_start": "2026-08-26T00:00:00Z",
        "tournament_end": "2026-08-28T00:00:00Z",
        "entry_fee": 100,
        "prize_pool": "Trophy",
        "description": "4-player knockout.",
        "format": "Single elimination"
    })
    assert tour_res.status_code == 201
    tour_id = tour_res.json()["id"]

    # Register and approve all 4 players
    for headers in players_headers:
        reg_res = client.post(f"/api/v1/tournaments/{tour_id}/register", headers=headers)
        assert reg_res.status_code == 200
        part_id = reg_res.json()["id"]

        app_res = client.post(f"/api/v1/tournaments/{tour_id}/approve/{part_id}", headers=org_headers)
        assert app_res.status_code == 200

    # Start tournament
    start_res = client.post(f"/api/v1/tournaments/{tour_id}/start", headers=org_headers)
    assert start_res.status_code == 200

    # Fetch bracket
    bracket_res = client.get(f"/api/v1/tournaments/{tour_id}/bracket", headers=org_headers)
    assert bracket_res.status_code == 200
    matches = bracket_res.json()

    assert len(matches) == 3
    r1_matches = [m for m in matches if m["round"] == 1]
    r2_matches = [m for m in matches if m["round"] == 2]
    assert len(r1_matches) == 2
    assert len(r2_matches) == 1

    # Submit score for first Round 1 match
    match_to_play = r1_matches[0]
    p1_id = match_to_play["player1_id"]
    p2_id = match_to_play["player2_id"]
    assert p1_id is not None
    assert p2_id is not None

    score_res = client.post(f"/api/v1/tournaments/match/{match_to_play['id']}/score", headers=org_headers, json={
        "score1": 21,
        "score2": 18
    })
    assert score_res.status_code == 200

    # Verify player 1 progressed to finals
    updated_bracket_res = client.get(f"/api/v1/tournaments/{tour_id}/bracket", headers=org_headers)
    updated_matches = updated_bracket_res.json()
    r2_match = [m for m in updated_matches if m["round"] == 2][0]

    assert r2_match["player1_id"] == p1_id or r2_match["player2_id"] == p1_id

def test_google_auth():
    res = client.post("/api/v1/auth/google", json={
        "email": "test.google.user@athletex.app",
        "name": "Google Test Athlete",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
        "google_id": "google_123456",
        "role": "athlete"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Verify user profile was created and can be fetched
    token = data["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user_info = me_res.json()
    assert user_info["email"] == "test.google.user@athletex.app"
    assert user_info["name"] == "Google Test Athlete"

def test_google_auth_service_retrieval():
    from app.services.google_auth_service import GoogleAuthService
    # Test fallback retrieval with mock / empty token
    result = GoogleAuthService.verify_and_retrieve_google_user(credential="mock_token_123")
    assert isinstance(result, dict)


