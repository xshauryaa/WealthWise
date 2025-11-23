import pytest
from fastapi.testclient import TestClient
from ml.api.main import app

client = TestClient(app)

def test_anomaly_route_empty_history():
    payload = {
        "user_id": "test_user",
        "current_transaction": {
            "merchant": "Steam", "amount": 500.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"
        },
        "history": [] 
    }
    res = client.post("/api/v1/detect-anomaly", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_anomaly"] is False
    assert "No history" in data["reasons"][0]

def test_categorize_invalid_amount():
    payload = {
        "merchant": "Starbucks",
        "amount": "NOT_A_NUMBER", 
        "date": "2024-01-01T10:00:00",
        "user_id": "test_user"
    }
    res = client.post("/api/v1/categorize", json=payload)
    assert res.status_code == 422
