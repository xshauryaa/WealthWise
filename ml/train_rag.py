"""
RAG Training Script for WealthWise
Populates ChromaDB with financial transaction data for better contextual responses
"""

import pandas as pd
import sys
import os
sys.path.append('/Users/shauryathareja/Projects/WealthWise')

# Add the ML directory to the Python path
sys.path.insert(0, '/Users/shauryathareja/Projects/WealthWise/ML')

from ML.services.rag.vector_store import VectorDB
from ML.services.rag.embeddings import EmbeddingService
import hashlib
from datetime import datetime

def train_rag_system():
    """
    Train the RAG system by populating ChromaDB with transaction data
    """
    print("🚀 Starting RAG Training Process...")
    
    # Load synthetic transaction data
    data_path = '/Users/shauryathareja/Projects/WealthWise/ML/data/synthetic/transactions.csv'
    print(f"📊 Loading training data from: {data_path}")
    
    try:
        df = pd.read_csv(data_path)
        print(f"✅ Loaded {len(df)} transactions for training")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return
    
    # Initialize RAG components
    print("🔧 Initializing RAG components...")
    try:
        vector_db = VectorDB()
        embedding_service = EmbeddingService()
        print("✅ RAG components initialized")
    except Exception as e:
        print(f"❌ Error initializing RAG components: {e}")
        return
    
    # Process transactions in batches
    batch_size = 50
    total_batches = len(df) // batch_size + (1 if len(df) % batch_size != 0 else 0)
    
    print(f"📦 Processing {len(df)} transactions in {total_batches} batches...")
    
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        
        print(f"🔄 Processing batch {batch_num}/{total_batches}...")
        
        # Prepare batch data
        ids = []
        documents = []
        metadatas = []
        embeddings = []
        
        for _, transaction in batch.iterrows():
            # Create document text for embedding
            doc_text = f"""
            Transaction: ${transaction['amount']} at {transaction['merchant']} 
            Category: {transaction['category']} 
            Date: {transaction['date']} 
            User: {transaction['user_id']} 
            Persona: {transaction['persona']}
            Anomaly: {transaction['is_anomaly']}
            """.strip()
            
            # Generate unique ID
            doc_id = f"txn_{transaction['transaction_id']}"
            
            # Create metadata
            metadata = {
                'user_id': transaction['user_id'],
                'category': transaction['category'],
                'amount': float(transaction['amount']),
                'merchant': transaction['merchant'],
                'date': transaction['date'],
                'persona': transaction['persona'],
                'is_anomaly': bool(transaction['is_anomaly'])
            }
            
            try:
                # Generate embedding
                embedding = embedding_service.embed_text(doc_text, task_type="retrieval_document")
                
                ids.append(doc_id)
                documents.append(doc_text)
                metadatas.append(metadata)
                embeddings.append(embedding)
                
            except Exception as e:
                print(f"⚠️  Error processing transaction {doc_id}: {e}")
                continue
        
        # Add batch to vector database
        if embeddings:
            try:
                vector_db.add_transactions(ids, documents, metadatas, embeddings)
                print(f"✅ Added {len(embeddings)} transactions to vector database")
            except Exception as e:
                print(f"❌ Error adding batch to database: {e}")
        
    # Verify training
    total_count = vector_db.count()
    print(f"\n🎉 Training Complete!")
    print(f"📈 Total transactions in database: {total_count}")
    
    # Test the RAG system
    print("\n🧪 Testing RAG system...")
    test_rag_system(vector_db, embedding_service)

def test_rag_system(vector_db, embedding_service):
    """
    Test the trained RAG system with sample queries
    """
    test_queries = [
        "How much do I spend on food?",
        "What are my entertainment expenses?", 
        "Show me my shopping patterns",
        "Any unusual spending?"
    ]
    
    for query in test_queries:
        try:
            print(f"\n❓ Query: {query}")
            
            # Get query embedding
            query_embedding = embedding_service.embed_text(query, task_type="retrieval_query")
            
            # Search for relevant context
            results = vector_db.search(query_embedding, limit=3)
            
            if results and results['documents'] and results['documents'][0]:
                print(f"✅ Found {len(results['documents'][0])} relevant transactions")
                for i, doc in enumerate(results['documents'][0][:2]):  # Show top 2
                    print(f"   {i+1}. {doc[:100]}...")
            else:
                print("❌ No relevant transactions found")
                
        except Exception as e:
            print(f"❌ Error testing query '{query}': {e}")

if __name__ == "__main__":
    train_rag_system()
