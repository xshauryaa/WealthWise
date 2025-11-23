from fastapi import APIRouter, HTTPException
from ml.core.models import CategorizeRequest, CategorizeResponse
from ml.services.categorizer.service import CategorizerService

router = APIRouter()
service = CategorizerService()

@router.post("/categorize", response_model=CategorizeResponse)
async def categorize_transaction(request: CategorizeRequest):
    try:
        return await service.categorize(request)
    except Exception as e:
        print(f"❌ Categorizer API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
