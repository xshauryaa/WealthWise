"""Market data retrieval from Alpha Vantage API."""

import requests
import time
import pandas as pd
import logging
import os
from typing import Optional, List, Dict, Union
import redis
from redis.exceptions import ConnectionError, TimeoutError

from investing.exceptions import (
    APIError,
    APIKeyExhausted,
    TickerNotFound,
    APITimeout,
    ConfigurationError
)

logger = logging.getLogger(__name__)

class AlphaVantageClient:
    """Client for fetching real-time stock prices from Alpha Vantage API."""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self, api_key: str, timeout: int = 10, max_retries: int = 3):
        if not api_key:
            api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        
        if not api_key:
            raise ConfigurationError("Alpha Vantage API key is missing.")
        
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
    
    def get_price(self, ticker: str) -> float:
        """Get current real-time price (GLOBAL_QUOTE)."""
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker.upper(),
            "apikey": self.api_key
        }
        return self._make_request(params, "05. price", "Global Quote")

    def fetch_daily_history(self, ticker: str) -> pd.DataFrame:
        """
        Fetches the last 100 days of daily adjusted closing prices.
        Uses TIME_SERIES_DAILY (Free Tier compatible).
        """
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": ticker.upper(),
            "outputsize": "compact",
            "apikey": self.api_key
        }

        data = self._make_request(params, parse_key="Time Series (Daily)")

        rows = []
        if data:
            for date_str, metrics in data.items():
                try:
                    # Use "4. close" for TIME_SERIES_DAILY
                    price = float(metrics["4. close"])
                    rows.append({"date": date_str, "price": price})
                except (KeyError, ValueError):
                    continue

        if not rows:
            logger.warning(f"No valid history found for {ticker}")
            return pd.DataFrame(columns=['date', 'price'])

        df = pd.DataFrame(rows)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        return df

    def _make_request(self, params: Dict, parse_key: str = None, root_key: str = None) -> Union[float, Dict, None]:
        for attempt in range(self.max_retries):
            try:
                response = requests.get(self.BASE_URL, params=params, timeout=self.timeout)
                response.raise_for_status()
                data = response.json()
                
                if "Note" in data:
                    note = data["Note"].lower()
                    if "call frequency" in note or "rate limit" in note:
                        raise APIKeyExhausted(data["Note"])

                if "Error Message" in data:
                    raise TickerNotFound(f"Ticker '{params.get('symbol')}' not found")

                if root_key:
                    if root_key not in data:
                         if attempt == self.max_retries - 1:
                             raise APIError(f"Missing '{root_key}' in response")
                         continue
                    data = data[root_key]

                if parse_key:
                    if isinstance(data, dict) and parse_key in data:
                        if "Time Series" in parse_key:
                            return data[parse_key]
                        try:
                            return float(data[parse_key])
                        except ValueError:
                            return data[parse_key]

                if parse_key is None and root_key is None:
                    return data
                
                if attempt == self.max_retries - 1:
                     return None

            except requests.Timeout:
                if attempt == self.max_retries - 1: raise APITimeout("Request timed out")
                time.sleep(0.5)
            except requests.RequestException as e:
                if attempt == self.max_retries - 1: raise APIError(f"API request failed: {str(e)}")
                time.sleep(0.5)
        
        return None

class CachedMarketDataService:
    def __init__(self, client: AlphaVantageClient, redis_url: str = None):
        self._client = client
        self._redis_available = False
        
        if not redis_url:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

        try:
            self._redis = redis.from_url(redis_url, socket_connect_timeout=1)
            self._redis.ping()
            self._redis_available = True
            logger.info("✅ Redis connected successfully. Caching enabled.")
        except (ConnectionError, TimeoutError, Exception):
            self._redis_available = False

    def get_price(self, ticker: str) -> float:
        if not self._redis_available:
            return self._client.get_price(ticker)
        try:
            cached = self._redis.get(f"price:{ticker}")
            if cached: return float(cached)
        except Exception: pass
        
        price = self._client.get_price(ticker)
        
        if self._redis_available:
            try: self._redis.setex(f"price:{ticker}", 300, str(price))
            except Exception: pass
        return price
    
    def fetch_history(self, ticker: str) -> pd.DataFrame:
        return self._client.fetch_daily_history(ticker)
