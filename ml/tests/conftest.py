import pytest
import asyncio
import os
from unittest.mock import MagicMock
from dotenv import load_dotenv

# Force load environment variables for Integration tests
load_dotenv("ml/.env")

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
def mock_sleep(mocker):
    """Skip sleep delays during tests to make them instant."""
    return mocker.patch("time.sleep", return_value=None)
