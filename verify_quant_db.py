import sqlite3
import pandas as pd

print("🕵️ AUDITING DATABASE CONTENT...")
conn = sqlite3.connect("wealthwise.db")

try:
    # Read the table directly
    df = pd.read_sql_query("SELECT * FROM etf_universe ORDER BY momentum_score DESC", conn)
    
    if df.empty:
        print("❌ FAILURE: Table is empty.")
    else:
        print("✅ SUCCESS: Found stored metrics.")
        print(df[['ticker', 'sector', 'momentum_score', 'volatility', 'last_price']])
        
        winner = df.iloc[0]
        print(f"\n🏆 CURRENT WINNER: {winner['ticker']} ({winner['sector']})")
        print(f"   Score: {winner['momentum_score']:.4f}")

except Exception as e:
    print(f"❌ ERROR: {e}")
finally:
    conn.close()
