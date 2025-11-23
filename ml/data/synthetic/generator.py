import csv
import json
import random
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from faker import Faker
from ml.config.settings import get_settings

fake = Faker()
settings = get_settings()

# Constants
BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUT_FILE = BASE_DIR / "data" / "synthetic" / "transactions.csv"
PERSONAS_FILE = BASE_DIR / "data" / "synthetic" / "personas.json"

# Merchant Pools (for realism)
MERCHANTS = {
    "Food": ["Starbucks", "Chipotle", "McDonalds", "Whole Foods", "Trader Joe's", "DoorDash", "Subway"],
    "Transportation": ["Uber", "Lyft", "Shell Gas", "Chevron", "MTA Kiosk", "Lime Scooter"],
    "Entertainment": ["Netflix", "Spotify", "AMC Theaters", "Steam Games", "PlayStation Network", "Local Bar"],
    "Shopping": ["Amazon", "Target", "Walmart", "Best Buy", "Nike", "Apple Store"],
    "Housing": ["Rent Payment", "Camden Apartments", "Maintenance Fee"],
    "Utilities": ["Verizon", "Comcast", "City Water", "PG&E"],
    "Education": ["University Bookstore", "Chegg", "Udemy"],
    "Healthcare": ["CVS Pharmacy", "Walgreens", "Kaiser Permanente"],
    "Savings": ["Vanguard Transfer", "Robinhood Deposit", "Chase Savings"],
    "Income": ["Gusto Payroll", "Direct Deposit", "Venmo Cashout"],
    "Uncategorized": ["Venmo Payment", "Check #1234", "Unknown Store"]
}

def load_personas():
    with open(PERSONAS_FILE, 'r') as f:
        return json.load(f)

def generate_amount(category, is_anomaly=False):
    """Generate a realistic amount based on category."""
    base = Decimal("0.00")
    if category == "Food":
        base = Decimal(str(random.uniform(5.00, 40.00)))
    elif category == "Housing":
        base = Decimal(str(random.uniform(800.00, 1500.00)))
    elif category == "Transportation":
        base = Decimal(str(random.uniform(10.00, 60.00)))
    elif category == "Entertainment":
        base = Decimal(str(random.uniform(10.00, 100.00)))
    elif category == "Shopping":
        base = Decimal(str(random.uniform(20.00, 200.00)))
    else:
        base = Decimal(str(random.uniform(10.00, 50.00)))

    # If anomaly, spike the amount by 3x-10x
    if is_anomaly:
        multiplier = Decimal(str(random.uniform(3.0, 10.0)))
        base = base * multiplier
    
    return round(base, 2)

def generate_transactions(days=90):
    personas = load_personas()
    transactions = []
    
    print(f"🚀 Generating {days} days of data for {len(personas)} personas...")

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    for persona_name, profile in personas.items():
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        print(f"  - Processing: {persona_name} (ID: {user_id})")

        current_date = start_date
        while current_date <= end_date:
            daily_tx_count = random.randint(1, 5)
            
            for _ in range(daily_tx_count):
                categories = list(profile["spending_weights"].keys())
                weights = list(profile["spending_weights"].values())
                category = random.choices(categories, weights=weights, k=1)[0]
                is_anomaly = random.random() < profile["anomaly_chance"]
                merchant_pool = MERCHANTS.get(category, MERCHANTS["Uncategorized"])
                merchant_name = random.choice(merchant_pool)
                amount = generate_amount(category, is_anomaly)
                
                tx = {
                    "transaction_id": uuid.uuid4().hex,
                    "user_id": user_id,
                    "date": current_date.isoformat(),
                    "merchant": merchant_name,
                    "amount": amount,
                    "category": category,
                    "persona": persona_name,
                    "is_anomaly": is_anomaly
                }
                transactions.append(tx)
            
            current_date += timedelta(days=1)

    with open(OUTPUT_FILE, 'w', newline='') as csvfile:
        fieldnames = ["transaction_id", "user_id", "date", "merchant", "amount", "category", "persona", "is_anomaly"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for tx in transactions:
            writer.writerow(tx)
            
    print(f"✅ Successfully generated {len(transactions)} transactions.")
    print(f"📂 Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_transactions()
