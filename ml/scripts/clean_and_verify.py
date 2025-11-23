import pandas as pd
import shutil
import os
from ml.scripts.setup_vector_db import ingest_data
from ml.services.rag.vector_store import VectorDB
from ml.services.rag.embeddings import EmbeddingService

def clean_and_verify():
    print("🧹 STARTING CLEANUP & VERIFICATION...")
    
    # 1. Fix CSV (Remove Duplicates)
    csv_path = "ml/data/synthetic/transactions.csv"
    try:
        df = pd.read_csv(csv_path)
        initial_count = len(df)
        
        # Deduplicate by ID (Keep the last one)
        df = df.drop_duplicates(subset=['transaction_id'], keep='last')
        cleaned_count = len(df)
        
        if initial_count != cleaned_count:
            print(f"   👉 Removed {initial_count - cleaned_count} duplicate rows from CSV.")
            df.to_csv(csv_path, index=False)
        else:
            print("   ✅ CSV is clean (no duplicates).")
            
        # Double check SpaceX exists
        if not df['merchant'].str.contains("SpaceX").any():
             print("   ⚠️ SpaceX missing? Something is wrong.")
        else:
             print("   ✅ SpaceX transaction confirmed in CSV.")
             
    except Exception as e:
        print(f"❌ CSV Error: {e}")
        return

    # 2. Wipe Database (Fresh Start to avoid corruption)
    db_path = "ml/data/chroma_db"
    if os.path.exists(db_path):
        print("   🗑️  Wiping old ChromaDB...")
        shutil.rmtree(db_path)
    
    # 3. Re-Ingest
    print("\n🔄 Running Ingestion...")
    ingest_data()
    
    # 4. Verify Directly
    print("\n🕵️ Verifying Database Content...")
    db = VectorDB()
    emb = EmbeddingService()
    
    vec = emb.embed_text("SpaceX", task_type="retrieval_query")
    results = db.search(vec, limit=1)
    
    if results and results['documents']:
        doc_text = results['documents'][0][0]
        print(f"   👇 Top Database Result: {doc_text}")
        
        if "SpaceX" in doc_text:
            print("\n✅ SUCCESS: The Brain definitely contains SpaceX.")
        else:
            print("\n❌ FAILURE: Data missing from DB.")
    else:
        print("\n❌ FAILURE: No results returned.")

if __name__ == "__main__":
    clean_and_verify()
