import pytest
from decimal import Decimal
import time
from sqlalchemy.exc import IntegrityError
from investing.models.base import Base, get_engine, get_session 
from investing.models.user import User 
from investing.models.portfolio import Portfolio
from investing.models.transaction import Transaction, TransactionType

@pytest.fixture(scope="function")
def db_session():
    engine = get_engine()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

class TestPortfolioModel:
    def test_create_portfolio_for_user(self, db_session):
        with get_session() as session:
            user = User(email="investor@example.com")
            session.add(user)
            session.commit()
            user_id = user.id
        
        with get_session() as session:
            portfolio = Portfolio(
                user_id=user_id,
                name="My Portfolio",
                risk_profile="balanced",  # FIX: Added this
                cash_balance=Decimal("1000.00")
            )
            session.add(portfolio)
            session.commit()
            assert portfolio.id is not None

class TestTransactionModel:
    def test_create_transaction_for_portfolio(self, db_session):
        with get_session() as session:
            user = User(email="buyer@example.com")
            portfolio = Portfolio(user=user, name="Inv", risk_profile="growth") # FIX
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
