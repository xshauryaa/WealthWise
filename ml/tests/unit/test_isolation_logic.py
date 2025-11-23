import pytest
from decimal import Decimal
from ml.services.anomaly.statistical import StatisticalDetector

def test_anomaly_user_independence():
    """
    Verify that one user's massive spending doesn't affect another's Z-Score.
    Since our detector is stateless (we pass history in), this verifies the
    statelessness assumption holds.
    """
    detector = StatisticalDetector()
    
    # User A: Billionaire (Average spend $10,000)
    history_a = [Decimal("10000"), Decimal("12000"), Decimal("9000"), Decimal("11000"), Decimal("10000")]
    
    # User B: Student (Average spend $10)
    history_b = [Decimal("10"), Decimal("12"), Decimal("9"), Decimal("11"), Decimal("10")]
    
    # Test User B with a $50 transaction
    # If logic leaks, $50 looks tiny compared to User A's $10,000 average.
    # But compared to User B's $10 average, it IS an anomaly.
    
    res_b = detector.detect(history_b, Decimal("50.00"))
    
    # If this fails, it means we are somehow using a global mean (Hardcoded/Leaked state)
    assert res_b.is_anomaly is True
    assert res_b.severity == "high"
    
    # Verify User A logic is separate
    res_a = detector.detect(history_a, Decimal("50.00"))
    assert res_a.is_anomaly is False  # $50 is nothing for a billionaire
