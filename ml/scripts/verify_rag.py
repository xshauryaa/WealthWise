from ml.services.rag.vector_store import VectorDB
from ml.services.rag.embeddings import EmbeddingService

def test_brain():
    print("🧠 TESTING THE RAG BRAIN...")
    
    db = VectorDB()
    embedder = EmbeddingService()
    
    query = "I need some caffeine"
    print(f"🔎 Query: '{query}'")
    
    # TELL GOOGLE THIS IS A QUESTION, NOT A DOCUMENT
    vector = embedder.embed_text(query, task_type="retrieval_query")
    
    results = db.search(vector, limit=3)
    
    print("\n👇 RETRIEVED TRANSACTIONS:")
    if results and results['documents']:
        docs = results['documents'][0]
        success = False
        for i, doc in enumerate(docs):
            print(f"   {i+1}. {doc}")
            if "Starbucks" in doc or "Coffee" in doc:
                success = True
                
        if success:
            print("\n✅ SUCCESS: The AI linked 'caffeine' to Starbucks.")
        else:
            print("\n❌ FAILURE: Still retrieving random data.")
    else:
        print("\n❌ FAILURE: No results returned.")

if __name__ == "__main__":
    test_brain()
