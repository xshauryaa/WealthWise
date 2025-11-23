import pytest
from decimal import Decimal
from ml.services.anomaly.statistical import StatisticalDetector

def test_zero_variance_protection():
    detector = StatisticalDetector()
    history = [Decimal("10.00")] * 10
    res = detector.detect(history, Decimal("10.00"))
    assert res.is_anomaly is False

def test_massive_outlier():
    detector = StatisticalDetector(sensitivity=2.0)
    # FIX: Provide 5+ items to pass the "Not enough data" check
    history = [Decimal("10.00"), Decimal("12.00"), Decimal("11.00"), Decimal("10.50"), Decimal("11.50")]
    
    res = detector.detect(history, Decimal("5000.00"))
    assert res.is_anomaly is True
    assert res.severity == "high"

def test_insufficient_data():
    detector = StatisticalDetector()
    history = [Decimal("10.00")] 
    res = detector.detect(history, Decimal("50.00"))
    assert res.is_anomaly is False
    assert "Not enough" in res.reasons[0]
