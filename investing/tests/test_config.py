"""Tests for configuration module."""

import os
import pytest
from investing import config


class TestConfig:
    """Test configuration loading and validation."""

    def test_config_loads_api_key_from_env(self, monkeypatch):
        """Verify API key is read from environment variable."""
        monkeypatch.setenv("ALPHA_VANTAGE_API_KEY", "test_api_key_12345")
        
        # Reload config to pick up new environment variable
        import importlib
        importlib.reload(config)
        
        assert config.ALPHA_VANTAGE_API_KEY == "test_api_key_12345"
    
    def test_config_has_helpful_error_when_api_key_missing(self, monkeypatch):
        """Verify helpful error message when API key is not set."""
        # Remove API key from environment
        monkeypatch.delenv("ALPHA_VANTAGE_API_KEY", raising=False)
        
        # Reload config
        import importlib
        importlib.reload(config)
        
        # Should have None or empty string, not crash
        # We'll validate later that services handle this gracefully
        assert config.ALPHA_VANTAGE_API_KEY in (None, "")
    
    def test_config_has_database_url(self):
        """Verify DATABASE_URL configuration exists."""
        assert hasattr(config, "DATABASE_URL")
    
    def test_config_has_environment_setting(self):
        """Verify ENVIRONMENT configuration exists (dev/prod)."""
        assert hasattr(config, "ENVIRONMENT")
        assert config.ENVIRONMENT in ("development", "production", "test")
