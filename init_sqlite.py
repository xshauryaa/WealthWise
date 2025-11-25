# init_sqlite.py
import sys
import os

# Ensure python can find the 'investing' package
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from investing.models.base import Base

# IMPORTS ARE CRITICAL: This registers the models with SQLAlchemy
# (Adjust these import paths if your file names differ slightly)
from investing.models.portfolio import Portfolio
from investing.models.holding import Holding
from investing.models.transaction import Transaction
# from investing.models.user import User  <-- Uncomment if you created a User model

def init_db():
    # 1. Define the SQLite database file
    db_url = "sqlite:///./wealthwise.db"
    print(f"⚙️  Configuring database at: {db_url}")
    
    # 2. Create a temporary engine
    engine = create_engine(db_url)

    # 3. Create Tables
    print("🔨 Creating tables based on Python models...")
    try:
        Base.metadata.create_all(engine)
        print("✅ Success! 'wealthwise.db' created with all tables.")
    except Exception as e:
        print(f"❌ Error creating database: {e}")

if __name__ == "__main__":
    init_db()