import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from investing.api.main import app
from investing.api.dependencies import get_db, get_market_service, get_allocation_engine
from investing.models.base import Base
from investing.models.etf_universe import EtfUniverse
from investing.services.market_data import CachedMarketDataService
from investing.services.allocation_engine import AllocationEngine

class TestFullDynamicFlow:
    
    @pytest.fixture
    def test_db(self):
        # In-memory SQLite for full isolation
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
        # Mock prices so we don't hit Alpha Vantage
        m = MagicMock(spec=CachedMarketDataService)
        # Return generic prices for any ticker
        m.get_price.side_effect = lambda t: 100.00
        return m

    @pytest.fixture
    def client(self, test_db, mock_market):
        # Override dependencies to use our test DB and mock market
        app.dependency_overrides[get_db] = lambda: test_db
        app.dependency_overrides[get_market_service] = lambda: mock_market
        # Use real allocation engine logic
        app.dependency_overrides[get_allocation_engine] = lambda: AllocationEngine()
        
        with TestClient(app) as c:
            yield c
        
        app.dependency_overrides.clear()

    def test_api_serves_dynamic_allocation(self, client, test_db):
        """
        CRITICAL TEST: Does the API output the Momentum Winner?
        Scenario: XLK (Tech) is the winner.
        """
        # 1. Seed the Database with a "Winner"
        winner = EtfUniverse(
            ticker="XLK", 
            sector="Technology", 
            momentum_score=0.25, 
            volatility=0.10, 
            last_price=150.00
        )
        # Add a "Loser" to ensure it picks the right one
        loser = EtfUniverse(
            ticker="XLE", 
            sector="Energy", 
            momentum_score=-0.05, 
            volatility=0.10, 
            last_price=80.00
        )
        test_db.add_all([winner, loser])
        test_db.commit()

        # 2. Call the API
        payload = {"balance": 1000.0, "risk_profile": "growth"}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # 3. Verify the Tilt
        # We expect XLK to be in the allocations
        tickers = [a["ticker"] for a in data["allocations"]]
        assert "XLK" in tickers, "Dynamic Winner (XLK) missing from API response!"
        
        # Check Weight: VOO should be reduced
        xlk_alloc = next(a for a in data["allocations"] if a["ticker"] == "XLK")
        assert xlk_alloc["weight"] == 0.30  # The 30% Tilt
        
        print("\n✅ API successfully connected DB -> Engine -> Response.")

    def test_api_handles_empty_db_gracefully(self, client):
        """
        CRITICAL TEST: What if the Harvester hasn't run yet?
        """
        # Database is empty by default in this fixture
        
        payload = {"balance": 1000.0, "risk_profile": "growth"}
        response = client.post("/portfolio/recommend", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        tickers = [a["ticker"] for a in data["allocations"]]
        
        # Should revert to standard static allocation
        assert "XLK" not in tickers
        assert "VOO" in tickers
        
        print("\n✅ API safely defaulted to static allocation.")

