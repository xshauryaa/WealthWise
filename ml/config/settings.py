import json
import os
from functools import lru_cache
from pathlib import Path
from typing import List, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
TAXONOMY_PATH = BASE_DIR / "config" / "taxonomy.json"
ENV_PATH = BASE_DIR / ".env"  # <--- FORCE ABSOLUTE PATH TO .ENV

class Settings(BaseSettings):
    # Infrastructure
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    REDIS_URL: str = "redis://localhost:6379/0"
    CHROMA_DB_PATH: str = str(BASE_DIR / "data" / "chroma_db")

    # API Keys
    GEMINI_API_KEY: str

    # Rate Limiting (Gemini Free Tier)
    GEMINI_RPM_LIMIT: int = 15
    GEMINI_TPD_LIMIT: int = 1_000_000

    # ML Parameters
    SIMILARITY_TOP_K: int = 5
    ANOMALY_STD_THRESHOLD: float = 2.0

    # Point strictly to the calculated ENV_PATH
    model_config = SettingsConfigDict(env_file=ENV_PATH, extra="ignore")

    def get_taxonomy(self) -> Dict[str, Any]:
        """Load the taxonomy JSON file."""
        if not TAXONOMY_PATH.exists():
            raise FileNotFoundError(f"Taxonomy file not found at {TAXONOMY_PATH}")
        with open(TAXONOMY_PATH, "r") as f:
            return json.load(f)

    @property
    def CATEGORIES(self) -> List[str]:
        return self.get_taxonomy()["categories"]

@lru_cache()
def get_settings() -> Settings:
    return Settings()
