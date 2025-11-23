import asyncio
import csv
from pathlib import Path
from decimal import Decimal
from datetime import datetime
from ml.services.categorizer.keyword import KeywordCategorizer
from ml.core.models import CategorizeRequest

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data" / "synthetic" / "transactions.csv"

async def main():
    print(f"📂 Auditing data from: {CSV_PATH}")
    categorizer = KeywordCategorizer()
    
    misses = 0
    
    print(f"\n{'MERCHANT':<30} | {'TRUE CATEGORY':<20} | {'REASON'}")
    print("-" * 80)

    with open(CSV_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            req = CategorizeRequest(
                merchant=row['merchant'],
                amount=Decimal(row['amount']),
                date=datetime.fromisoformat(row['date']),
                user_id=row['user_id']
            )
            
            # Run Logic
            result = await categorizer.categorize(req)
            
            # If it failed to categorize, PRINT IT
            if result.category == "Uncategorized":
                misses += 1
                print(f"{row['merchant']:<30} | {row['category']:<20} | ❌ Keyword Miss")

    print("-" * 80)
    print(f"Total Misses: {misses}")
    
    if misses > 0:
        print("💡 Insight: These are exactly the transactions we need Gemini (PR 5) for.")

if __name__ == "__main__":
    asyncio.run(main())
