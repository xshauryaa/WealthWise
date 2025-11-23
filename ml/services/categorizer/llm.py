import json
import google.generativeai as genai
from ml.services.categorizer.base import BaseCategorizer
from ml.core.models import CategorizeRequest, CategorizeResponse
from ml.config.settings import get_settings

class LLMCategorizer(BaseCategorizer):
    def __init__(self):
        self.settings = get_settings()
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        # USE SETTING
        self.model = genai.GenerativeModel(self.settings.GEMINI_MODEL)
        self.taxonomy = self.settings.CATEGORIES

    def _build_prompt(self, request: CategorizeRequest) -> str:
        return f"""
        Act as a financial transaction classifier.
        Map the following transaction to EXACTLY ONE of these categories: {self.taxonomy}.
        Transaction: "{request.merchant}"
        Amount: {request.amount} {request.iso_currency_code}
        Date: {request.date}
        Return ONLY valid JSON format: {{ "category": "CategoryName", "confidence": 0.9, "reasoning": "brief explanation" }}
        """

    async def categorize(self, request: CategorizeRequest) -> CategorizeResponse:
        try:
            prompt = self._build_prompt(request)
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(clean_text)
            return CategorizeResponse(
                category=data.get("category", "Uncategorized"),
                confidence=float(data.get("confidence", 0.5)),
                is_cached=False, processing_time_ms=0, reasoning=data.get("reasoning", "LLM inference")
            )
        except Exception as e:
            print(f"⚠️ LLM Error: {e}")
            return CategorizeResponse(category="Uncategorized", confidence=0.0, is_cached=False, processing_time_ms=0, reasoning=f"LLM Failed: {str(e)}")
