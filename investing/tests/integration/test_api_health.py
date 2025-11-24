import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool  # CRITICAL IMPORT

from investing.api.main import app
from investing.api.dependencies import get_db, get_market_service
from investing.models.base import Base
from investing.services.market_data import CachedMarketDataService, TickerNotFound, APIError

class TestApiHealth:
    
    @pytest.fixture
    def test_db(self):
        """In-memory DB for testing /health endpoint."""
        # CRITICAL FIX: Disable thread checking for SQLite in tests
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
    def mock_market_service(self):
        """Mock the complex market service."""
        mock = MagicMock(spec=CachedMarketDataService)
        return mock

    @pytest.fixture
    def client(self, test_db, mock_market_service):
        """
        Standard FastAPI TestClient.
        """
        def override_get_db():
            yield test_db

        def override_get_service():
            return mock_market_service

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_market_service] = override_get_service
        
        with TestClient(app) as c:
            yield c
        
        app.dependency_overrides.clear()

    # --- 1. HEALTH CHECK ENDPOINT ---

    def test_health_check_returns_healthy(self, client):
        """Scenario: Database is up."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["services"]["database"] == "connected"
        assert "timestamp" in data

    def test_health_check_degrades_on_db_failure(self, client, test_db):
        """
        Scenario: Database connection drops.
        Expectation: Status 200 (API is up) but body says 'degraded'.
        """
        # Mock a broken DB session
        mock_broken_db = MagicMock()
        mock_broken_db.execute.side_effect = Exception("Connection Refused")
        
        # Override dependency just for this test
        app.dependency_overrides[get_db] = lambda: mock_broken_db
        
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert "disconnected" in data["services"]["database"]

    # --- 2. MARKET DATA ENDPOINT ---

    def test_get_price_valid_ticker(self, client, mock_market_service):
        """Scenario: Service returns valid float."""
        mock_market_service.get_price.return_value = 150.25
        
        response = client.get("/market/price/VOO")
        
        assert response.status_code == 200
        data = response.json()
        assert data["ticker"] == "VOO"
        assert data["price"] == 150.25
        assert "source" in data

    def test_get_price_ticker_not_found(self, client, mock_market_service):
        """Scenario: Service cannot find ticker."""
        mock_market_service.get_price.side_effect = TickerNotFound("Bad Ticker")
        
        response = client.get("/market/price/INVALID")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Ticker INVALID not found"

    def test_get_price_upstream_failure(self, client, mock_market_service):
        """Scenario: Alpha Vantage is down -> HTTP 503."""
        mock_market_service.get_price.side_effect = APIError("Rate limit exceeded")
        
        response = client.get("/market/price/VOO")
        
        assert response.status_code == 503
        data = response.json()
        assert "Market data provider error" in data["detail"]

    def test_ticker_case_insensitivity(self, client, mock_market_service):
        """Scenario: User sends 'voo', API returns 'VOO'."""
        mock_market_service.get_price.return_value = 400.00
        
        response = client.get("/market/price/voo")
        
        assert response.json()["ticker"] == "VOO"