import sqlite3
import pytest

class TestSchemaConstraints:
    """
    Exhaustive validation of Database Business Rules.
    
    Verifies:
    1. Input Sanity (No negative money, no zero shares)
    2. Relational Integrity (Cascades, Foreign Keys)
    3. Uniqueness (No duplicate holdings)
    4. Type Safety (Enum constraints)
    """
    
    @pytest.fixture
    def db(self):
        # Use in-memory SQLite to verify LOGIC without needing live Postgres
        conn = sqlite3.connect(':memory:')
        cursor = conn.cursor()
        
        # CRITICAL: Enable Foreign Key enforcement (SQLite defaults to OFF)
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # --- MOCK SCHEMA (Mirrors schema.sql logic exactly) ---
        
        cursor.execute("""
            CREATE TABLE users (
                id TEXT PRIMARY KEY
            );
        """)
        
        cursor.execute("""
            CREATE TABLE portfolios (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                risk_profile TEXT NOT NULL CHECK (risk_profile IN ('conservative', 'balanced', 'growth')),
                cash_balance REAL NOT NULL CHECK (cash_balance >= 0)
            );
        """)
        
        cursor.execute("""
            CREATE TABLE holdings (
                id TEXT PRIMARY KEY,
                portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
                ticker TEXT NOT NULL,
                shares REAL NOT NULL CHECK (shares > 0),
                UNIQUE(portfolio_id, ticker)  -- CRITICAL: Prevent duplicate rows
            );
        """)
        
        cursor.execute("""
            CREATE TABLE transactions (
                id TEXT PRIMARY KEY,
                portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
                type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL', 'DEPOSIT', 'WITHDRAW')),
                total_amount REAL NOT NULL
            );
        """)
        
        conn.commit()
        yield conn
        conn.close()

    # --- 1. DATA VALUE CONSTRAINTS ---

    def test_negative_balance_constraint(self, db):
        """Rule: Portfolios cannot be in debt."""
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        with pytest.raises(sqlite3.IntegrityError):
            db.execute(
                "INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES (?, ?, ?, ?)",
                ("p1", "u1", "balanced", -10.00)
            )

    def test_zero_shares_constraint(self, db):
        """Rule: Cannot hold 0 shares (record should be deleted instead)."""
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'growth', 100)")
        
        with pytest.raises(sqlite3.IntegrityError):
            db.execute(
                "INSERT INTO holdings (id, portfolio_id, ticker, shares) VALUES (?, ?, ?, ?)",
                ("h1", "p1", "VOO", 0)
            )

    def test_invalid_risk_profile(self, db):
        """Rule: Risk profile must be from approved list."""
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        with pytest.raises(sqlite3.IntegrityError):
            db.execute(
                "INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'yolo', 0)"
            )

    def test_invalid_transaction_type(self, db):
        """Rule: Transaction type must be strictly typed."""
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'growth', 100)")
        
        with pytest.raises(sqlite3.IntegrityError):
            db.execute(
                "INSERT INTO transactions (id, portfolio_id, type, total_amount) VALUES ('t1', 'p1', 'STOLEN', 100)"
            )

    # --- 2. RELATIONAL INTEGRITY (The Missing Tests) ---

    def test_cascade_delete_user_clears_portfolio(self, db):
        """Rule: Deleting a User must nuke their Portfolios (GDPR/Cleanup)."""
        # Setup
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'growth', 100)")
        
        # Verify exists
        assert db.execute("SELECT count(*) FROM portfolios").fetchone()[0] == 1
        
        # Delete User
        db.execute("DELETE FROM users WHERE id = 'u1'")
        
        # Verify Cascade
        assert db.execute("SELECT count(*) FROM portfolios").fetchone()[0] == 0

    def test_cascade_delete_portfolio_clears_holdings(self, db):
        """Rule: Deleting a Portfolio must nuke its Holdings."""
        # Setup
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'growth', 100)")
        db.execute("INSERT INTO holdings (id, portfolio_id, ticker, shares) VALUES ('h1', 'p1', 'VOO', 10)")
        
        # Delete Portfolio
        db.execute("DELETE FROM portfolios WHERE id = 'p1'")
        
        # Verify Cascade
        assert db.execute("SELECT count(*) FROM holdings").fetchone()[0] == 0

    # --- 3. UNIQUENESS CONSTRAINTS ---

    def test_duplicate_holdings_prevention(self, db):
        """
        Rule: A portfolio cannot have two separate rows for 'VOO'.
        It must be one row with updated shares.
        """
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'growth', 100)")
        
        # First Insert OK
        db.execute("INSERT INTO holdings (id, portfolio_id, ticker, shares) VALUES ('h1', 'p1', 'VOO', 10)")
        
        # Second Insert with same Portfolio+Ticker -> FAIL
        with pytest.raises(sqlite3.IntegrityError):
            db.execute("INSERT INTO holdings (id, portfolio_id, ticker, shares) VALUES ('h2', 'p1', 'VOO', 5)")

    def test_distinct_portfolios_can_hold_same_ticker(self, db):
        """Rule: Two DIFFERENT portfolios can both hold VOO."""
        db.execute("INSERT INTO users (id) VALUES ('u1')")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p1', 'u1', 'growth', 100)")
        db.execute("INSERT INTO portfolios (id, user_id, risk_profile, cash_balance) VALUES ('p2', 'u1', 'growth', 100)")
        
        db.execute("INSERT INTO holdings (id, portfolio_id, ticker, shares) VALUES ('h1', 'p1', 'VOO', 10)")
        # Should succeed
        db.execute("INSERT INTO holdings (id, portfolio_id, ticker, shares) VALUES ('h2', 'p2', 'VOO', 5)")
