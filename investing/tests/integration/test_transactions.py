import pytest
import math
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from investing.models.base import Base, GUID
from investing.models.user import User
from investing.models.transaction import TransactionType, Transaction
from investing.repositories.portfolio_repository import PortfolioRepository

class TestTransactions:
    
    @pytest.fixture
    def session(self):
        # Memory DB for speed, using the GUID type we fixed
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    @pytest.fixture
    def repo(self, session):
        return PortfolioRepository(session)

    @pytest.fixture
    def portfolio(self, repo, session):
        user = User(email=f"trader_{uuid4()}@example.com")
        session.add(user)
        session.commit()
        return repo.create_portfolio(user.id, "growth")

    # --- 1. CORE BUY LOGIC ---

    def test_buy_updates_balance_and_holdings(self, repo, portfolio):
        """Standard Buy: Cash decreases, Shares increase, Avg Cost set."""
        repo.update_balance(portfolio.id, 1000.00)
        
        tx = repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 10, 50.00)
        
        assert tx.total_amount == 500.00
        
        # Check Portfolio
        p = repo.get_by_id(portfolio.id)
        assert p.cash_balance == 500.00
        
        # Check Holding
        h = repo.get_holdings(portfolio.id)[0]
        assert h.ticker == "VOO"
        assert h.shares == 10.0
        assert h.avg_cost_per_share == 50.00

    def test_weighted_average_cost_calculation(self, repo, portfolio):
        """
        Math Validation:
        1. Buy 10 @ $100 (Value $1000)
        2. Buy 10 @ $200 (Value $2000)
        Total Value $3000 / 20 Shares = $150 Avg Cost
        """
        repo.update_balance(portfolio.id, 5000.00)
        
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 10, 100.00)
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 10, 200.00)
        
        h = repo.get_holdings(portfolio.id)[0]
        assert h.shares == 20.0
        assert h.avg_cost_per_share == 150.00

    # --- 2. CORE SELL LOGIC ---

    def test_sell_logic_and_profit(self, repo, portfolio):
        """Standard Sell: Shares decrease, Cash increases, Avg Cost UNCHANGED."""
        repo.update_balance(portfolio.id, 0.00)
        repo.add_or_update_holding(portfolio.id, "VOO", 10, 50.00)
        
        # Sell 5 @ $60 (Profit $50, but cost basis remains $50/share)
        repo.execute_trade(portfolio.id, "VOO", TransactionType.SELL, 5, 60.00)
        
        p = repo.get_by_id(portfolio.id)
        assert p.cash_balance == 300.00 # 5 * 60
        
        h = repo.get_holdings(portfolio.id)[0]
        assert h.shares == 5.0
        assert h.avg_cost_per_share == 50.00 # CRITICAL: Selling does not change avg cost

    def test_full_sell_removes_holding(self, repo, portfolio):
        """Selling 100% of position should delete the row to prevent 0-share ghosts."""
        repo.update_balance(portfolio.id, 1000.00)
        repo.add_or_update_holding(portfolio.id, "VOO", 10, 50.00)
        
        repo.execute_trade(portfolio.id, "VOO", TransactionType.SELL, 10, 50.00)
        
        holdings = repo.get_holdings(portfolio.id)
        assert len(holdings) == 0

    # --- 3. INPUT VALIDATION (The "Dumb User" Tests) ---

    def test_cannot_buy_zero_or_negative_shares(self, repo, portfolio):
        repo.update_balance(portfolio.id, 1000.00)
        
        with pytest.raises(ValueError, match="Shares must be positive"):
            repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 0, 50.00)
            
        with pytest.raises(ValueError, match="Shares must be positive"):
            repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, -5, 50.00)

    def test_cannot_buy_negative_price(self, repo, portfolio):
        repo.update_balance(portfolio.id, 1000.00)
        
        with pytest.raises(ValueError, match="Price cannot be negative"):
            repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 1, -50.00)

    def test_insufficient_funds_buy(self, repo, portfolio):
        """Cannot spend money you don't have."""
        repo.update_balance(portfolio.id, 100.00)
        with pytest.raises(ValueError, match="Insufficient funds"):
            repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 10, 50.00)

    def test_insufficient_shares_sell(self, repo, portfolio):
        """Cannot sell shares you don't own."""
        repo.add_or_update_holding(portfolio.id, "VOO", 5, 50.00)
        with pytest.raises(ValueError, match="Insufficient shares"):
            repo.execute_trade(portfolio.id, "VOO", TransactionType.SELL, 10, 60.00)

    def test_sell_nonexistent_ticker(self, repo, portfolio):
        """Cannot sell a ticker you don't hold at all."""
        with pytest.raises(ValueError, match="Insufficient shares"):
            repo.execute_trade(portfolio.id, "TSLA", TransactionType.SELL, 1, 100.00)

    # --- 4. COMPLEX SCENARIOS & PRECISION (The "Day Trader" Tests) ---

    def test_complex_trade_sequence(self, repo, portfolio):
        """
        The Day Trader Test:
        1. Buy 10 @ $100 ($1000) -> Avg $100
        2. Sell 5 @ $110 (Cash +$550) -> Rem: 5 @ $100
        3. Buy 5 @ $200 ($1000) -> New Avg: ((5*100) + (5*200)) / 10 = $150
        """
        repo.update_balance(portfolio.id, 5000.00)
        
        # 1. Buy 10
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 10, 100.00)
        
        # 2. Sell 5
        repo.execute_trade(portfolio.id, "VOO", TransactionType.SELL, 5, 110.00)
        h = repo.get_holdings(portfolio.id)[0]
        assert h.shares == 5.0
        assert h.avg_cost_per_share == 100.00
        
        # 3. Buy 5 higher
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 5, 200.00)
        h = repo.get_holdings(portfolio.id)[0]
        assert h.shares == 10.0
        assert h.avg_cost_per_share == 150.00
        
        # Verify Cash: 5000 - 1000 + 550 - 1000 = 3550
        p = repo.get_by_id(portfolio.id)
        assert p.cash_balance == 3550.00

    def test_fractional_share_precision(self, repo, portfolio):
        """
        Floating Point Torture Test:
        Buy 0.1, then 0.2. Should result in 0.3, NOT 0.30000000004
        """
        repo.update_balance(portfolio.id, 100.00)
        
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 0.1, 10.00)
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 0.2, 10.00)
        
        h = repo.get_holdings(portfolio.id)[0]
        # Use approx for float comparison, but strict enough for finance
        assert math.isclose(h.shares, 0.3, rel_tol=1e-9)

    def test_exact_sell_boundary(self, repo, portfolio):
        """
        Tests if we can sell EXACTLY the holding amount without floating point errors
        preventing the 'shares == 0' cleanup logic.
        """
        repo.update_balance(portfolio.id, 100.00)
        # 3.333333 shares
        repo.add_or_update_holding(portfolio.id, "VOO", 3.333333, 10.00)
        
        # Sell exact amount
        repo.execute_trade(portfolio.id, "VOO", TransactionType.SELL, 3.333333, 10.00)
        
        # Should be empty
        assert len(repo.get_holdings(portfolio.id)) == 0

    # --- 5. AUDIT TRAIL ---

    def test_transactions_are_logged(self, repo, portfolio, session):
        """Every trade must create a transaction record."""
        repo.update_balance(portfolio.id, 1000.00)
        
        repo.execute_trade(portfolio.id, "VOO", TransactionType.BUY, 1, 100.00)
        repo.execute_trade(portfolio.id, "VOO", TransactionType.SELL, 1, 110.00)
        
        # Check Transaction Table directly
        txs = session.query(Transaction).filter_by(portfolio_id=portfolio.id).all()
        assert len(txs) == 2
        assert txs[0].transaction_type == TransactionType.BUY
        assert txs[1].transaction_type == TransactionType.SELL