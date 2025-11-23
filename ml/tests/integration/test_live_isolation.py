import pytest
import os
import uuid
from ml.services.rag.vector_store import VectorDB
from ml.services.rag.embeddings import EmbeddingService
from ml.services.rag.advisor import AdvisorService

@pytest.mark.integration
def test_rag_user_isolation():
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("No API Key found")

    db = VectorDB()
    embedder = EmbeddingService()
    advisor = AdvisorService()
    
    user_a = f"user_A_{uuid.uuid4().hex[:8]}"
    user_b = f"user_B_{uuid.uuid4().hex[:8]}"
    secret_merchant = "Golden Elephant Casino" 
    
    text = f"Merchant: {secret_merchant}, Amount: $1000, Category: Gamble, User: {user_a}"
    vec = embedder.embed_text(text, "retrieval_document")
    
    db.add_transactions(
        ids=[f"tx_{uuid.uuid4()}"],
        documents=[text],
        metadatas=[{"user_id": user_a, "amount": 1000.0}],
        embeddings=[vec]
    )
    
    print(f"\n[TEST] Injected secret for {user_a}")

    print(f"[TEST] Asking as {user_b}...")
    response_b = advisor.ask(user_b, "Did I spend money at a Casino?")
    
    # FIX: Accept 'no information' as a valid denial
    denial_phrases = ["no record", "don't see", "no information", "don't have any"]
    assert any(phrase in response_b.lower() for phrase in denial_phrases), f"AI did not deny knowledge! Response: {response_b}"
    
    print(f"[TEST] Asking as {user_a}...")
    response_a = advisor.ask(user_a, "Did I spend money at a Casino?")
    
    assert secret_merchant in response_a or "1000" in response_a
