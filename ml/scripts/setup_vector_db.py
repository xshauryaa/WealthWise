import pandas as pd
import time
from ml.services.rag.embeddings import EmbeddingService
from ml.services.rag.vector_store import VectorDB  # <--- FIXED NAME

def ingest_data():
    print("🚀 Starting Vector Database Ingestion...")
    
    # 1. Load Data (Includes your manual SpaceX entry)
    try:
        df = pd.read_csv("ml/data/synthetic/transactions.csv")
        print(f"📄 Loaded {len(df)} transactions from CSV")
    except FileNotFoundError:
        print("❌ Error: ml/data/synthetic/transactions.csv not found.")
        return

    embedder = EmbeddingService()
    db = VectorDB() # <--- FIXED USAGE

    ids = []
    documents = []
    metadatas = []
    
    print("⚙️  Processing rows...")
    for _, row in df.iterrows():
        doc_text = (
            f"Date: {row['date']}, "
            f"Merchant: {row['merchant']}, "
            f"Amount: ${row['amount']}, "
            f"Category: {row['category']}, "
            f"User: {row['user_id']}"
        )
        
        ids.append(str(row['transaction_id']))
        documents.append(doc_text)
        metadatas.append({
            "user_id": str(row['user_id']),
            "category": str(row['category']),
            "amount": float(row['amount']),
            "date": str(row['date'])
        })

    # Embed in batches
    batch_size = 50
    total_batches = (len(ids) + batch_size - 1) // batch_size
    
    print(f"📡 Embedding {len(ids)} documents...")
    
    for i in range(0, len(ids), batch_size):
        batch_ids = ids[i:i+batch_size]
        batch_docs = documents[i:i+batch_size]
        batch_meta = metadatas[i:i+batch_size]
        
        try:
            batch_embeddings = embedder.embed_batch(batch_docs)
            db.add_transactions(batch_ids, batch_docs, batch_meta, batch_embeddings)
            print(f"   ✅ Batch {i//batch_size + 1}/{total_batches} complete")
            time.sleep(1)
        except Exception as e:
            print(f"   ❌ Batch failed: {e}")

    print(f"🎉 Ingestion Complete! Database contains {db.count()} vectors.")

if __name__ == "__main__":
    ingest_data()
