import pytest
from datetime import datetime
from decimal import Decimal
from ml.services.categorizer.keyword import KeywordCategorizer
from ml.core.models import CategorizeRequest

@pytest.mark.asyncio
async def test_keyword_matches():
    categorizer = KeywordCategorizer()
    
    # Test 1: Transportation Match
    req = CategorizeRequest(
        merchant="UBER *TRIP 8291",
        amount=Decimal("15.50"),
        date=datetime.now(),
        user_id="test_user"
    )
    res = await categorizer.categorize(req)
    assert res.category == "Transportation"
    assert res.confidence > 0.9

    # Test 2: Food Match (Case Insensitive)
    req.merchant = "starbucks coffee"
    res = await categorizer.categorize(req)
    assert res.category == "Food"

    # Test 3: No Match
    req.merchant = "Joe's Random Shack"
    res = await categorizer.categorize(req)
    assert res.category == "Uncategorized"
    assert res.confidence == 0.0
