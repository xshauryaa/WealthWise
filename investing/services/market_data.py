"""Market data retrieval from Alpha Vantage API."""

import requests
import time
from typing import Optional
import redis

from investing.exceptions import (
    APIError,
    APIKeyExhausted,
    TickerNotFound,
    APITimeout,
    ConfigurationError
)


class AlphaVantageClient:
    """Client for fetching real-time stock prices from Alpha Vantage API."""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self, api_key: str, timeout: int = 5, max_retries: int = 3):
        """
        Initialize the Alpha Vantage client.
        
        Args:
            api_key: Alpha Vantage API key
            timeout: Request timeout in seconds (default: 5)
            max_retries: Maximum number of retry attempts (default: 3)
            
        Raises:
            ConfigurationError: If api_key is None or empty
        """
        if not api_key:
            raise ConfigurationError(
                "Alpha Vantage API key is required. "
                "Please set ALPHA_VANTAGE_API_KEY environment variable."
            )
        
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
    
    def get_price(self, ticker: str) -> float:
        """
        Get the current price for a given stock ticker.
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL', 'MSFT')
            
        Returns:
            Current stock price as a float
            
        Raises:
            TickerNotFound: If the ticker symbol is invalid
            APIKeyExhausted: If API rate limit is exceeded
            APITimeout: If the request times out
            APIError: If the API returns an unexpected error
        """
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker.upper(),
            "apikey": self.api_key
        }
        
        for attempt in range(self.max_retries):
            try:
                response = requests.get(
                    self.BASE_URL,
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()
                data = response.json()
                
                # Check for rate limit error (Alpha Vantage returns a "Note" field)
                if "Note" in data:
                    note_text = data["Note"]
                    if "call frequency" in note_text.lower() or "rate limit" in note_text.lower():
                        raise APIKeyExhausted(note_text)
                
                # Check for invalid ticker
                if "Error Message" in data:
                    raise TickerNotFound(f"Ticker '{ticker}' not found")
                
                # Extract price from response
                if "Global Quote" in data and "05. price" in data["Global Quote"]:
                    price_str = data["Global Quote"]["05. price"]
                    return float(price_str)
                
                # Unexpected response format
                raise APIError(f"Unexpected API response format: {data}")
                
            except requests.Timeout:
                if attempt == self.max_retries - 1:
                    raise APITimeout(f"Request timed out after {self.max_retries} attempts")
                time.sleep(2 ** attempt)  # Exponential backoff
                
            except requests.RequestException as e:
                if attempt == self.max_retries - 1:
                    raise APIError(f"API request failed: {str(e)}")
                time.sleep(2 ** attempt)


class CachedMarketDataService:
    """Market data service with Redis caching and per-ticker rate limiting."""
    
    def __init__(
        self, 
        client: AlphaVantageClient, 
        redis_url: str = None,
        cache_ttl: int = 300,  # 5 minutes
        rate_limit: int = 5,  # 5 calls per minute
        rate_window: int = 60  # 60 seconds
    ):
        """
        Initialize the cached market data service.
        
        Args:
            client: AlphaVantageClient instance for fetching data
            redis_url: Redis connection URL (default: from config)
            cache_ttl: Cache time-to-live in seconds (default: 300)
            rate_limit: Maximum calls per time window per ticker (default: 5)
            rate_window: Time window for rate limiting in seconds (default: 60)
        """
        self.client = client
        self.cache_ttl = cache_ttl
        self.rate_limit = rate_limit
        self.rate_window = rate_window
        
        # Initialize Redis connection
        if redis_url is None:
            from investing.config import REDIS_URL
            redis_url = REDIS_URL
        
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            # Test connection
            self.redis_client.ping()
        except (redis.ConnectionError, redis.TimeoutError) as e:
            raise ConfigurationError(f"Failed to connect to Redis: {str(e)}")
    
    def _get_cache_key(self, ticker: str) -> str:
        """Generate cache key for a ticker."""
        return f"price:{ticker.upper()}"
    
    def _get_rate_limit_key(self, ticker: str) -> str:
        """Generate rate limit key for a ticker."""
        return f"ratelimit:{ticker.upper()}"
    
    def _check_rate_limit(self, ticker: str) -> None:
        """
        Check if request is within rate limit for the ticker.
        
        Args:
            ticker: Stock ticker symbol
            
        Raises:
            APIKeyExhausted: If rate limit exceeded
        """
        rate_key = self._get_rate_limit_key(ticker)
        current_time = time.time()
        
        # Get current request timestamps for this ticker
        timestamps = self.redis_client.lrange(rate_key, 0, -1)
        timestamps = [float(ts) for ts in timestamps]
        
        # Remove timestamps outside the current window
        valid_timestamps = [ts for ts in timestamps if current_time - ts < self.rate_window]
        
        # Check if rate limit exceeded
        if len(valid_timestamps) >= self.rate_limit:
            raise APIKeyExhausted(
                f"Rate limit exceeded for {ticker}: "
                f"{self.rate_limit} calls per {self.rate_window} seconds"
            )
        
        # Add current timestamp
        self.redis_client.rpush(rate_key, current_time)
        
        # Clean up old timestamps
        self.redis_client.ltrim(rate_key, -self.rate_limit, -1)
        
        # Set expiration on rate limit key
        self.redis_client.expire(rate_key, self.rate_window)
    
    def get_price(self, ticker: str) -> float:
        """
        Get current stock price with caching and rate limiting.
        
        First checks cache. If cache miss, checks rate limit before
        fetching from API. Caches successful API responses.
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL', 'MSFT')
            
        Returns:
            Current stock price
            
        Raises:
            TickerNotFound: If ticker is invalid
            APIKeyExhausted: If rate limit exceeded
            APITimeout: If API request times out
            APIError: If API returns unexpected error
            ConfigurationError: If Redis connection fails
        """
        cache_key = self._get_cache_key(ticker)
        
        # Try to get from cache
        try:
            cached_price = self.redis_client.get(cache_key)
            if cached_price is not None:
                return float(cached_price)
        except (redis.ConnectionError, redis.TimeoutError) as e:
            # If Redis fails, fall through to API call
            # but don't crash the service
            pass
        
        # Cache miss - check rate limit
        self._check_rate_limit(ticker)
        
        # Fetch from API
        price = self.client.get_price(ticker)
        
        # Store in cache
        try:
            self.redis_client.setex(cache_key, self.cache_ttl, price)
        except (redis.ConnectionError, redis.TimeoutError) as e:
            # If Redis fails, still return the price
            # but don't crash the service
            pass
        
        return price
