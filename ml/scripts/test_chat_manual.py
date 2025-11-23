import asyncio
import pandas as pd
from pathlib import Path
from ml.services.rag.chat import ChatService
from ml.core.models import ChatRequest

# Dynamic Path Resolution
BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data" / "synthetic" / "transactions.csv"

def get_real_user_from_data():
    if not CSV_PATH.exists():
        print(f"❌ CRITICAL ERROR: Data file not found at {CSV_PATH}")
        return None
    
    try:
        df = pd.read_csv(CSV_PATH, usecols=['user_id'])
        if df.empty: return None
        top_user = df['user_id'].value_counts().idxmax()
        count = df['user_id'].value_counts().max()
        print(f"✅ Found User: {top_user} ({count} transactions)")
        return top_user
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return None

async def main():
    print("⚙️  Initializing System...")
    target_user_id = get_real_user_from_data()
    
    if not target_user_id:
        return

    # Ensure ChatService is initialized AFTER VectorStore is ready
    try:
        chat_service = ChatService()
    except Exception as e:
        print(f"❌ Failed to init ChatService: {e}")
        return

    print(f"\n🤖 WealthWise AI Online. Acting as user: {target_user_id}")
    print("-" * 50)
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit"]:
            break
            
        req = ChatRequest(
            user_id=target_user_id,
            message=user_input,
            include_context=True
        )
        
        print("Thinking... 🧠")
        try:
            result = await chat_service.chat(req)
            print(f"WealthWise: {result.response}")
        except Exception as e:
            print(f"❌ Runtime Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
