import pytest
from fastapi.testclient import TestClient
from main import app
from database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_verify_known_student():
    response = client.get("/api/verify/123456789012")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Aarav Sharma"
    assert data["data"]["status"] == "verified"
    assert "encryptionStandard" in data["metadata"]

def test_verify_nonexistent_student():
    response = client.get("/api/verify/999999999999")
    assert response.status_code == 404
    assert response.status_code == 404

def test_update_student_status_and_audit():
    # Update to rejected
    res = client.post("/api/verify/123456789012/status", json={
        "status": "rejected",
        "actorEmail": "tester@aicte.gov.in",
        "role": "REGULATION_OFFICER",
        "reason": "Test audit action"
    })
    assert res.status_code == 200
    assert res.json()["data"]["status"] == "rejected"

    # Reset back to verified
    res2 = client.post("/api/verify/123456789012/status", json={
        "status": "verified",
        "actorEmail": "tester@aicte.gov.in",
        "role": "REGULATION_OFFICER",
        "reason": "Reinstated"
    })
    assert res2.status_code == 200
    assert res2.json()["data"]["status"] == "verified"

def test_college_stats_and_variance():
    response = client.get("/api/college/stats?collegeId=COL001")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["college"]["id"] == "COL001"
    assert data["intakeVariance"] == data["college"]["actualEnrolment"] - data["college"]["approvedIntake"]

def test_seat_ledger_pools():
    response = client.get("/api/seat-ledger?collegeId=COL001")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["summary"]["regularSeats"] > 0
    assert data["summary"]["tfwSupernumerary"] > 0

def test_cryptographic_audit_chain_verification():
    response = client.get("/api/aicte/verify-audit-chain")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["verification"]["valid"] is True
    assert data["verification"]["totalBlocks"] >= 5

def test_anomaly_isolation_forest_scores():
    response = client.get("/api/aicte/integrity-scores")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0
    for inst in data["data"]:
        assert 0 <= inst["integrityScore"] <= 100

def test_export_compliance_report():
    response = client.get("/api/aicte/export-excel")
    assert response.status_code == 200
    content = response.content.decode("utf-8-sig")
    assert "Institution Name" in content
    assert "Approved Intake" in content
    assert "Intake Variance" in content
