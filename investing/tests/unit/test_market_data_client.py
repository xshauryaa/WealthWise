"""Tests for Alpha Vantage market data client."""

import pytest
from unittest.mock import Mock, patch
from investing.services.market_data import AlphaVantageClient
from investing.exceptions import (
    APIError,
    APIKeyExhausted,
    TickerNotFound,
    APITimeout,
    ConfigurationError
)
from investing.tests.fixtures.alpha_vantage_responses import (
    mock_valid_response_voo,
    mock_valid_response_bnd,
    mock_ticker_not_found_response,
    mock_rate_limit_response,
    mock_malformed_response,
)


class TestAlphaVantageClient:
    """Test Alpha Vantage API client."""
    
    def test_valid_ticker_returns_positive_price(self, mocker):
        """Valid ticker should return float > 0."""
        # Mock the requests.get call
        mock_response = Mock()
        mock_response.json.return_value = mock_valid_response_voo()
        mock_response.raise_for_status.return_value = None
        mocker.patch('requests.get', return_value=mock_response)
        
        client = AlphaVantageClient(api_key="test_key")
        price = client.get_price("VOO")
        
        assert isinstance(price, float)
        assert price == 423.45
        assert price > 0
    
    def test_invalid_ticker_raises_ticker_not_found(self, mocker):
        """Invalid ticker should raise TickerNotFound."""
        mock_response = Mock()
        mock_response.json.return_value = mock_ticker_not_found_response()
        mock_response.raise_for_status.return_value = None
        mocker.patch('requests.get', return_value=mock_response)
        
        client = AlphaVantageClient(api_key="test_key")
        
        with pytest.raises(TickerNotFound) as exc_info:
            client.get_price("INVALID")
        
        assert "INVALID" in str(exc_info.value)
    
    def test_rate_limit_raises_api_key_exhausted(self, mocker):
        """Rate limit response should raise APIKeyExhausted."""
        mock_response = Mock()
        mock_response.json.return_value = mock_rate_limit_response()
        mock_response.raise_for_status.return_value = None
        mocker.patch('requests.get', return_value=mock_response)
        
        client = AlphaVantageClient(api_key="test_key")
        
        with pytest.raises(APIKeyExhausted) as exc_info:
            client.get_price("VOO")
        
        assert "call frequency" in str(exc_info.value).lower()
    
    def test_missing_api_key_raises_configuration_error(self):
        """Client should fail fast if API key is None."""
        with pytest.raises(ConfigurationError) as exc_info:
            AlphaVantageClient(api_key=None)
        
        assert "ALPHA_VANTAGE_API_KEY" in str(exc_info.value)
    
    def test_malformed_response_raises_api_error(self, mocker):
        """Malformed API response should raise APIError."""
        mock_response = Mock()
        mock_response.json.return_value = mock_malformed_response()
        mock_response.raise_for_status.return_value = None
        mocker.patch('requests.get', return_value=mock_response)
        
        client = AlphaVantageClient(api_key="test_key")
        
        with pytest.raises(APIError) as exc_info:
            client.get_price("VOO")
        
        assert "unexpected" in str(exc_info.value).lower() or "missing" in str(exc_info.value).lower()
    
    def test_timeout_raises_api_timeout(self, mocker):
        """Request timeout should raise APITimeout after retries."""
        import requests
        mocker.patch('requests.get', side_effect=requests.exceptions.Timeout())
        mocker.patch('time.sleep')  # Speed up test by mocking sleep
        
        client = AlphaVantageClient(api_key="test_key", timeout=5)
        
        with pytest.raises(APITimeout) as exc_info:
            client.get_price("VOO")
        
        assert "timed out" in str(exc_info.value).lower()
    
    def test_multiple_tickers_return_different_prices(self, mocker):
        """Different tickers should return different prices."""
        def mock_get(url, params, timeout):
            mock_response = Mock()
            mock_response.raise_for_status.return_value = None
            if params["symbol"] == "VOO":
                mock_response.json.return_value = mock_valid_response_voo()
            elif params["symbol"] == "BND":
                mock_response.json.return_value = mock_valid_response_bnd()
            return mock_response
        
        mocker.patch('requests.get', side_effect=mock_get)
        
        client = AlphaVantageClient(api_key="test_key")
        
        voo_price = client.get_price("VOO")
        bnd_price = client.get_price("BND")
        
        assert voo_price == 423.45
        assert bnd_price == 76.89
        assert voo_price != bnd_price
