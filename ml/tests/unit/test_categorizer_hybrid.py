import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock, AsyncMock, patch
from ml.services.categorizer.service import CategorizerService
from ml.core.models import CategorizeRequest, CategorizeResponse

@pytest.mark.asyncio
async def test_hybrid_flow():
    # Mock the LLM so we don't spend API credits on unit tests
    with patch('ml.services.categorizer.llm.LLMCategorizer.categorize', new_callable=AsyncMock) as mock_llm:
        # Setup the mock to behave like Gemini
        mock_llm.return_value = CategorizeResponse(
            category="Savings",
            confidence=0.95,
            is_cached=False,
            processing_time_ms=100,
            reasoning="Mocked LLM Response"
        )
        
        service = CategorizerService()
        
        # Case 1: Keyword Hit (Uber) -> Should NOT call LLM
        req1 = CategorizeRequest(merchant="Uber Trip", amount=Decimal("15"), date=datetime.now(), user_id="u1")
        res1 = await service.categorize(req1)
        assert res1.category == "Transportation"
        assert mock_llm.called is False 

        # Case 2: Keyword Miss (Chase Savings) -> Should CALL LLM
        req2 = CategorizeRequest(merchant="Chase Savings", amount=Decimal("500"), date=datetime.now(), user_id="u1")
        res2 = await service.categorize(req2)
        
        # Assertions
        assert res2.category == "Savings" # This comes from our Mock above
        assert mock_llm.called is True    # Verify LLM was invoked
