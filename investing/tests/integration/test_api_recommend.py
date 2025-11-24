import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from investing.api.main import app
from investing.api.dependencies import get_db, get_market_service, get_allocation_engine
from investing.models.base import Base
from investing.services.market_data import CachedMarketDataService, APIError
from investing.services.allocation_engine import AllocationEngine, ETFAllocation

class TestApiRecommend:
    
    @pytest.fixture
    def test_db(self):
        # Thread-safe SQLite setup
        engine = create_engine(
            "sqlite:///:memory:", 
            connect_args={"check_same_thread": False}, 
            poolclass=StaticPool
        )
        Base.metadata.create_all(engine)
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
        yield session
        session.close()

    @pytest.fixture
    def mock_market(self):
        return MagicMock(spec=CachedMarketDataService)

    @pytest.fixture
    def mock_engine(self):
        return MagicMock(spec=AllocationEngine)

    @pytest.fixture
    def client(self, test_db, mock_market, mock_engine):
        app.dependency_overrides[get_db] = lambda: test_db
        app.dependency_overrides[get_market_service] = lambda: mock_market
        app.dependency_overrides[get_allocation_engine] = lambda: mock_engine
        
        with TestClient(app) as c:
            yield c
        
        app.dependency_overrides.clear()

    # --- 1. HAPPY PATHS ---

    def test_recommend_success_flow(self, client, mock_engine, mock_market):
        """
        Scenario: User asks for $1000 Growth.
        """
        # 1. Setup Engine Mock: 80% VOO, 20% BND
        mock_engine.recommend_portfolio.return_value = [
            ETFAllocation(ticker="VOO", weight=0.8),
            ETFAllocation(ticker="BND", weight=0.2)
        ]
        
        # 2. Setup Market Mock: VOO=$400, BND=$100
        mock_market.get_price.side_effect = lambda ticker: 400.0 if ticker == "VOO" else 100.0
        
        # 3. Call API
        payload = {"balance": 1000, "risk_profile": "growth"}
        response = client.post("/portfolio/recommend", json=payload)
        
        # 4. Verify Response
        assert response.status_code == 200
        data = response.json()
        assert data["total_balance"] == 1000.0
        assert data["risk_profile"] == "growth"
        assert len(data["allocations"]) == 2
        
        # 5. Verify Math
        voo = next(x for x in data["allocations"] if x["ticker"] == "VOO")
        assert voo["weight"] == 0.8
        assert voo["current_price"] == 400.0
        assert voo["allocation_amount"] == 800.0

    def test_tier_1_override_integration(self, client, mock_engine, mock_market):
        """
        Scenario: Balance $50 (Tier 1).
        Verifies: Logic respects Engine's override (100% VOO).
        """
        mock_engine.recommend_portfolio.return_value = [
            ETFAllocation(ticker="VOO", weight=1.0)
        ]
        mock_market.get_price.return_value = 400.0
        
        payload = {"balance": 50, "risk_profile": "growth"}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["allocations"]) == 1
        assert data["allocations"][0]["ticker"] == "VOO"

    # --- 2. FAILURE SCENARIOS ---

    def test_recommend_fails_if_market_down(self, client, mock_engine, mock_market):
        """Scenario: Market data service fails."""
        mock_engine.recommend_portfolio.return_value = [
            ETFAllocation(ticker="VOO", weight=1.0)
        ]
        mock_market.get_price.side_effect = APIError("AlphaVantage Down")
        
        payload = {"balance": 1000}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 503
        assert "Unable to price asset VOO" in response.json()["detail"]

    def test_engine_logic_error_handling(self, client, mock_engine):
        """Scenario: Engine raises logic error."""
        mock_engine.recommend_portfolio.side_effect = ValueError("Logic Error")
        
        payload = {"balance": 1000}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 400
        assert "Logic Error" in response.json()["detail"]

    # --- 3. INPUT VALIDATION (Robust Version) ---

    def test_validation_negative_balance(self, client):
        """Verifies Pydantic validator for balance > 0."""
        payload = {"balance": -100, "risk_profile": "growth"}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 422
        data = response.json()
        
        # ROBUST: Check error structure, not fragile string matching
        # Pydantic 2.x returns 'greater_than' error type for gt=0
        error = data["detail"][0]
        assert error["loc"] == ["body", "balance"]
        assert error["type"] == "greater_than" 

    def test_validation_invalid_risk_profile(self, client):
        """Verifies Pydantic Enum/Literal validation."""
        payload = {"balance": 1000, "risk_profile": "yolo_bets"}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 422
        data = response.json()
        
        # ROBUST: Check error structure
        # Pydantic 2.x returns 'literal_error' for Literal mismatches
        error = data["detail"][0]
        assert error["loc"] == ["body", "risk_profile"]
        assert error["type"] == "literal_error"