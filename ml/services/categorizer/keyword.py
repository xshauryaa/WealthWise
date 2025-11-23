import time
from typing import Dict
from ml.services.categorizer.base import BaseCategorizer
from ml.core.models import CategorizeRequest, CategorizeResponse
from ml.config.settings import get_settings

class KeywordCategorizer(BaseCategorizer):
    def __init__(self):
        self.settings = get_settings()
        self.keyword_map = self._build_keyword_map()

    def _build_keyword_map(self) -> Dict[str, str]:
        """
        Inverted index: "uber" -> "Transportation", "mcdonalds" -> "Food"
        """
        mapping = {}
        # In a real app, this list would be much larger.
        # For MVP, we match the synthetic data patterns we generated.
        
        # Helper to add keywords
        def add(category: str, keywords: list):
            for k in keywords:
                mapping[k.lower()] = category

        add("Food", ["starbucks", "chipotle", "mcdonalds", "subway", "trader joe's", "whole foods", "doordash", "coffee", "burger", "pizza"])
        add("Transportation", ["uber", "lyft", "shell", "chevron", "mta", "lime", "scooter", "gas", "taxi", "parking"])
        add("Entertainment", ["netflix", "spotify", "amc", "steam", "playstation", "bar", "cinema", "hulu", "ticket"])
        add("Shopping", ["amazon", "target", "walmart", "best buy", "nike", "apple store", "clothing", "shoe"])
        add("Housing", ["rent", "camden", "apartment", "maintenance", "ikea", "home depot"])
        add("Utilities", ["verizon", "comcast", "at&t", "pg&e", "water", "electric", "internet"])
        add("Education", ["university", "bookstore", "chegg", "udemy", "coursera", "tuition"])
        add("Savings", ["vanguard", "robinhood", "fidelity", "schwab", "save", "deposit", "transfer"])
        add("Income", ["payroll", "gusto", "salary", "deposit", "direct dep"])

        return mapping

    async def categorize(self, request: CategorizeRequest) -> CategorizeResponse:
        start_time = time.time()
        merchant_lower = request.merchant.lower()
        
        # Default State
        detected_category = "Uncategorized"
        confidence = 0.0
        reason = "No keyword match found"

        # Linear Search (Fast enough for <1000 keywords)
        for keyword, category in self.keyword_map.items():
            if keyword in merchant_lower:
                detected_category = category
                confidence = 0.95  # High confidence for exact keyword match
                reason = f"Matched keyword: '{keyword}'"
                break
        
        processing_time = int((time.time() - start_time) * 1000)

        return CategorizeResponse(
            category=detected_category,
            confidence=confidence,
            is_cached=False,  
            processing_time_ms=processing_time,
            reasoning=reason
        )
