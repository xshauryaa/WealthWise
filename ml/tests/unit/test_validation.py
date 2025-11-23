import pytest
from decimal import Decimal
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from ml.api.main import app

client = TestClient(app)

def test_negative_amount_categorization():
    """
    CRITICAL: Financial apps must handle refunds (negative amounts).
    The system should categorize a refund correctly, not crash.
    """
    payload = {
        "merchant": "Uber Refund",
        "amount": -15.00,
        "date": datetime.now().isoformat(),
        "user_id": "test_user",
        "iso_currency_code": "USD"
    }
    res = client.post("/api/v1/categorize", json=payload)
    assert res.status_code == 200
    # Keyword matcher should still find "Uber" even if amount is negative
    assert res.json()["category"] == "Transportation"

def test_future_date_anomaly():
    """
    Logic Check: Predicting velocity for a future date shouldn't break math.
    """
    future_date = (datetime.now() + timedelta(days=365)).isoformat()
    payload = {
        "user_id": "time_traveler",
        "current_transaction": {
            "merchant": "Future Shop", "amount": 50.00, "category": "Shopping", "date": future_date
        },
        "history": []
    }
    res = client.post("/api/v1/detect-anomaly", json=payload)
    assert res.status_code == 200
    assert res.json()["is_anomaly"] is False

def test_massive_input_string():
    """
    Security: Buffer Overflow / Token Limit check.
    Send a 10KB merchant string.
    """
    long_string = "Spam " * 2000
    payload = {
        "merchant": long_string,
        "amount": 5.00,
        "date": datetime.now().isoformat(),
        "user_id": "hacker"
    }
    res = client.post("/api/v1/categorize", json=payload)
    # Should return 200 (handled) or 422 (validation error), but NOT 500 (crash)
    assert res.status_code in [200, 422]
