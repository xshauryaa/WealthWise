import pytest
import time
from unittest.mock import Mock
import redis
from investing.services.market_data import CachedMarketDataService, AlphaVantageClient
from investing.exceptions import ConfigurationError

class TestCachedMarketDataService:
    
    @pytest.fixture
    def mock_client(self):
        return Mock(spec=AlphaVantageClient)
    
    @pytest.fixture
    def service(self, mock_client):
        # FIX: Removed invalid args
        return CachedMarketDataService(client=mock_client, redis_url="redis://localhost:6379/1")

    def test_first_call_fetches_second_uses_cache(self, service, mock_client):
        """Test basic caching behavior."""
        # Mock Redis connection if available, otherwise skip logic that requires real Redis
        if not service._redis_available:
            pytest.skip("Redis not available for this test")

        mock_client.get_price.return_value = 150.25
        service._redis.flushdb()

        # 1. API Hit
        price1 = service.get_price("AAPL")
        assert price1 == 150.25
        assert mock_client.get_price.call_count == 1
        
        # 2. Cache Hit
        price2 = service.get_price("AAPL")
        assert price2 == 150.25
        assert mock_client.get_price.call_count == 1 

    def test_redis_failure_does_not_crash(self, mock_client):
        """Test graceful degradation."""
        # Init with bad URL
        service = CachedMarketDataService(client=mock_client, redis_url="redis://invalid:9999")
        assert service._redis_available is False
        
        mock_client.get_price.return_value = 100.0
        # Should still work via API
        assert service.get_price("VOO") == 100.0
