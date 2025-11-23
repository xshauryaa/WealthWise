import chromadb
from typing import List, Dict, Any, Optional
from ml.config.settings import get_settings

class VectorDB:
    def __init__(self):
        self.settings = get_settings()
        self.client = chromadb.PersistentClient(path=self.settings.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection(
            name="transactions",
            metadata={"hnsw:space": "cosine"}
        )

    def add_transactions(self, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]], embeddings: List[List[float]]):
        self.collection.upsert(ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings)

    def search(self, query_embedding: List[float], limit: int = 5, filter_dict: Optional[Dict[str, Any]] = None):
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=filter_dict
        )
    
    def count(self):
        return self.collection.count()
