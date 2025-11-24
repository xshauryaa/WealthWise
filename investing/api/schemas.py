from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Dict, List, Optional, Literal

# --- Existing Response Models ---
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, str]

class PriceResponse(BaseModel):
    ticker: str
    price: float
    source: str
    timestamp: datetime

class ErrorResponse(BaseModel):
    detail: str

# --- NEW: Recommendation Models (Chunk 11) ---

class RecommendRequest(BaseModel):
    balance: float = Field(..., gt=0, description="Investment amount in USD")
    risk_profile: Literal["conservative", "balanced", "growth"] = "balanced"

    @field_validator('balance')
    def validate_balance(cls, v):
        if v < 0:
            raise ValueError('Balance must be positive')
        return v

class ETFRecommendation(BaseModel):
    ticker: str
    weight: float
    current_price: float
    allocation_amount: float # The dollar value to buy

class PortfolioRecommendation(BaseModel):
    risk_profile: str
    total_balance: float
    timestamp: datetime
    allocations: List[ETFRecommendation]