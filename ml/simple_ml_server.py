"""
Simplified ML Server for WealthWise RAG Integration
This creates a working FastAPI server with the expected endpoints
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List, Dict, Any
import random

app = FastAPI(
    title="WealthWise ML Service",
    description="Simplified ML Service for RAG Integration Demo",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ChatRequest(BaseModel):
    user_id: str
    message: str

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

# Simulated RAG responses for demo
RAG_RESPONSES = [
    """Based on my financial expertise, here are some personalized recommendations for you:

**💰 Budgeting Strategy:**
• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings
• Track expenses daily using expense tracking apps
• Set up automatic transfers to savings accounts

**📈 Investment Tips:**
• Start with low-cost index funds for long-term growth
• Consider dollar-cost averaging for consistent investing
• Diversify across different asset classes

**🎯 Goals:**
• Build an emergency fund covering 3-6 months of expenses
• Pay off high-interest debt first
• Set specific, measurable financial goals

Would you like me to elaborate on any of these strategies?""",

    """Great question! Let me help you optimize your financial strategy:

**🏦 Savings Optimization:**
• High-yield savings accounts for emergency funds (aim for 4-5% APY)
• Consider money market accounts for better liquidity
• Automate savings to make it effortless

**💡 Smart Money Tips:**
• Use the envelope method for discretionary spending
• Take advantage of employer 401(k) matching
• Review and negotiate recurring subscriptions quarterly

**📊 Tracking Progress:**
• Set monthly budget reviews
• Use visual progress tracking (charts, apps)
• Celebrate small financial wins

**🚀 Next Steps:**
• Calculate your current net worth
• Identify your biggest expense categories
• Set up automatic bill payments to avoid late fees

What specific area would you like to focus on first?""",

    """Excellent financial question! Here's my comprehensive analysis:

**🎯 Personalized Advice:**
Based on current market trends and best practices, I recommend:

• **Emergency Fund:** Prioritize building 6 months of expenses
• **Debt Strategy:** Use the avalanche method (highest interest first)
• **Investment Allocation:** Consider your risk tolerance and time horizon

**💼 Portfolio Recommendations:**
• 70% stocks / 30% bonds for moderate risk
• Include international diversification (20-30%)
• Rebalance quarterly or when allocations drift 5%+

**📱 Technology Tools:**
• Use budgeting apps for expense tracking
• Set up automatic investments
• Monitor credit score monthly

**🔍 Regular Reviews:**
• Monthly budget check-ins
• Quarterly investment reviews
• Annual financial goal assessments

Would you like me to dive deeper into any specific strategy?"""
]

@app.get("/")
async def root():
    return {"message": "WealthWise ML Service is running!", "status": "healthy"}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "message": "ML Service is operational"}

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    RAG-powered chat endpoint
    In production, this would use ChromaDB + Gemini Flash
    """
    try:
        # Simulate RAG processing delay
        import asyncio
        await asyncio.sleep(0.5)
        
        # Select a contextual response based on message content
        message_lower = request.message.lower()
        
        if any(word in message_lower for word in ['budget', 'budgeting', 'money', 'spend']):
            response = RAG_RESPONSES[0]
        elif any(word in message_lower for word in ['save', 'saving', 'emergency', 'fund']):
            response = RAG_RESPONSES[1]
        else:
            response = random.choice(RAG_RESPONSES)
        
        return ChatResponse(response=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/api/v1/categorize", response_model=CategorizeResponse)
async def categorize_transaction(request: CategorizeRequest):
    """
    Transaction categorization endpoint
    """
    description = request.description.lower()
    
    # Simple keyword-based categorization
    categories = {
        'food': ['restaurant', 'cafe', 'grocery', 'food', 'starbucks', 'mcdonald', 'pizza'],
        'transportation': ['gas', 'uber', 'lyft', 'taxi', 'parking', 'metro', 'bus'],
        'shopping': ['amazon', 'target', 'walmart', 'store', 'mall', 'shop'],
        'entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'theater'],
        'utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
        'housing': ['rent', 'mortgage', 'apartment', 'home']
    }
    
    for category, keywords in categories.items():
        if any(keyword in description for keyword in keywords):
            return CategorizeResponse(category=category.title(), confidence=0.85)
    
    return CategorizeResponse(category="Other", confidence=0.60)

@app.post("/api/v1/anomalies", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    """
    Anomaly detection endpoint
    """
    anomalies = []
    
    if not request.transactions:
        return AnomalyResponse(anomalies=[])
    
    # Simple anomaly detection based on amount
    amounts = [t.amount for t in request.transactions]
    avg_amount = sum(amounts) / len(amounts)
    
    for i, transaction in enumerate(request.transactions):
        # Flag transactions that are 3x the average
        if transaction.amount > avg_amount * 3:
            anomalies.append({
                "transaction_index": i,
                "amount": transaction.amount,
                "description": transaction.description,
                "anomaly_type": "unusually_high_amount",
                "severity": "high" if transaction.amount > avg_amount * 5 else "medium"
            })
    
    return AnomalyResponse(anomalies=anomalies)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
