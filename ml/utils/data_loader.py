import csv
import random
from pathlib import Path
from typing import Optional

# Define path relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "synthetic" / "transactions.csv"

def get_valid_test_user_id() -> Optional[str]:
    """
    Robustly fetches a valid user_id from the CSV.
    - Checks if file exists
    - Handles empty files
    - Returns the user with the MOST transactions (best for testing)
    """
    if not DATA_PATH.exists():
        print(f"❌ CRITICAL: Data file missing at {DATA_PATH}")
        return None

    try:
        user_counts = {}
        with open(DATA_PATH, 'r') as f:
            reader = csv.DictReader(f)
            # Check if headers exist
            if not reader.fieldnames or 'user_id' not in reader.fieldnames:
                print("❌ CRITICAL: CSV missing 'user_id' column")
                return None
                
            for row in reader:
                uid = row.get('user_id')
                if uid:
                    user_counts[uid] = user_counts.get(uid, 0) + 1
        
        if not user_counts:
            print("⚠️ Warning: CSV is empty or has no valid users.")
            return None

        # Return user with max transactions to ensure rich context for RAG
        best_user = max(user_counts, key=user_counts.get)
        print(f"✅ Selected User: {best_user} ({user_counts[best_user]} transactions)")
        return best_user

    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return None
