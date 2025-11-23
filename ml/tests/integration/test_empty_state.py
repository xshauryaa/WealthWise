import pytest
import os
import uuid
from dotenv import load_dotenv
from ml.services.rag.advisor import AdvisorService

load_dotenv("ml/.env")

@pytest.mark.integration
def test_advisor_new_user_no_history():
    """
    Real API Test: Ask a question for a random new UUID that definitely
    has no data in ChromaDB.
    """
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("No API Key")

    advisor = AdvisorService()
    new_user_id = f"ghost_user_{uuid.uuid4()}"
    
    # Ask a question that requires data
    response = advisor.ask(new_user_id, "How much did I spend on food?")
    
    # Verification: The AI should explicitly say it can't find data.
    # It should NOT hallucinate a number.
    denial_phrases = [
        "no record", 
        "don't see", 
        "no information", 
        "no transaction", 
        "unable to find",
        "don't have any data", # Added this specific phrase
        "do not have any data"
    ]
    
    print(f"\n[Real AI Response]: {response}")
    
    # Normalize to lower case for checking
    response_lower = response.lower()
    
    assert any(phrase in response_lower for phrase in denial_phrases), \
        f"AI Hallucinated data for empty user! Response: {response}"
