from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from investing.api import schemas
from investing.api.dependencies import get_db, get_market_service, get_allocation_engine
from investing.services.market_data import CachedMarketDataService, TickerNotFound, APIError
from investing.services.allocation_engine import AllocationEngine

app = FastAPI(
    title="WealthWise Investing Service",
    version="0.2.0",
    description="Micro-investment backend with Dynamic Sector Rotation."
)

@app.get("/health", response_model=schemas.HealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_status = "unknown"
    try:
        # Simple check
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    status_code = "healthy" if db_status == "connected" else "degraded"
    
    return schemas.HealthResponse(
        status=status_code,
        timestamp=datetime.utcnow(),
        services={
            "database": db_status,
            "version": "0.2.0"
        }
    )

@app.get("/market/price/{ticker}", response_model=schemas.PriceResponse)
def get_price(
    ticker: str,
    service: CachedMarketDataService = Depends(get_market_service)
):
    try:
        price = service.get_price(ticker)
        return schemas.PriceResponse(
            ticker=ticker.upper(),
            price=price,
            source="alpha_vantage",
            timestamp=datetime.utcnow()
        )
    except TickerNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticker {ticker} not found"
        )
    except APIError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Market data provider error: {str(e)}"
        )

@app.post("/portfolio/recommend", response_model=schemas.PortfolioRecommendation)
def recommend_portfolio(
    request: schemas.RecommendRequest,
    db: Session = Depends(get_db),  # <--- NEW: We need DB access here
    engine: AllocationEngine = Depends(get_allocation_engine),
    market: CachedMarketDataService = Depends(get_market_service)
):
    """
    Generates a portfolio allocation.
    Uses Dynamic Sector Rotation if available in the DB.
    """
    try:
        # 1. Get Target Weights (The "Brain")
        # CRITICAL FIX: We pass 'db' so the engine can check Momentum Scores
        allocations = engine.recommend_portfolio(
            request.balance, 
            request.risk_profile,
            db=db 
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Enrich with Real-Time Prices (The "Market")
    result_allocations = []
    
    for alloc in allocations:
        try:
            current_price = market.get_price(alloc.ticker)
        except (TickerNotFound, APIError) as e:
            raise HTTPException(
                status_code=503, 
                detail=f"Unable to price asset {alloc.ticker}: {str(e)}"
            )
        
        # Calculate dollar amount
        dollar_amount = request.balance * alloc.weight

        result_allocations.append(schemas.ETFRecommendation(
            ticker=alloc.ticker,
            weight=alloc.weight,
            current_price=current_price,
            allocation_amount=round(dollar_amount, 2)
        ))

    return schemas.PortfolioRecommendation(
        risk_profile=request.risk_profile,
        total_balance=request.balance,
        timestamp=datetime.utcnow(),
        allocations=result_allocations
    )
