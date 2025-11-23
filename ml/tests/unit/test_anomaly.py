import pytest
from decimal import Decimal
from datetime import datetime
from ml.services.anomaly.statistical import StatisticalDetector
from ml.services.anomaly.velocity import VelocityCalculator

def test_statistical_anomaly_detection():
    detector = StatisticalDetector(sensitivity=2.0)
    
    # Scenario: User usually spends ~$15 on lunch
    history = [Decimal("12.50"), Decimal("15.00"), Decimal("14.20"), Decimal("16.50"), Decimal("13.00")]
    
    # Case 1: Normal Transaction ($14) -> Should PASS
    res = detector.detect(history, Decimal("14.00"))
    assert res.is_anomaly is False
    
    # Case 2: Anomaly ($50 Pizza Party) -> Should FAIL
    # Math: Mean=14.24, Std=1.35. Threshold ~17.00
    res = detector.detect(history, Decimal("50.00"))
    assert res.is_anomaly is True
    assert res.severity == "high"
    assert "standard deviations above average" in res.reasons[0]

def test_velocity_projection():
    calc = VelocityCalculator()
    
    # Scenario: It's Jan 15th (halfway), and I've spent $500.
    # I am on track to spend ~$1000 by Jan 31st.
    date = datetime(2024, 1, 15) # 31 days in Jan
    current_spend = Decimal("500.00")
    
    projected = calc.calculate_projected_spend(current_spend, date)
    
    # Logic check: 500 / 15 = 33.33/day. 33.33 * 31 = 1033.33
    assert projected > Decimal("1000.00")
    assert projected < Decimal("1050.00")
