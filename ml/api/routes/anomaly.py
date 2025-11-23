from fastapi import APIRouter, HTTPException
from ml.core.models import DetectAnomalyRequest, DetectAnomalyResponse
from ml.services.anomaly.statistical import StatisticalDetector

router = APIRouter()
detector = StatisticalDetector()

@router.post("/detect-anomaly", response_model=DetectAnomalyResponse)
async def detect_anomaly(request: DetectAnomalyRequest):
    try:
        # Handle empty history gracefully
        if not request.history:
            return DetectAnomalyResponse(is_anomaly=False, severity="none", reasons=["No history provided"])
            
        history_values = [tx.amount for tx in request.history]
        
        # Access using the correct field name
        return detector.detect(history_values, request.current_transaction.amount)
    except Exception as e:
        print(f"❌ Anomaly API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
