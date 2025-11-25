import pytest
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from investing.models.base import Base
from investing.models.user import User
from investing.models.portfolio import Portfolio
from investing.models.holding import Holding
from investing.repositories.portfolio_repository import PortfolioRepository

class TestPortfolioRepository:
    
    @pytest.fixture
    def session(self):
        # Using SQLite memory DB - GUID type handles compatibility now!
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
    def user(self, session):
        user = User(email=f"test_{uuid4()}@example.com")
        session.add(user)
        session.commit()
        return user

    # --- PORTFOLIO TESTS ---

    def test_create_and_retrieve_portfolio(self, repo, user):
        """Req 1: Create -> Retrieve by user_id"""
        p = repo.create_portfolio(user.id, "balanced")
        fetched = repo.get_by_user_id(user.id)
        assert fetched is not None
        assert fetched.id == p.id
        assert fetched.cash_balance == 0.0

    def test_get_nonexistent_returns_none(self, repo):
        """Req 2: Missing portfolio is None"""
        assert repo.get_by_user_id(uuid4()) is None

    def test_duplicate_portfolio_prevention(self, repo, user):
        """Req 3: One portfolio per user (IntegrityError)"""
        repo.create_portfolio(user.id, "balanced")
        
        with pytest.raises(IntegrityError):
            repo.create_portfolio(user.id, "growth")
            repo._session.commit()

    def test_update_balance_safeguards(self, repo, user):
        p = repo.create_portfolio(user.id, "growth")
        
        p = repo.update_balance(p.id, 100.00)
        assert p.cash_balance == 100.00
        
        with pytest.raises(ValueError, match="negative"):
            repo.update_balance(p.id, -50.00)

    # --- HOLDING TESTS ---

    def test_add_holding_appears_in_list(self, repo, user):
        """Req 4: Add holding -> get_holdings"""
        p = repo.create_portfolio(user.id, "growth")
        
        repo.add_or_update_holding(p.id, "VOO", 10.5, 400.00)
        
        holdings = repo.get_holdings(p.id)
        assert len(holdings) == 1
        assert holdings[0].ticker == "VOO"
        # Check float conversion
        assert abs(float(holdings[0].shares) - 10.5) < 0.0001

    def test_update_existing_holding(self, repo, user):
        """Req 5: Update logic (Upsert) works"""
        p = repo.create_portfolio(user.id, "growth")
        
        repo.add_or_update_holding(p.id, "VOO", 10, 100.00)
        repo.add_or_update_holding(p.id, "VOO", 20, 105.00)
        
        holdings = repo.get_holdings(p.id)
        assert len(holdings) == 1
        assert holdings[0].shares == 20
        assert holdings[0].avg_cost_per_share == 105.00

    def test_multiple_tickers(self, repo, user):
        """Ensure distinct tickers don't overwrite each other"""
        p = repo.create_portfolio(user.id, "growth")
        
        repo.add_or_update_holding(p.id, "VOO", 5, 100)
        repo.add_or_update_holding(p.id, "BND", 10, 50)
        
        holdings = repo.get_holdings(p.id)
        assert len(holdings) == 2
        tickers = {h.ticker for h in holdings}
        assert tickers == {"VOO", "BND"}

    def test_orphan_prevention_logic(self, repo, user, session):
        """Cascading delete check at ORM level"""
        p = repo.create_portfolio(user.id, "balanced")
        repo.add_or_update_holding(p.id, "VOO", 10, 100)
        
        session.delete(p)
        session.flush()
        
        assert repo.get_holdings(p.id) == []