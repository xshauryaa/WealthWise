"""
Real RAG-Enabled ML Server for WealthWise
This creates a proper ML server with trained RAG system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import pandas as pd
from typing import List, Dict, Any
import google.generativeai as genai
import chromadb
from chromadb.config import Settings
import hashlib
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WealthWise ML Service with RAG",
    description="ML Service with Real RAG Training",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GEMINI_API_KEY = "AIzaSyACQoVgolr435LoOTvRaJ0FRdBqPhrtPBU"  # From .env file
CHROMA_DB_PATH = "/Users/shauryathareja/Projects/WealthWise/ML/data/chroma_db"
DATA_PATH = "/Users/shauryathareja/Projects/WealthWise/ML/data/synthetic/transactions.csv"

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Initialize ChromaDB
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = None

# Global variables for RAG system
is_trained = False
training_data_count = 0

# Request/Response Models
class ChatRequest(BaseModel):
    user_id: str
    message: str
    budget_context: str = ""
    spending_insights: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    response: str

class CategorizeRequest(BaseModel):
    description: str

class CategorizeResponse(BaseModel):
    category: str
    confidence: float

class Transaction(BaseModel):
    amount: float
    description: str
    category: str

class AnomalyRequest(BaseModel):
    transactions: List[Transaction]

class AnomalyResponse(BaseModel):
    anomalies: List[Dict[str, Any]]

def initialize_rag_system():
    """Initialize and train the RAG system"""
    global collection, is_trained, training_data_count
    
    logger.info("🚀 Initializing RAG system...")
    
    try:
        # Get or create collection
        collection = client.get_or_create_collection(
            name="financial_transactions",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Check if already trained
        existing_count = collection.count()
        if existing_count > 0:
            logger.info(f"✅ Found existing training data: {existing_count} transactions")
            is_trained = True
            training_data_count = existing_count
            return
        
        # Load and train with synthetic data
        logger.info("📊 Loading training data...")
        df = pd.read_csv(DATA_PATH)
        
        logger.info(f"🔄 Training RAG system with {len(df)} transactions...")
        
        # Process data in batches for better performance
        batch_size = 100
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            
            ids = []
            documents = []
            metadatas = []
            
            for _, transaction in batch.iterrows():
                # Create rich document text for better RAG retrieval
                doc_text = f"""
Transaction Details:
- Amount: ${transaction['amount']:.2f}
- Merchant: {transaction['merchant']}
- Category: {transaction['category']}
- Date: {transaction['date']}
- User: {transaction['user_id']}
- Persona: {transaction['persona']}
- Anomaly: {transaction['is_anomaly']}

This transaction shows spending behavior in the {transaction['category']} category.
                """.strip()
                
                # Create metadata for filtering
                metadata = {
                    'user_id': transaction['user_id'],
                    'category': transaction['category'],
                    'amount': float(transaction['amount']),
                    'merchant': transaction['merchant'],
                    'persona': transaction['persona'],
                    'is_anomaly': bool(transaction['is_anomaly'])
                }
                
                doc_id = f"txn_{transaction['transaction_id']}"
                
                ids.append(doc_id)
                documents.append(doc_text)
                metadatas.append(metadata)
            
            # Add batch to ChromaDB (ChromaDB will handle embeddings automatically)
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            
            logger.info(f"✅ Processed batch {i//batch_size + 1}/{(len(df)//batch_size) + 1}")
        
        training_data_count = collection.count()
        is_trained = True
        logger.info(f"🎉 RAG system trained successfully! Total transactions: {training_data_count}")
        
    except Exception as e:
        logger.error(f"❌ Error initializing RAG system: {e}")
        is_trained = False

def get_rag_context(query: str, user_id: str = None, limit: int = 5):
    """Get relevant context from ChromaDB for RAG"""
    if not is_trained or not collection:
        return "No training data available."
    
    try:
        # Build filter if user_id provided
        where_filter = {"user_id": user_id} if user_id else None
        
        # Query ChromaDB for relevant context
        results = collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_filter
        )
        
        if not results['documents'] or not results['documents'][0]:
            return "No relevant financial data found."
        
        # Build context string from retrieved documents
        context = "RELEVANT FINANCIAL DATA:\n"
        for i, doc in enumerate(results['documents'][0]):
            context += f"{i+1}. {doc}\n\n"
        
        return context
        
    except Exception as e:
        logger.error(f"❌ Error retrieving context: {e}")
        return "Error retrieving financial context."

def generate_rag_response(user_query: str, context: str, user_id: str, budget_context: str = "", spending_insights: Dict = None):
    """Generate response using Gemini with RAG context and budget data"""
    try:
        # Combine RAG context with budget context for richer responses
        combined_context = context
        if budget_context:
            combined_context += f"\n\nCURRENT BUDGET DATA:\n{budget_context}"
        
        # Add insights if available
        if spending_insights:
            alerts = spending_insights.get('alerts', [])
            recommendations = spending_insights.get('recommendations', [])
            achievements = spending_insights.get('achievements', [])
            
            if alerts:
                combined_context += f"\n\nBUDGET ALERTS:\n"
                for alert in alerts[:3]:  # Limit to top 3 alerts
                    combined_context += f"• {alert.get('message', '')}\n"
            
            if recommendations:
                combined_context += f"\n\nRECOMMENDATIONS:\n"
                for rec in recommendations[:2]:  # Limit to top 2 recommendations
                    combined_context += f"• {rec.get('message', '')} - {rec.get('action', '')}\n"
            
            if achievements:
                combined_context += f"\n\nPOSITIVE INSIGHTS:\n"
                for achievement in achievements[:2]:  # Limit to top 2 achievements
                    combined_context += f"• {achievement.get('message', '')}\n"

        system_prompt = f"""
You are Penny, WealthWise's AI financial advisor. You're helpful, knowledgeable, and provide practical financial advice based on real user data.

USER QUESTION: "{user_query}"

AVAILABLE DATA:
{combined_context}

INSTRUCTIONS:
1. Answer the user's question using BOTH the transaction history AND current budget data
2. Provide specific numbers, amounts, and percentages from their actual data
3. Compare spending patterns to budget limits and goals
4. Give actionable advice based on their current financial situation
5. Be encouraging but honest about areas needing improvement
6. Use emojis and formatting to make responses engaging
7. If they're over budget in any category, provide specific guidance
8. Celebrate achievements when they're under budget
9. Focus on practical, implementable suggestions

Respond as Penny would - friendly, professional, data-driven, and focused on helping the user improve their financial health.
        """
        
        # Try multiple model names in order of preference
        model_names = [
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest', 
            'gemini-1.5-flash',
            'gemini-pro'
        ]
        
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(system_prompt)
                logger.info(f"✅ Successfully used model: {model_name}")
                return response.text.strip()
            except Exception as model_error:
                logger.warning(f"⚠️ Model {model_name} failed: {model_error}")
                continue
        
        # If all models fail, provide intelligent fallback with budget data
        return generate_intelligent_fallback_with_budget(user_query, combined_context, budget_context, spending_insights)
        
    except Exception as e:
        logger.error(f"❌ Error generating RAG response: {e}")
        return generate_intelligent_fallback_with_budget(user_query, context, budget_context, spending_insights)

def generate_intelligent_fallback_with_budget(user_query: str, context: str, budget_context: str = "", spending_insights: Dict = None):
    """Generate an intelligent fallback response with budget data when Gemini is unavailable"""
    query_lower = user_query.lower()
    
    # Enhanced responses using budget context if available
    if budget_context:
        # Extract budget info from context for smart responses
        if 'Total Spent:' in budget_context and 'Total Monthly Budget:' in budget_context:
            budget_lines = budget_context.split('\n')
            budget_info = {}
            for line in budget_lines:
                if 'Total Monthly Budget:' in line:
                    budget_info['total_budget'] = line.split('$')[1].split(' ')[0] if '$' in line else 'unknown'
                elif 'Total Spent:' in line:
                    budget_info['total_spent'] = line.split('$')[1].split(' ')[0] if '$' in line else 'unknown'
                elif 'Remaining:' in line:
                    budget_info['remaining'] = line.split('$')[1].split(' ')[0] if '$' in line else 'unknown'
                elif 'Budget Utilization:' in line:
                    budget_info['utilization'] = line.split(': ')[1].split('%')[0] if '%' in line else 'unknown'
            
            # Budget-aware greetings
            if any(word in query_lower for word in ['hello', 'hi', 'hey', 'greetings']):
                return f"""Hello! 👋 I'm Penny, your AI financial advisor. 

Looking at your current budget status:
• You've spent ${budget_info.get('total_spent', 'X')} out of your ${budget_info.get('total_budget', 'X')} monthly budget
• That's {budget_info.get('utilization', 'X')}% of your budget used
• You have ${budget_info.get('remaining', 'X')} remaining this month

How can I help you optimize your finances today? 💰"""
            
            # Budget-specific responses
            elif any(word in query_lower for word in ['budget', 'spending', 'money']):
                utilization = float(budget_info.get('utilization', 0)) if budget_info.get('utilization') != 'unknown' else 0
                if utilization > 90:
                    return f"""⚠️ **Budget Alert!** You've used {budget_info.get('utilization')}% of your monthly budget.

You've spent ${budget_info.get('total_spent')} out of ${budget_info.get('total_budget')}, leaving only ${budget_info.get('remaining')} for the rest of the month.

**Quick Action Steps:**
• Review recent transactions for unnecessary expenses
• Focus on essential purchases only
• Consider meal prep to reduce food costs
• Avoid impulse buying this month

Need help identifying where to cut back? Ask me about specific spending categories! 📊"""
                elif utilization > 70:
                    return f"""📊 You're at {budget_info.get('utilization')}% of your monthly budget - getting close to your limit!

**Current Status:**
• Spent: ${budget_info.get('total_spent')}
• Budget: ${budget_info.get('total_budget')}
• Remaining: ${budget_info.get('remaining')}

**Staying on Track Tips:**
• Monitor daily spending closely
• Stick to planned purchases only
• Use the envelope method for discretionary spending
• Set up spending alerts for categories near their limits

You're doing well managing your money! 💪"""
                else:
                    return f"""✅ Great job! You've used {budget_info.get('utilization')}% of your budget - well within healthy limits.

**Your Progress:**
• Spent: ${budget_info.get('total_spent')}
• Budget: ${budget_info.get('total_budget')}
• Available: ${budget_info.get('remaining')}

**Ideas for your remaining budget:**
• Build emergency savings
• Invest in your future
• Treat yourself responsibly
• Plan for upcoming expenses

Keep up the excellent financial discipline! 🌟"""

    # Handle category-specific questions with budget context
    if 'food' in query_lower or 'dining' in query_lower:
        if 'Food & Dining' in budget_context:
            return """Looking at your Food & Dining budget, here's what I can see from your data:

**Smart Food Budget Tips:**
• Plan meals weekly to reduce impulse purchases 📝
• Use grocery store apps for coupons and deals 💰
• Try batch cooking on weekends 🍳
• Limit dining out to special occasions 🍽️
• Shop with a list and stick to it! 🛒

Would you like specific suggestions based on your spending patterns? I can help you optimize your food budget further!"""
    
    # Fallback to original response if no budget context
    return generate_intelligent_fallback(user_query, context)

def generate_intelligent_fallback(user_query: str, context: str):
    """Generate an intelligent fallback response when Gemini is unavailable"""
    query_lower = user_query.lower()
    
    # Analyze the query and provide contextual responses
    if any(word in query_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        return "Hello! 👋 I'm Penny, your AI financial advisor. I'm here to help you with budgeting, saving, investing, and all your financial questions. What would you like to know about managing your money better?"
    
    elif any(word in query_lower for word in ['budget', 'budgeting', 'spend', 'expenses']):
        return """Great question about budgeting! Here are some key strategies:

💰 **Budget Basics:**
• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings
• Track all expenses for at least a week to understand patterns
• Use budgeting apps or spreadsheets for easy monitoring

📊 **Smart Tips:**
• Pay yourself first - automate savings
• Review and adjust monthly
• Set realistic goals you can stick to

Would you like specific advice on any category of spending?"""
    
    elif any(word in query_lower for word in ['save', 'saving', 'emergency', 'fund']):
        return """Excellent focus on saving! Here's my advice:

🎯 **Savings Strategy:**
• Emergency fund: Start with $1,000, then build to 3-6 months expenses
• Automate transfers to savings accounts
• Use high-yield savings accounts (look for 4-5% APY)

💡 **Quick Wins:**
• Save loose change and small bills
• Put tax refunds directly into savings
• Try the 52-week challenge

What specific savings goal are you working toward?"""
    
    elif any(word in query_lower for word in ['invest', 'investment', 'stocks', 'retirement']):
        return """Smart thinking about investing! Here's where to start:

📈 **Investment Basics:**
• Start with low-cost index funds
• Consider target-date funds for retirement
• Dollar-cost averaging reduces risk

🏦 **Account Priorities:**
• Max out employer 401(k) match first
• Then consider Roth IRA
• Invest consistently, even small amounts

💼 **Risk Management:**
• Diversify across asset classes
• Time in market beats timing the market
• Start early, even with $25/month

What's your investment timeline and risk tolerance?"""
    
    else:
        return f"""Thanks for your question about "{user_query}"! 

As your AI financial advisor, I'm here to help with:
• **Budgeting** and expense tracking
• **Saving** strategies and emergency funds  
• **Investment** advice for beginners
• **Debt** management and payoff strategies
• **Goal setting** for financial success

Could you tell me more specifically what financial area you'd like help with? I can provide personalized advice! 💪💰"""

@app.on_event("startup")
async def startup_event():
    """Initialize RAG system on startup"""
    initialize_rag_system()

@app.get("/")
async def root():
    return {
        "message": "WealthWise ML Service with Real RAG", 
        "status": "healthy",
        "rag_trained": is_trained,
        "training_data_count": training_data_count
    }

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "ML Service is operational",
        "rag_system": "trained" if is_trained else "not_trained",
        "transactions": training_data_count
    }

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    RAG-powered chat endpoint with budget context integration
    """
    try:
        logger.info(f"💬 Chat request from {request.user_id}: {request.message}")
        if request.budget_context:
            logger.info(f"📊 Budget context included: {len(request.budget_context)} characters")
        
        # Get relevant context using RAG
        rag_context = get_rag_context(request.message, request.user_id, limit=5)
        
        # Generate response using Gemini + RAG context + Budget data
        response = generate_rag_response(
            request.message, 
            rag_context, 
            request.user_id,
            request.budget_context,
            request.spending_insights
        )
        
        logger.info(f"✅ Generated enhanced RAG response for {request.user_id}")
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/api/v1/categorize", response_model=CategorizeResponse)
async def categorize_transaction(request: CategorizeRequest):
    """Transaction categorization endpoint"""
    description = request.description.lower()
    
    # Enhanced keyword-based categorization
    categories = {
        'food': ['restaurant', 'cafe', 'grocery', 'food', 'starbucks', 'mcdonald', 'pizza', 'subway', 'trader joe'],
        'transportation': ['gas', 'uber', 'lyft', 'taxi', 'parking', 'metro', 'bus', 'chevron', 'shell'],
        'shopping': ['amazon', 'target', 'walmart', 'store', 'mall', 'shop', 'apple store'],
        'entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'theater'],
        'utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
        'housing': ['rent', 'mortgage', 'apartment', 'home']
    }
    
    for category, keywords in categories.items():
        if any(keyword in description for keyword in keywords):
            return CategorizeResponse(category=category.title(), confidence=0.90)
    
    return CategorizeResponse(category="Other", confidence=0.60)

@app.post("/api/v1/anomalies", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    """Enhanced anomaly detection"""
    anomalies = []
    
    if not request.transactions:
        return AnomalyResponse(anomalies=[])
    
    # Calculate statistics
    amounts = [t.amount for t in request.transactions]
    avg_amount = sum(amounts) / len(amounts)
    
    # Enhanced anomaly detection
    for i, transaction in enumerate(request.transactions):
        # Multiple anomaly criteria
        is_anomaly = False
        anomaly_reasons = []
        
        # High amount anomaly
        if transaction.amount > avg_amount * 3:
            is_anomaly = True
            anomaly_reasons.append("unusually_high_amount")
        
        # Category-specific anomalies
        if transaction.category.lower() == "entertainment" and transaction.amount > 200:
            is_anomaly = True
            anomaly_reasons.append("high_entertainment_spending")
        
        if is_anomaly:
            anomalies.append({
                "transaction_index": i,
                "amount": transaction.amount,
                "description": transaction.description,
                "category": transaction.category,
                "anomaly_reasons": anomaly_reasons,
                "severity": "high" if transaction.amount > avg_amount * 5 else "medium"
            })
    
    return AnomalyResponse(anomalies=anomalies)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
