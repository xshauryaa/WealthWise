import pytest
from decimal import Decimal
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock
from ml.core.models import CategorizeRequest, CategorizeResponse
from ml.services.categorizer.service import CategorizerService
from ml.services.categorizer.keyword import KeywordCategorizer

@pytest.mark.asyncio
async def test_keyword_priority():
    service = CategorizerService()
    req = CategorizeRequest(
        merchant="UBER *TRIP",
        amount=Decimal("15.00"),
        date=datetime.now(),
        user_id="test"
    )
    
    with patch("ml.services.categorizer.llm.LLMCategorizer.categorize", new_callable=AsyncMock) as mock_llm:
        res = await service.categorize(req)
        assert res.category == "Transportation"
        assert res.confidence > 0.9
        assert mock_llm.called is False

@pytest.mark.asyncio
async def test_llm_fallback_logic():
    service = CategorizerService()
    req = CategorizeRequest(
        merchant="Strange Dr. Mysterio",
        amount=Decimal("100.00"),
        date=datetime.now(),
        user_id="test"
    )
    
    mock_response = CategorizeResponse(
        category="Healthcare",
        confidence=0.9,
        is_cached=False,
        processing_time_ms=50,
        reasoning="Mocked AI"
    )

    with patch("ml.services.categorizer.llm.LLMCategorizer.categorize", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = mock_response
        
        res = await service.categorize(req)
        
        assert res.category == "Healthcare"
        assert mock_llm.called is True

@pytest.mark.asyncio
async def test_keyword_case_insensitivity():
    cat = KeywordCategorizer()
    req = CategorizeRequest(
        merchant="starbucks", 
        amount=Decimal("5"), 
        date=datetime.now(), 
        user_id="u1"
    )
    res = await cat.categorize(req)
    assert res.category == "Food"
