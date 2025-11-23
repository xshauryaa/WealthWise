"""Tests for CachedMarketDataService."""

import pytest
import time
from unittest.mock import Mock, patch
import redis

from investing.services.market_data import CachedMarketDataService, AlphaVantageClient
from investing.exceptions import APIKeyExhausted, ConfigurationError


class TestCachedMarketDataService:
    """Test suite for CachedMarketDataService."""
    
    @pytest.fixture
    def mock_client(self):
        """Create a mock AlphaVantageClient."""
        client = Mock(spec=AlphaVantageClient)
        return client
    
    @pytest.fixture
    def redis_url(self):
        """Redis URL for testing."""
        return "redis://localhost:6379/1"  # Use DB 1 for tests
    
    @pytest.fixture
    def service(self, mock_client, redis_url):
        """Create a CachedMarketDataService instance."""
        service = CachedMarketDataService(
            client=mock_client,
            redis_url=redis_url,
            cache_ttl=300,
            rate_limit=5,
            rate_window=60
        )
        # Clean up Redis before each test
        service.redis_client.flushdb()
        yield service
        # Clean up Redis after each test
        service.redis_client.flushdb()
    
    def test_first_call_fetches_second_uses_cache(self, service, mock_client):
        """Test that first call fetches from API, second call uses cache."""
        mock_client.get_price.return_value = 150.25
        
        # First call should fetch from API
        price1 = service.get_price("AAPL")
        assert price1 == 150.25
        assert mock_client.get_price.call_count == 1
        
        # Second call should use cache (no additional API call)
        price2 = service.get_price("AAPL")
        assert price2 == 150.25
        assert mock_client.get_price.call_count == 1  # Still 1
    
    def test_cache_expires_after_ttl(self, service, mock_client):
        """Test that cache expires after TTL and refetches from API."""
        # Use short TTL for testing
        service.cache_ttl = 2  # 2 seconds
        
        mock_client.get_price.return_value = 150.25
        
        # First call
        price1 = service.get_price("AAPL")
        assert price1 == 150.25
        assert mock_client.get_price.call_count == 1
        
        # Second call immediately (should use cache)
        price2 = service.get_price("AAPL")
        assert price2 == 150.25
        assert mock_client.get_price.call_count == 1
        
        # Wait for cache to expire
        time.sleep(2.1)
        
        # Third call should refetch
        mock_client.get_price.return_value = 155.50
        price3 = service.get_price("AAPL")
        assert price3 == 155.50
        assert mock_client.get_price.call_count == 2
    
    def test_rate_limit_blocks_sixth_call(self, service, mock_client):
        """Test that 6th call within 60 seconds raises APIKeyExhausted."""
        mock_client.get_price.return_value = 150.25
        
        # Make 5 calls (should succeed)
        for i in range(5):
            # Clear cache to force API calls
            service.redis_client.delete(service._get_cache_key("AAPL"))
            price = service.get_price("AAPL")
            assert price == 150.25
        
        # 6th call should raise APIKeyExhausted
        service.redis_client.delete(service._get_cache_key("AAPL"))
        with pytest.raises(APIKeyExhausted, match="Rate limit exceeded"):
            service.get_price("AAPL")
    
    def test_different_tickers_independent(self, service, mock_client):
        """Test that different tickers have independent caches and rate limits."""
        mock_client.get_price.side_effect = lambda ticker: {
            "AAPL": 150.25,
            "MSFT": 380.50,
            "GOOGL": 140.75
        }[ticker]
        
        # Fetch prices for different tickers
        aapl_price = service.get_price("AAPL")
        msft_price = service.get_price("MSFT")
        googl_price = service.get_price("GOOGL")
        
        assert aapl_price == 150.25
        assert msft_price == 380.50
        assert googl_price == 140.75
        assert mock_client.get_price.call_count == 3
        
        # Second calls should use cache
        aapl_price2 = service.get_price("AAPL")
        msft_price2 = service.get_price("MSFT")
        assert aapl_price2 == 150.25
        assert msft_price2 == 380.50
        assert mock_client.get_price.call_count == 3  # No new calls
    
    def test_cache_hit_performance(self, service, mock_client):
        """Test that cache hit is fast (< 10ms)."""
        mock_client.get_price.return_value = 150.25
        
        # First call to populate cache
        service.get_price("AAPL")
        
        # Measure cache hit time
        start_time = time.time()
        service.get_price("AAPL")
        elapsed_ms = (time.time() - start_time) * 1000
        
        assert elapsed_ms < 10  # Should be under 10ms
    
    def test_redis_connection_failure(self, mock_client):
        """Test graceful handling of Redis connection failure."""
        with pytest.raises(ConfigurationError, match="Failed to connect to Redis"):
            CachedMarketDataService(
                client=mock_client,
                redis_url="redis://invalid-host:9999"
            )
    
    def test_rate_limiter_resets(self, service, mock_client):
        """Test that rate limiter resets after time window."""
        # Use short rate window for testing
        service.rate_window = 2  # 2 seconds
        
        mock_client.get_price.return_value = 150.25
        
        # Make 5 calls (should succeed)
        for i in range(5):
            service.redis_client.delete(service._get_cache_key("AAPL"))
            price = service.get_price("AAPL")
            assert price == 150.25
        
        # 6th call should fail
        service.redis_client.delete(service._get_cache_key("AAPL"))
        with pytest.raises(APIKeyExhausted):
            service.get_price("AAPL")
        
        # Wait for rate limit window to reset
        time.sleep(2.1)
        
        # Should be able to make calls again
        service.redis_client.delete(service._get_cache_key("AAPL"))
        price = service.get_price("AAPL")
        assert price == 150.25
