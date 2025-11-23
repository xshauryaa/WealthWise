import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from ml.config.settings import get_settings
from ml.services.rag.context_builder import ContextBuilder

class AdvisorService:
    def __init__(self):
        self.settings = get_settings()
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('models/gemini-2.0-flash')
        self.context_builder = ContextBuilder()

    def _build_system_prompt(self, user_query: str, context: str) -> str:
        return f"""
        You are WealthWise, an empathetic financial coach.
        
        USER QUESTION: "{user_query}"
        
        USER DATA (Use ONLY this):
        {context}
        
        INSTRUCTIONS:
        1. Answer based on the data.
        2. Be specific with numbers.
        3. Concise.
        """

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2), retry=retry_if_exception_type(Exception))
    def ask(self, user_id: str, user_query: str) -> str:
        context = self.context_builder.retrieve_context(user_query, user_id)
        prompt = self._build_system_prompt(user_query, context)
        response = self.model.generate_content(prompt)
        return response.text.strip()
