class MLServiceException(Exception):
    """Base exception for ML service errors."""
    pass

class ModelInferenceError(MLServiceException):
    """Raised when Gemini or local models fail."""
    pass

class RateLimitExceeded(MLServiceException):
    """Raised when we hit 15 RPM."""
    pass

class DataIngestionError(MLServiceException):
    """Raised when synthetic data or vector DB fails."""
    pass
