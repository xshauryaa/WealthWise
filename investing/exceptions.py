"""Custom exceptions for WealthWise investing service."""


class InvestingError(Exception):
    """Base exception for all investing service errors."""
    pass


class ConfigurationError(InvestingError):
    """Raised when required configuration is missing or invalid."""
    pass


class APIError(InvestingError):
    """Base exception for external API errors."""
    pass


class APIKeyExhausted(APIError):
    """Raised when API rate limit is exceeded."""
    
    def __init__(self, message="API rate limit exceeded. Please wait before making more requests."):
        self.message = message
        super().__init__(self.message)


class TickerNotFound(APIError):
    """Raised when the requested ticker symbol is not found."""
    
    def __init__(self, ticker: str):
        self.ticker = ticker
        self.message = f"Ticker '{ticker}' not found or invalid."
        super().__init__(self.message)


class APITimeout(APIError):
    """Raised when API request times out."""
    
    def __init__(self, message="API request timed out."):
        self.message = message
        super().__init__(self.message)
