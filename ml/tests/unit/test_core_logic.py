import pytest
from decimal import Decimal
from datetime import datetime
from unittest.mock import AsyncMock, patch
from ml.services.anomaly.statistical import StatisticalDetector
from ml.services.anomaly.velocity import VelocityCalculator
from ml.services.categorizer.service import CategorizerService
from ml.core.models import CategorizeRequest, CategorizeResponse

# --- ANOMALY TESTS ---
def test_anomaly_math_outlier():
    """Verify Z-Score math correctly identifies a massive outlier."""
    detector = StatisticalDetector(sensitivity=2.0)
    # History: Average ~10.00, Low Variance
    history = [Decimal("10.00"), Decimal("10.50"), Decimal("9.50"), Decimal("10.00"), Decimal("10.00")]
    
    # Test: $5000 transaction (Obvious Anomaly)
    res = detector.detect(history, Decimal("5000.00"))
    
    assert res.is_anomaly is True
    assert res.severity == "high"
    assert res.comparison.z_score > 10.0  # Real math check

def test_anomaly_insufficient_data():
    """Verify we don't crash or guess on empty history."""
    detector = StatisticalDetector()
    history = [Decimal("10.00")] # Only 1 item
    
    res = detector.detect(history, Decimal("50.00"))
    assert res.is_anomaly is False
    assert "Not enough" in res.reasons[0]

def test_velocity_projection():
    """Verify the 'End of Month' prediction math."""
    calc = VelocityCalculator()
    # Date: Jan 15th (15 days in, 16 left). Spent $500.
    date = datetime(2024, 1, 15) 
    current = Decimal("500.00")
    
    projected = calc.calculate_projected_spend(current, date)
    
    # 500/15 = 33.33 per day. 33.33 * 31 days = 1033.33
    assert projected > Decimal("1030.00")
    assert projected < Decimal("1040.00")

# --- CATEGORIZER TESTS ---
@pytest.mark.asyncio
async def test_categorizer_hybrid_flow():
    """Verify the system checks Keywords FIRST, then falls back to LLM."""
    service = CategorizerService()
    
    # 1. Mock the LLM to prove we only call it when needed
    with patch("ml.services.categorizer.llm.LLMCategorizer.categorize", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = CategorizeResponse(
            category="Healthcare", confidence=0.9, is_cached=False, processing_time_ms=1, reasoning="Mock"
        )

        # Case A: "Uber" (Should hit Keyword, NOT LLM)
        req_fast = CategorizeRequest(merchant="Uber Trip", amount=Decimal("10"), date=datetime.now(), user_id="u1")
        res_fast = await service.categorize(req_fast)
        assert res_fast.category == "Transportation"
        assert mock_llm.called is False # Proof of efficiency

        # Case B: "Dr. Strange" (Should hit LLM)
        req_slow = CategorizeRequest(merchant="Dr. Strange", amount=Decimal("100"), date=datetime.now(), user_id="u1")
        res_slow = await service.categorize(req_slow)
        assert res_slow.category == "Healthcare"
        assert mock_llm.called is True # Proof of fallback
