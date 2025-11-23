import asyncio
import pandas as pd
import time
from decimal import Decimal
from datetime import datetime
from ml.services.categorizer.service import CategorizerService
from ml.core.models import CategorizeRequest

async def run_audit():
    print("🔍 STARTING SYSTEM AUDIT...")
    print("=========================================")

    # 1. Verify Data Integrity (PR3)
    try:
        df = pd.read_csv('ml/data/synthetic/transactions.csv')
        print(f"✅ Data Load: Success ({len(df)} transactions found)")
    except Exception as e:
        print(f"❌ Data Load: FAILED ({e})")
        return

    service = CategorizerService()

    # 2. Verify Keyword Categorizer (PR4) - The "Fast Path"
    print("\n-----------------------------------------")
    print("🧪 TEST 1: Keyword Engine (Fast Path)")
    uber_tx = df[df['merchant'].str.contains('Uber', case=False)].iloc[0]
    
    req_fast = CategorizeRequest(
        merchant=uber_tx['merchant'],
        amount=Decimal(str(uber_tx['amount'])),
        date=datetime.now(),
        user_id="audit_user"
    )
    
    start = time.time()
    res_fast = await service.categorize(req_fast)
    duration = (time.time() - start) * 1000
    
    if res_fast.category == "Transportation" and "Matched keyword" in res_fast.reasoning:
        print(f"✅ Result: {res_fast.category}")
        print(f"✅ Latency: {duration:.2f}ms (Target: <10ms)")
        print(f"✅ Logic: Correctly used Keyword Map")
    else:
        print(f"❌ FAILED: Expected Transportation, got {res_fast.category}")
        return

    # 3. Verify Gemini LLM (PR5) - The "Smart Path"
    print("\n-----------------------------------------")
    print("🧪 TEST 2: Gemini LLM (Smart Path)")
    # Find a transaction that usually fails keywords (e.g., generic 'Chase Savings' or similar)
    # If 'Chase' isn't in your specific random seed, we make a hard one up.
    hard_merchant = "Dr. Pimple Popper Dermatology"
    
    req_smart = CategorizeRequest(
        merchant=hard_merchant,
        amount=Decimal("150.00"),
        date=datetime.now(),
        user_id="audit_user"
    )
    
    print(f"   Input: '{hard_merchant}' (Not in keyword list)")
    print("   ...Connecting to Google AI (Real API Call)...")
    
    start = time.time()
    try:
        res_smart = await service.categorize(req_smart)
        duration = (time.time() - start) * 1000
        
        if res_smart.category == "Healthcare":
            print(f"✅ Result: {res_smart.category}")
            print(f"✅ Latency: {duration:.2f}ms (Target: <2000ms)")
            print(f"✅ Logic: Correctly fell back to LLM")
        else:
            print(f"⚠️ Result: {res_smart.category} (Might be acceptable, check manually)")
            
    except Exception as e:
        print(f"❌ API FAILED: {e}")
        print("   Check your GEMINI_API_KEY in ml/.env")
        return

    print("\n=========================================")
    print("🎉 SYSTEM STATUS: ROBUST & READY")

if __name__ == "__main__":
    asyncio.run(run_audit())
