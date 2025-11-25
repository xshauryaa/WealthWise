from fastapi import Depends
from sqlalchemy.orm import Session
from investing.models.base import get_session
from investing.services.market_data import AlphaVantageClient, CachedMarketDataService
from investing.services.allocation_engine import AllocationEngine
import os

# 1. Database Dependency
def get_db():
    session = get_session()
    try:
        yield session
    finally:
        session.close()

# 2. Market Data Service (Singleton-ish)
_market_service = None

def get_market_service():
    global _market_service
    if _market_service is None:
        api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        client = AlphaVantageClient(api_key=api_key)
        _market_service = CachedMarketDataService(client, redis_url)
    return _market_service

# 3. Allocation Engine (New Singleton)
_allocation_engine = None

def get_allocation_engine():
    global _allocation_engine
    if _allocation_engine is None:
        # It loads the JSON config once on first request
        _allocation_engine = AllocationEngine()
    return _allocation_engine