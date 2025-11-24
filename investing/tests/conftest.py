"""Pytest configuration and fixtures for WealthWise investing service."""
import pytest
import os

@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """Set up test environment variables for all tests.
    
    This fixture runs automatically for all tests.
    """
    # Set test environment
    monkeypatch.setenv("ENVIRONMENT", "test")
    
    # Set default test API key (if not already set)
    if not os.getenv("ALPHA_VANTAGE_API_KEY"):
        monkeypatch.setenv("ALPHA_VANTAGE_API_KEY", "test_api_key")
    
    # Use the actual development database (not a separate test database)
    # In Chunk 4, we use the same database for dev and testing
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql://wld@localhost:5432/wealthwise_investing"
    )

@pytest.fixture
def sample_config():
    """Provide sample configuration for tests."""
    return {
        "api_key": "test_api_key_12345",
        "environment": "test",
        "database_url": "postgresql://test:test@localhost:5432/test_db"
    }

@pytest.fixture
def mock_env_vars(monkeypatch):
    """Fixture to easily set environment variables in tests.
    
    Usage:
        def test_something(mock_env_vars):
            mock_env_vars({"MY_VAR": "value"})
    """
    def _set_env_vars(env_dict: dict):
        for key, value in env_dict.items():
            monkeypatch.setenv(key, str(value))
    
    return _set_env_vars
