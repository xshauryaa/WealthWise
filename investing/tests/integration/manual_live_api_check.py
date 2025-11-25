import os
import sys
from dotenv import load_dotenv
from investing.services.market_data import AlphaVantageClient

# Load Env from the parent directory (Root)
load_dotenv() 

def run_live_check():
    print("🔌 STARTING LIVE API CHECK...")
    
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        print("❌ CRITICAL: Real API Key not found in environment.")
        sys.exit(1)

    print(f"   Key found: {api_key[:3]}... (Masked)")
    
    # Initialize Client
    try:
        client = AlphaVantageClient(api_key=api_key)
    except Exception as e:
        print(f"❌ CRITICAL: Client init failed: {e}")
        sys.exit(1)
    
    print("📡 Sending Request to Alpha Vantage (1 Call)...")
    try:
        # Using 'IBM' as it is the standard stable test ticker
        df = client.fetch_daily_history("IBM")
        
        print("\n✅ API CALL SUCCESSFUL")
        print("=========================================")
        print(f"   Rows Retrieved: {len(df)}")
        if not df.empty:
            print(f"   Date Range: {df['date'].min().date()} to {df['date'].max().date()}")
            print("=========================================")
            print("   First 3 Rows (Oldest):")
            print(df.head(3))
            print("\n   Last 3 Rows (Newest):")
            print(df.tail(3))
        
        # Final Validation Logic
        if len(df) >= 90:
            print("\n🎉 SYSTEM VERIFIED: We have enough data for Momentum Calculation.")
        else:
            print(f"\n⚠️ WARNING: Retrieved {len(df)} rows. We need 90 for full precision.")
            
    except Exception as e:
        print(f"\n❌ API CONNECTION FAILED: {e}")

if __name__ == "__main__":
    run_live_check()
