from ml.services.rag.vector_store import VectorStore

def audit():
    print("🕵️ AUDITING VECTOR DATABASE...")
    try:
        store = VectorStore()
        # Fetch 1 random item
        result = store.collection.get(limit=1)
        
        if not result['metadatas']:
            print("❌ DATABASE IS EMPTY.")
            return

        meta = result['metadatas'][0]
        print(f"\n👇 RAW DATA SAMPLE (What the AI actually sees):")
        print(meta)
        
        merchant = meta.get('merchant')
        print(f"\n🔎 MERCHANT FIELD CHECK: '{merchant}'")
        
        if not merchant or merchant == "Unknown":
            print("🚨 DIAGNOSIS: CORRUPTED. The merchant field is missing/empty.")
        else:
            print("✅ DIAGNOSIS: Data looks valid. The bug is elsewhere.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")

if __name__ == "__main__":
    audit()
