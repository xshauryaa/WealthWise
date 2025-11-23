import pandas as pd
import os
from ml.services.rag.vector_store import VectorDB
from ml.services.rag.embeddings import EmbeddingService
from ml.scripts.setup_vector_db import ingest_data

def force_update():
    print("🔧 STARTING FORCE UPDATE...")
    csv_path = "ml/data/synthetic/transactions.csv"
    
    # 1. Force-Append the Transaction
    df = pd.read_csv(csv_path)
    if "SpaceX" not in df['merchant'].values:
        print("   👉 Injecting SpaceX transaction into CSV...")
        new_row = {
            "transaction_id": "999999999999",
            "user_id": "user_test_99",
            "date": "2025-11-25T10:00:00",
            "merchant": "SpaceX Ticket",
            "amount": 50000.00,
            "category": "Travel",
            "persona": "The Partier",
            "is_anomaly": True
        }
        # Append safely
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        df.to_csv(csv_path, index=False)
        print("   ✅ CSV Updated.")
    else:
        print("   ℹ️ SpaceX transaction already exists in CSV.")

    # 2. Run Ingestion (Rebuilds DB)
    print("\n🔄 Re-running Ingestion...")
    ingest_data()

    # 3. Verify DB Content Directly
    print("\n🕵️ Verifying Database Content...")
    db = VectorDB()
    emb = EmbeddingService()
    
    # Search for it specifically
    vec = emb.embed_text("SpaceX", task_type="retrieval_query")
    results = db.search(vec, limit=1)
    
    doc_text = results['documents'][0][0]
    print(f"   👇 Top Database Result: {doc_text}")
    
    if "SpaceX" in doc_text:
        print("\n✅ SUCCESS: The Brain definitely contains SpaceX.")
    else:
        print("\n❌ FAILURE: Data missing from DB.")

if __name__ == "__main__":
    force_update()
