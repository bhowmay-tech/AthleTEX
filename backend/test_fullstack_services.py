import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

TEST_DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "athletex_fullstack_test_db.json")
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

def test_health_check_endpoint():
    """Verify GET /health returns status, database, and version."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "version" in data

def test_search_and_live_scores():
    """Verify global search and live scores endpoints."""
    # 1. Signup athlete
    res = client.post("/api/v1/auth/signup", json={
        "name": "Virat Sharma",
        "email": "virat@example.com",
        "password": "pass",
        "role": "athlete"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Search query
    search_res = client.get("/api/v1/search?q=Virat", headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert "results" in search_data
    assert any("Virat" in r["title"] for r in search_data["results"])

    # 3. Live scores
    live_res = client.get("/api/v1/live-scores", headers=headers)
    assert live_res.status_code == 200
    scores = live_res.json()
    assert len(scores) > 0
    assert "teams" in scores[0]
    assert "score" in scores[0]

def test_ai_coach_and_reports():
    """Verify AI Coach contextual responses, scouting, and reports listing."""
    res = client.post("/api/v1/auth/signup", json={
        "name": "Smriti Mandhana",
        "email": "smriti@example.com",
        "password": "pass",
        "role": "athlete"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    # 1. AI Coach query
    coach_res = client.post("/api/v1/ai/coach", headers=headers, json={
        "message": "What drills can I do for batting against spin bowling?"
    })
    assert coach_res.status_code == 200
    coach_data = coach_res.json()
    assert "coach_response" in coach_data
    assert "engine" in coach_data

    # 2. OpenScout analysis
    scout_res = client.post(f"/api/v1/ai/open-scout/{user_id}", headers=headers)
    assert scout_res.status_code == 200
    scout_data = scout_res.json()
    assert "overall_rating" in scout_data
    assert scout_data["valuation_label"] == "ATHLETEX internal estimate"

    # 3. List AI reports
    rep_res = client.get("/api/v1/ai/reports", headers=headers)
    assert rep_res.status_code == 200
    reports = rep_res.json()
    assert len(reports) > 0
