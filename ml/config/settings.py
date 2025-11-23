import json
import os
from functools import lru_cache
from pathlib import Path
from typing import List, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
TAXONOMY_PATH = BASE_DIR / "config" / "taxonomy.json"
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    REDIS_URL: str = "redis://localhost:6379/0"
    CHROMA_DB_PATH: str = str(BASE_DIR / "data" / "chroma_db")
    GEMINI_API_KEY: str
    
    # DYNAMIC MODEL LOADING
    GEMINI_MODEL: str = "gemini-1.5-flash" # Default fallback

    GEMINI_RPM_LIMIT: int = 15
    SIMILARITY_TOP_K: int = 5
    ANOMALY_STD_THRESHOLD: float = 2.0

    model_config = SettingsConfigDict(env_file=ENV_PATH, extra="ignore")

    def get_taxonomy(self) -> Dict[str, Any]:
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
