import pytest
import os
import pandas as pd
from dotenv import load_dotenv
from ml.services.rag.advisor import AdvisorService

load_dotenv("ml/.env")

@pytest.mark.integration
def test_real_csv_loading():
    path = "ml/data/synthetic/transactions.csv"
    assert os.path.exists(path)
    df = pd.read_csv(path)
    assert len(df) > 0

@pytest.mark.integration
def test_real_advisor_call():
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("No API Key")

    advisor = AdvisorService()
    # FIX: Added dummy user_id "test_user"
    response = advisor.ask("test_user", "Summarize my recent food spending")
    
    assert response is not None
    assert len(response) > 10
