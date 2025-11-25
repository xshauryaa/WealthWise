"""Pytest configuration and fixtures for WealthWise investing service."""
import pytest
import os
from investing.models.base import _engine, _session_factory

@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """Set up test environment variables for all tests."""
    # 1. Set environment to TEST
    monkeypatch.setenv("ENVIRONMENT", "test")
    
    # 2. Mock API Key
    if not os.getenv("ALPHA_VANTAGE_API_KEY"):
        monkeypatch.setenv("ALPHA_VANTAGE_API_KEY", "test_api_key")
    
    # 3. CRITICAL FIX: Force SQLite for tests (matches your local DB)
    # We use an absolute path or simple filename. 
    # Since you run tests from root, this finds the DB we just verified.
    monkeypatch.setenv("DATABASE_URL", "sqlite:///wealthwise.db")

    # 4. Reset SQLAlchemy engine cache to ensure it picks up the new URL
    import investing.models.base
    investing.models.base._engine = None
    investing.models.base._session_factory = None
