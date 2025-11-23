import pytest
from fastapi.testclient import TestClient
from ml.api.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy", "service": "wealthwise-ml"}

def test_categorize_route():
    payload = {
        "merchant": "Starbucks",
        "amount": 5.50,
        "date": "2024-01-01T10:00:00",
        "user_id": "test_user",
        "iso_currency_code": "USD"
    }
    res = client.post("/api/v1/categorize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "Food"

def test_anomaly_route_with_history():
    # The model expects 'current_transaction' and 'history'
    # We ensure strict matching with ml/core/models.py
    payload = {
        "user_id": "test_user",
        "current_transaction": {
            "merchant": "Steam", "amount": 500.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"
        },
        "history": [
            {"merchant": "Steam", "amount": 10.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"},
            {"merchant": "Steam", "amount": 10.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"},
            {"merchant": "Steam", "amount": 10.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"},
            {"merchant": "Steam", "amount": 10.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"},
            {"merchant": "Steam", "amount": 10.00, "category": "Entertainment", "date": "2024-01-01T10:00:00"}
        ]
    }
    res = client.post("/api/v1/detect-anomaly", json=payload)
    assert res.status_code == 200, f"API Error: {res.text}"
    data = res.json()
    assert data["is_anomaly"] is True
