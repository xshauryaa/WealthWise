"""Market data service for fetching stock prices from Alpha Vantage API."""

import requests
import time
from typing import Optional
from investing.config import ALPHA_VANTAGE_API_KEY
from investing.exceptions import (
    APIError,
    APIKeyExhausted,
    TickerNotFound,
    APITimeout,
    ConfigurationError
)


class AlphaVantageClient:
    """Client for fetching stock prices from Alpha Vantage API.
    
    Uses synchronous requests with exponential backoff retry strategy.
    Free tier: 5 API calls per minute, 500 calls per day.
    """
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self, api_key: Optional[str] = None, timeout: int = 5):
        """Initialize Alpha Vantage client.
        
        Args:
            api_key: Alpha Vantage API key. If None, reads from config.
            timeout: Request timeout in seconds (default: 5).
            
        Raises:
            ConfigurationError: If API key is not provided or configured.
        """
        self.api_key = api_key or ALPHA_VANTAGE_API_KEY
        if not self.api_key:
            raise ConfigurationError(
                "ALPHA_VANTAGE_API_KEY is required. "
                "Set it in your .env file or pass it to the constructor."
            )
        self.timeout = timeout
        self.max_retries = 3
    
    def get_price(self, ticker: str) -> float:
        """Fetch current price for a single ticker.
        
        Args:
            ticker: Stock ticker symbol (e.g., 'VOO', 'AAPL').
            
        Returns:
            float: Current stock price.
            
        Raises:
            TickerNotFound: When ticker is invalid or not found.
            APIKeyExhausted: When rate limit is exceeded.
            APITimeout: When request times out.
            APIError: For other API failures.
        """
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker.upper(),
            "apikey": self.api_key
        }
        
        # Exponential backoff retry
        for attempt in range(self.max_retries):
            try:
                response = requests.get(
                    self.BASE_URL,
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()
                data = response.json()
                
                # Check for API-specific errors
                if "Error Message" in data:
                    raise TickerNotFound(ticker)
                
                if "Note" in data:
                    # Rate limit message from Alpha Vantage
                    if "call frequency" in data["Note"].lower():
                        raise APIKeyExhausted(data["Note"])
                    # Other informational notes
                    raise APIError(f"API Note: {data['Note']}")
                
                # Parse the price
                global_quote = data.get("Global Quote", {})
                price_str = global_quote.get("05. price")
                
                if not price_str:
                    raise APIError(
                        f"Unexpected API response structure. "
                        f"Missing price data for ticker '{ticker}'."
                    )
                
                return float(price_str)
                
            except requests.exceptions.Timeout:
                if attempt == self.max_retries - 1:
                    raise APITimeout(
                        f"Request timed out after {self.timeout} seconds "
                        f"({self.max_retries} attempts)."
                    )
                # Exponential backoff: 1s, 2s, 4s
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                
            except requests.exceptions.RequestException as e:
                # Don't retry on rate limit or ticker not found
                if isinstance(e.__cause__, (APIKeyExhausted, TickerNotFound)):
                    raise
                
                if attempt == self.max_retries - 1:
                    raise APIError(f"Failed to fetch price for '{ticker}': {str(e)}")
                
                # Exponential backoff
                wait_time = 2 ** attempt
                time.sleep(wait_time)
        
        # Should never reach here, but just in case
        raise APIError(f"Failed to fetch price for '{ticker}' after {self.max_retries} attempts.")
