import google.generativeai as genai
from typing import List
from tenacity import retry, stop_after_attempt, wait_fixed
from ml.config.settings import get_settings

class EmbeddingService:
    def __init__(self):
        self.settings = get_settings()
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        self.model_name = "models/text-embedding-004"

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def embed_text(self, text: str, task_type: str = "retrieval_document") -> List[float]:
        result = genai.embed_content(
            model=self.model_name,
            content=text,
            task_type=task_type
        )
        return result['embedding']

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            embeddings.append(self.embed_text(text, "retrieval_document"))
        return embeddings
