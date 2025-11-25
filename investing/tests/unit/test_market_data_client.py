import pytest
from unittest.mock import Mock, patch
from investing.services.market_data import AlphaVantageClient
from investing.exceptions import APIError, ConfigurationError
from investing.tests.fixtures.alpha_vantage_responses import mock_valid_response_voo

class TestAlphaVantageClient:
    def test_valid_ticker_returns_positive_price(self, mocker):
        mock_response = Mock()
        mock_response.json.return_value = mock_valid_response_voo()
        mock_response.raise_for_status.return_value = None
        mocker.patch('requests.get', return_value=mock_response)
        
        client = AlphaVantageClient(api_key="test_key")
        price = client.get_price("VOO")
        
        # CRITICAL FIX: Ensure we assert against float, not string
        assert isinstance(price, float)
        assert price == 423.45

    def test_missing_api_key_raises_configuration_error(self, monkeypatch):
        # CRITICAL FIX: Ensure environment variable is empty
        monkeypatch.delenv("ALPHA_VANTAGE_API_KEY", raising=False)
        
        with pytest.raises(ConfigurationError):
            AlphaVantageClient(api_key=None)

    def test_malformed_response_raises_api_error(self, mocker):
        mock_response = Mock()
        # Return empty dict (simulating bad response)
        mock_response.json.return_value = {} 
        mock_response.raise_for_status.return_value = None
        mocker.patch('requests.get', return_value=mock_response)
        
        client = AlphaVantageClient(api_key="test_key")
        
        with pytest.raises(APIError):
            client.get_price("VOO")
            
    def test_multiple_tickers_return_different_prices(self, mocker):
        # Mock side effects
        def side_effect(*args, **kwargs):
            mock = Mock()
            mock.raise_for_status = lambda: None
            if kwargs['params']['symbol'] == 'VOO':
                mock.json.return_value = {"Global Quote": {"05. price": "423.45"}}
            else:
                mock.json.return_value = {"Global Quote": {"05. price": "76.89"}}
            return mock

        mocker.patch('requests.get', side_effect=side_effect)
        client = AlphaVantageClient(api_key="test")
        
        assert client.get_price("VOO") == 423.45
        assert client.get_price("BND") == 76.89
