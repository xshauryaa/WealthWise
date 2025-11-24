"""Tests for database models."""
import pytest
from decimal import Decimal
from datetime import datetime
import time
from sqlalchemy.exc import IntegrityError
from investing.models.base import Base, get_engine, get_session 
from investing.models.user import User 
from investing.models.portfolio import Portfolio
from investing.models.transaction import Transaction, TransactionType


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    engine = get_engine()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


class TestUserModel:
    """Tests for User model."""
    
    def test_create_user_with_valid_email(self, db_session):
        """Test creating a user with valid email."""
        with get_session() as session:
            user = User(email="test@example.com")
            session.add(user)
            session.commit()
            
            assert user.id is not None
            assert user.email == "test@example.com"
            assert user.created_at is not None
            assert user.updated_at is not None
    
    def test_user_email_must_be_unique(self, db_session):
        """Test that user email must be unique."""
        with get_session() as session:
            user1 = User(email="duplicate@example.com")
            session.add(user1)
            session.commit()
        
        with pytest.raises(IntegrityError):
            with get_session() as session:
                user2 = User(email="duplicate@example.com")
                session.add(user2)
                session.commit()


class TestPortfolioModel:
    """Tests for Portfolio model."""
    
    def test_create_portfolio_for_user(self, db_session):
        """Test creating a portfolio for a user."""
        with get_session() as session:
            user = User(email="investor@example.com")
            session.add(user)
            session.commit()
            user_id = user.id
        
        with get_session() as session:
            portfolio = Portfolio(
                user_id=user_id,
                name="My Portfolio",
                cash_balance=Decimal("1000.00")
            )
            session.add(portfolio)
            session.commit()
            
            assert portfolio.id is not None
            assert portfolio.user_id == user_id
            assert portfolio.name == "My Portfolio"
            assert portfolio.cash_balance == Decimal("1000.00")
    
    def test_portfolio_has_user_relationship(self, db_session):
        """Test that portfolio has correct user relationship."""
        with get_session() as session:
            user = User(email="trader@example.com")
            portfolio = Portfolio(user=user, name="Trading Account")
            session.add(portfolio)
            session.commit()
            portfolio_id = portfolio.id
        
        with get_session() as session:
            portfolio = session.query(Portfolio).filter_by(id=portfolio_id).first()
            assert portfolio.user is not None
            assert portfolio.user.email == "trader@example.com"


class TestTransactionModel:
    """Tests for Transaction model."""
    
    def test_create_transaction_for_portfolio(self, db_session):
        """Test creating a transaction for a portfolio."""
        with get_session() as session:
            user = User(email="buyer@example.com")
            portfolio = Portfolio(user=user, name="Investment Portfolio")
            session.add(portfolio)
            session.commit()
            portfolio_id = portfolio.id
        
        with get_session() as session:
            transaction = Transaction(
                portfolio_id=portfolio_id,
                ticker="VOO",
                transaction_type=TransactionType.BUY,
                shares=Decimal("10.5"),
                price_per_share=Decimal("420.50"),
                total_amount=Decimal("4415.25")
            )
            session.add(transaction)
            session.commit()
            
            assert transaction.id is not None
            assert transaction.ticker == "VOO"
            assert transaction.shares == Decimal("10.5")
    
    def test_transaction_calculates_total(self, db_session):
        """Test that transaction total_amount is correctly set."""
        with get_session() as session:
            user = User(email="calc@example.com")
            portfolio = Portfolio(user=user, name="Math Portfolio")
            session.add(portfolio)
            session.commit()
            portfolio_id = portfolio.id
        
        with get_session() as session:
            shares = Decimal("5.0")
            price = Decimal("100.00")
            expected_total = shares * price
            
            transaction = Transaction(
                portfolio_id=portfolio_id,
                ticker="VTI",
                transaction_type=TransactionType.BUY,
                shares=shares,
                price_per_share=price,
                total_amount=expected_total
            )
            session.add(transaction)
            session.commit()
            
            assert transaction.total_amount == Decimal("500.00")


class TestCascadeDelete:
    """Tests for cascade delete behavior."""
    
    def test_deleting_user_deletes_portfolios(self, db_session):
        """Test that deleting a user cascades to portfolios."""
        with get_session() as session:
            user = User(email="cascade@example.com")
            portfolio1 = Portfolio(user=user, name="Portfolio 1")
            portfolio2 = Portfolio(user=user, name="Portfolio 2")
            session.add_all([user, portfolio1, portfolio2])
            session.commit()
            user_id = user.id
        
        with get_session() as session:
            portfolios_before = session.query(Portfolio).filter_by(user_id=user_id).count()
            assert portfolios_before == 2
        
        with get_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            session.delete(user)
            session.commit()
        
        with get_session() as session:
            portfolios_after = session.query(Portfolio).filter_by(user_id=user_id).count()
            assert portfolios_after == 0
    
    def test_deleting_portfolio_deletes_transactions(self, db_session):
        """Test that deleting a portfolio cascades to transactions."""
        with get_session() as session:
            user = User(email="txn@example.com")
            portfolio = Portfolio(user=user, name="Trade Portfolio")
            session.add(portfolio)
            session.commit()
            portfolio_id = portfolio.id
        
        with get_session() as session:
            portfolio = session.query(Portfolio).filter_by(id=portfolio_id).first()
            txn1 = Transaction(
                portfolio=portfolio,
                ticker="VOO",
                transaction_type=TransactionType.BUY,
                shares=Decimal("1.0"),
                price_per_share=Decimal("400.00"),
                total_amount=Decimal("400.00")
            )
            txn2 = Transaction(
                portfolio=portfolio,
                ticker="BND",
                transaction_type=TransactionType.BUY,
                shares=Decimal("2.0"),
                price_per_share=Decimal("80.00"),
                total_amount=Decimal("160.00")
            )
            session.add_all([txn1, txn2])
            session.commit()
        
        with get_session() as session:
            txns_before = session.query(Transaction).filter_by(portfolio_id=portfolio_id).count()
            assert txns_before == 2
        
        with get_session() as session:
            portfolio = session.query(Portfolio).filter_by(id=portfolio_id).first()
            session.delete(portfolio)
            session.commit()
        
        with get_session() as session:
            txns_after = session.query(Transaction).filter_by(portfolio_id=portfolio_id).count()
            assert txns_after == 0


class TestRelationships:
    """Tests for model relationships."""
    
    def test_query_user_with_portfolios(self, db_session):
        """Test querying user with eager-loaded portfolios."""
        with get_session() as session:
            user = User(email="multi@example.com")
            portfolio1 = Portfolio(user=user, name="Stocks")
            portfolio2 = Portfolio(user=user, name="Bonds")
            portfolio3 = Portfolio(user=user, name="Cash")
            session.add_all([user, portfolio1, portfolio2, portfolio3])
            session.commit()
            user_id = user.id
        
        with get_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            assert len(user.portfolios) == 3
            portfolio_names = [p.name for p in user.portfolios]
            assert "Stocks" in portfolio_names
            assert "Bonds" in portfolio_names
            assert "Cash" in portfolio_names


class TestTimestamps:
    """Tests for automatic timestamp management."""
    
    def test_timestamps_auto_update(self, db_session):
        """Test that updated_at timestamp changes on modification."""
        with get_session() as session:
            user = User(email="timestamp@example.com")
            session.add(user)
            session.commit()
            user_id = user.id
            original_updated_at = user.updated_at
        
        time.sleep(0.1)
        
        with get_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            user.email = "newemail@example.com"
            session.commit()
            new_updated_at = user.updated_at
        
        assert new_updated_at > original_updated_at


class TestConstraintViolations:
    """Tests for database constraint violations."""
    
    def test_user_email_cannot_be_null(self, db_session):
        """Test that user email cannot be NULL."""
        with pytest.raises(IntegrityError):
            with get_session() as session:
                user = User(email=None)
                session.add(user)
                session.commit()
    
    def test_portfolio_foreign_key_must_exist(self, db_session):
        """Test that portfolio user_id must reference existing user."""
        import uuid
        fake_user_id = uuid.uuid4()
        
        with pytest.raises(IntegrityError):
            with get_session() as session:
                portfolio = Portfolio(
                    user_id=fake_user_id,
                    name="Invalid Portfolio"
                )
                session.add(portfolio)
                session.commit()
    
    def test_transaction_foreign_key_must_exist(self, db_session):
        """Test that transaction portfolio_id must reference existing portfolio."""
        import uuid
        fake_portfolio_id = uuid.uuid4()
        
        with pytest.raises(IntegrityError):
            with get_session() as session:
                transaction = Transaction(
                    portfolio_id=fake_portfolio_id,
                    ticker="VOO",
                    transaction_type=TransactionType.BUY,
                    shares=Decimal("1.0"),
                    price_per_share=Decimal("400.00"),
                    total_amount=Decimal("400.00")
                )
                session.add(transaction)
                session.commit()


class TestDecimalPrecision:
    """Tests for decimal precision handling."""
    
    def test_fractional_shares_supported(self, db_session):
        """Test that fractional shares (6 decimal places) are supported."""
        with get_session() as session:
            user = User(email="fractional@example.com")
            portfolio = Portfolio(user=user, name="Fractional Portfolio")
            session.add(portfolio)
            session.commit()
            portfolio_id = portfolio.id
        
        with get_session() as session:
            transaction = Transaction(
                portfolio_id=portfolio_id,
                ticker="VOO",
                transaction_type=TransactionType.BUY,
                shares=Decimal("0.000001"),  # Smallest possible amount
                price_per_share=Decimal("400.00"),
                total_amount=Decimal("0.0004")
            )
            session.add(transaction)
            session.commit()
            
            assert transaction.shares == Decimal("0.000001")
    
    def test_large_cash_balance_supported(self, db_session):
        """Test that large cash balances are supported."""
        with get_session() as session:
            user = User(email="whale@example.com")
            portfolio = Portfolio(
                user=user,
                name="Whale Portfolio",
                cash_balance=Decimal("99999999.99")  # Max value for NUMERIC(10,2)
            )
            session.add(portfolio)
            session.commit()
            
            assert portfolio.cash_balance == Decimal("99999999.99")
