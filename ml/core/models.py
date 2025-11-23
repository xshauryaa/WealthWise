from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

class SourceRef(BaseModel):
    type: str
    id: Optional[str] = None
    snippet: Optional[str] = None

class CategorizeRequest(BaseModel):
    merchant: str
    amount: Decimal
    date: datetime
    user_id: str
    iso_currency_code: str = "USD"

class CategorizeResponse(BaseModel):
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    is_cached: bool
    processing_time_ms: int
    reasoning: Optional[str] = None
    suggested_subcategory: Optional[str] = None

class TransactionContext(BaseModel):
    merchant: str
    amount: Decimal
    category: str
    date: datetime

class DetectAnomalyRequest(BaseModel):
    user_id: str
    # CRITICAL: Naming this explicitly
    current_transaction: TransactionContext
    history: List[TransactionContext] = Field(default_factory=list)

class AnomalyComparison(BaseModel):
    category_mean: Decimal
    category_std: Decimal
    threshold: Decimal
    z_score: float

class DetectAnomalyResponse(BaseModel):
    is_anomaly: bool
    severity: str
    reasons: List[str]
    comparison: Optional[AnomalyComparison] = None

class ChatRequest(BaseModel):
    user_id: str
    message: str
    conversation_id: Optional[str] = None
    include_context: bool = True

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceRef] = []
    processing_time_ms: int = 0
    tokens_used: int = 0
