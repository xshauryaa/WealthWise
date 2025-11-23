from ml.services.rag.vector_store import VectorDB
from ml.services.rag.embeddings import EmbeddingService

class ContextBuilder:
    def __init__(self):
        self.db = VectorDB()
        self.embedder = EmbeddingService()

    def retrieve_context(self, query: str, user_id: str, limit: int = 10) -> str:
        query_vector = self.embedder.embed_text(query, task_type="retrieval_query")
        
        results = self.db.search(query_vector, limit=limit, filter_dict={"user_id": user_id})
        
        if not results or not results['documents'] or not results['documents'][0]:
            return "No relevant financial history found for this user."

        docs = results['documents'][0]
        context_str = "RELEVANT TRANSACTION HISTORY:\n"
        for i, doc in enumerate(docs):
            context_str += f"- {doc}\n"
            
        return context_str
