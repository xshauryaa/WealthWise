"""Configuration management for WealthWise investing service.

Loads configuration from environment variables using python-dotenv.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists (for local development)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# API Keys
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://wld@localhost:5432/wealthwise_investing"
)

# Application Settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8001"))

# Cache Configuration (for future chunks)
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "300"))  # 5 minutes
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "5"))


def validate_config() -> bool:
    """Validate that required configuration is present.
    
    Returns:
        bool: True if valid, raises exception if critical config missing.
    
    Raises:
        ValueError: If required configuration is missing.
    """
    missing = []
    
    # Check critical config (API key is validated when service is used)
    if not DATABASE_URL:
        missing.append("DATABASE_URL")
    
    if missing:
        raise ValueError(
            f"Missing required configuration: {', '.join(missing)}\n"
            "Please set these environment variables or create a .env file."
        )
    
    return True


# Validate on import (but only in production)
if ENVIRONMENT == "production":
    validate_config()

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
