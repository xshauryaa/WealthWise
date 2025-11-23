from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ml.services.rag.advisor import AdvisorService

router = APIRouter()
advisor = AdvisorService()

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_advisor(request: ChatRequest):
    try:
        print(f"📨 Chat Request for {request.user_id}: {request.message}")
        answer = advisor.ask(request.user_id, request.message)
        return ChatResponse(response=answer)
    except Exception as e:
        print(f"❌ Chat API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
