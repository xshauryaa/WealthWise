import time
from ml.core.models import CategorizeRequest, CategorizeResponse
from ml.services.categorizer.keyword import KeywordCategorizer
from ml.services.categorizer.llm import LLMCategorizer

class CategorizerService:
    def __init__(self):
        self.keyword_model = KeywordCategorizer()
        self.llm_model = LLMCategorizer()

    async def categorize(self, request: CategorizeRequest) -> CategorizeResponse:
        start_time = time.time()
        
        # Step 1: Try Keyword (Fast, Cheap)
        keyword_res = await self.keyword_model.categorize(request)
        
        # If we are confident (>80%), return immediately
        if keyword_res.confidence > 0.8:
            return keyword_res

        # Step 2: Try LLM (Slower, Smarter) - Only for "Misses"
        print(f"�� Invoking Gemini for: {request.merchant}")
        llm_res = await self.llm_model.categorize(request)
        
        # Update total timing
        total_time = int((time.time() - start_time) * 1000)
        llm_res.processing_time_ms = total_time
        
        return llm_res
