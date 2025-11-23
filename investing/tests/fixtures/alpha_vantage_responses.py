"""Mock responses from Alpha Vantage API for testing."""


def mock_valid_response_voo():
    """Valid response for VOO ticker."""
    return {
        "Global Quote": {
            "01. symbol": "VOO",
            "02. open": "420.50",
            "03. high": "425.00",
            "04. low": "419.75",
            "05. price": "423.45",
            "06. volume": "2500000",
            "07. latest trading day": "2024-01-15",
            "08. previous close": "421.30",
            "09. change": "2.15",
            "10. change percent": "0.51%"
        }
    }


def mock_valid_response_bnd():
    """Valid response for BND ticker."""
    return {
        "Global Quote": {
            "01. symbol": "BND",
            "05. price": "76.89",
            "07. latest trading day": "2024-01-15"
        }
    }


def mock_ticker_not_found_response():
    """Response when ticker is not found."""
    return {
        "Error Message": "Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for GLOBAL_QUOTE."
    }


def mock_rate_limit_response():
    """Response when rate limit is exceeded."""
    return {
        "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency."
    }


def mock_malformed_response():
    """Malformed response missing expected fields."""
    return {
        "Global Quote": {
            "01. symbol": "VOO"
            # Missing price field
        }
    }


def mock_empty_response():
    """Empty response."""
    return {}
