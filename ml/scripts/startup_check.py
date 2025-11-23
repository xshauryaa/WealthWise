import os
import asyncio
from ml.services.rag.vector_store import VectorStore
from ml.scripts.setup_vector_db import main as run_ingestion

async def ensure_brain_health():
    """
    Runs on server startup.
    Checks if Vector DB is healthy/populated. If not, rebuilds it.
    Essential for ephemeral file systems (Render/Railway Free Tier).
    """
    print("🏥 Performing Brain Health Check...")
    
    try:
        store = VectorStore()
        count = store.collection.count()
        print(f"🧠 Current Vector Count: {count}")
        
        if count == 0:
            print("⚠️ Brain is empty! (Likely due to server restart)")
            print("🔄 Triggering Emergency Re-ingestion...")
            await run_ingestion()
            print("✅ Brain Rebuilt Successfully.")
        else:
            print("✅ Brain is healthy.")
            
    except Exception as e:
        print(f"❌ Brain Damage Detected: {e}")
        # Optional: Force rebuild if error is DB corruption
        # await run_ingestion()

if __name__ == "__main__":
    asyncio.run(ensure_brain_health())
