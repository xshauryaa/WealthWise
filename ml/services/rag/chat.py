import google.generativeai as genai
from ml.config.settings import get_settings
from ml.services.rag.vector_store import VectorStore
from ml.services.rag.context_builder import ContextBuilder
from ml.core.models import ChatRequest, ChatResponse

class ChatService:
    def __init__(self):
        self.settings = get_settings()
        self.vector_store = VectorStore()
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        # USES DYNAMIC SETTING
        self.model = genai.GenerativeModel(self.settings.GEMINI_MODEL)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        relevant_docs = self.vector_store.search(
            query=request.message,
            n_results=10,
            user_id=request.user_id
        )
        
        context_str = ContextBuilder.format_transactions(relevant_docs)
        system_prompt = ContextBuilder.build_system_prompt(context_str)
        full_prompt = f"{system_prompt}\n\nUSER QUESTION: {request.message}"
        
        try:
            response = self.model.generate_content(full_prompt)
            ai_text = response.text
        except Exception as e:
            ai_text = f"Error connecting to AI model ({self.settings.GEMINI_MODEL}): {str(e)}"
            print(f"Gemini Error: {e}")

        return ChatResponse(
            response=ai_text,
            sources=[], 
            processing_time_ms=0, 
            tokens_used=0
        )
