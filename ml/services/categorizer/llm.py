import json
import time
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from ml.services.categorizer.base import BaseCategorizer
from ml.core.models import CategorizeRequest, CategorizeResponse
from ml.config.settings import get_settings

class LLMCategorizer(BaseCategorizer):
    def __init__(self):
        self.settings = get_settings()
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        # CHANGED: Using the specific model from your authorized list
        self.model = genai.GenerativeModel('models/gemini-2.0-flash')
        self.taxonomy = self.settings.CATEGORIES

    def _build_prompt(self, request: CategorizeRequest) -> str:
        return f"""
        Act as a financial transaction classifier.
        Map the following transaction to EXACTLY ONE of these categories: {self.taxonomy}.
        
        Transaction: "{request.merchant}"
        Amount: {request.amount} {request.iso_currency_code}
        Date: {request.date}
        
        Return ONLY valid JSON format:
        {{
            "category": "CategoryName",
            "confidence": 0.0-1.0,
            "reasoning": "brief explanation"
        }}
        """

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(4), retry=retry_if_exception_type(Exception))
    async def categorize(self, request: CategorizeRequest) -> CategorizeResponse:
        start_time = time.time()
        try:
            prompt = self._build_prompt(request)
            
            response = self.model.generate_content(prompt)
            
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(clean_text)
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return CategorizeResponse(
                category=data.get("category", "Uncategorized"),
                confidence=float(data.get("confidence", 0.5)),
                is_cached=False,
                processing_time_ms=processing_time,
                reasoning=data.get("reasoning", "LLM inference")
            )
        except Exception as e:
            print(f"⚠️ LLM Error for {request.merchant}: {e}")
            raise e 
