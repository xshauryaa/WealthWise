from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from investing.models.portfolio import Portfolio
from investing.models.holding import Holding
from investing.models.transaction import Transaction, TransactionType

class PortfolioRepository:
    """
    Data Access Object for Portfolio, Holding, and Transaction entities.
    Handles ACID transactions for trading.
    """

    def __init__(self, session: Session):
        self._session = session

    # --- PORTFOLIO OPERATIONS ---

    def create_portfolio(self, user_id: UUID, risk_profile: str) -> Portfolio:
        """Creates a new portfolio."""
        portfolio = Portfolio(
            user_id=user_id,
            risk_profile=risk_profile,
            cash_balance=0.00,
            name="My WealthWise Portfolio"
        )
        self._session.add(portfolio)
        self._session.flush()
        return portfolio

    def get_by_user_id(self, user_id: UUID) -> Optional[Portfolio]:
        stmt = select(Portfolio).where(Portfolio.user_id == user_id)
        return self._session.execute(stmt).scalars().first()

    def get_by_id(self, portfolio_id: UUID) -> Optional[Portfolio]:
        stmt = select(Portfolio).where(Portfolio.id == portfolio_id)
        return self._session.execute(stmt).scalars().first()

    def update_balance(self, portfolio_id: UUID, new_balance: float) -> Portfolio:
        """Updates balance (used for deposits/withdrawals)."""
        portfolio = self.get_by_id(portfolio_id)
        if not portfolio:
            raise ValueError(f"Portfolio {portfolio_id} not found")
        if new_balance < 0:
            raise ValueError("Balance cannot be negative")
            
        portfolio.cash_balance = new_balance
        self._session.flush()
        return portfolio

    # --- HOLDING OPERATIONS ---

    def get_holdings(self, portfolio_id: UUID) -> List[Holding]:
        stmt = select(Holding).where(Holding.portfolio_id == portfolio_id)
        return list(self._session.execute(stmt).scalars().all())

    def add_or_update_holding(self, portfolio_id: UUID, ticker: str, shares: float, avg_cost: float) -> Holding:
        """Internal helper for upserting holdings."""
        stmt = select(Holding).where(
            Holding.portfolio_id == portfolio_id,
            Holding.ticker == ticker
        )
        holding = self._session.execute(stmt).scalars().first()

        if holding:
            holding.shares = shares
            holding.avg_cost_per_share = avg_cost
        else:
            holding = Holding(
                portfolio_id=portfolio_id,
                ticker=ticker,
                shares=shares,
                avg_cost_per_share=avg_cost
            )
            self._session.add(holding)
        
        self._session.flush()
        return holding

    # --- ATOMIC TRANSACTION OPERATIONS (Chunk 9) ---

    def execute_trade(
        self,
        portfolio_id: UUID,
        ticker: str,
        side: TransactionType,
        shares: float,
        price: float
    ) -> Transaction:
        """
        Executes a trade with ACID guarantees.
        
        1. Locks portfolio row.
        2. Validates funds/shares.
        3. Updates Balance.
        4. Updates/Creates Holding (with Weighted Avg Cost).
        5. Logs Transaction.
        """
        if shares <= 0:
            raise ValueError("Shares must be positive")
        if price < 0:
            raise ValueError("Price cannot be negative")

        # 1. LOCK THE PORTFOLIO (Pessimistic Lock)
        # with_for_update() generates 'SELECT ... FOR UPDATE' in Postgres.
        # This prevents other transactions from modifying this portfolio until we commit.
        stmt = select(Portfolio).where(Portfolio.id == portfolio_id).with_for_update()
        portfolio = self._session.execute(stmt).scalars().first()
        
        if not portfolio:
            raise ValueError(f"Portfolio {portfolio_id} not found")

        total_cost = float(shares) * float(price)
        current_balance = float(portfolio.cash_balance)

        # 2. VALIDATION & BALANCE UPDATE
        if side == TransactionType.BUY:
            if current_balance < total_cost:
                raise ValueError(f"Insufficient funds: Balance ${current_balance}, Cost ${total_cost}")
            portfolio.cash_balance = current_balance - total_cost
        
        elif side == TransactionType.SELL:
            # We check share sufficiency later when fetching holdings, 
            # but we update cash now (Optimistic math, verified by DB logic later)
            portfolio.cash_balance = current_balance + total_cost

        # 3. HOLDING UPDATE
        # Get current holding (if any)
        holding_stmt = select(Holding).where(
            Holding.portfolio_id == portfolio_id,
            Holding.ticker == ticker
        )
        current_holding = self._session.execute(holding_stmt).scalars().first()
        
        current_shares = float(current_holding.shares) if current_holding else 0.0
        current_avg_cost = float(current_holding.avg_cost_per_share) if current_holding else 0.0

        new_shares = 0.0
        new_avg_cost = 0.0

        if side == TransactionType.BUY:
            # Calculate Weighted Average Cost
            total_current_value = current_shares * current_avg_cost
            total_new_value = float(shares) * float(price)
            new_shares = current_shares + float(shares)
            new_avg_cost = (total_current_value + total_new_value) / new_shares
        
        elif side == TransactionType.SELL:
            if current_shares < shares:
                raise ValueError(f"Insufficient shares: Owned {current_shares}, Selling {shares}")
            
            new_shares = current_shares - float(shares)
            # Selling does NOT change average cost per share
            new_avg_cost = current_avg_cost

        # Save Holding State
        if new_shares == 0:
            if current_holding:
                self._session.delete(current_holding)
        else:
            if current_holding:
                current_holding.shares = new_shares
                current_holding.avg_cost_per_share = new_avg_cost
            else:
                new_holding = Holding(
                    portfolio_id=portfolio_id, 
                    ticker=ticker, 
                    shares=new_shares, 
                    avg_cost_per_share=new_avg_cost
                )
                self._session.add(new_holding)

        # 4. LOG TRANSACTION (Audit Trail)
        transaction = Transaction(
            portfolio_id=portfolio_id,
            ticker=ticker,
            transaction_type=side,
            shares=shares,
            price_per_share=price,
            total_amount=total_cost
        )
        self._session.add(transaction)
        
        # 5. FLUSH (Send to DB, but don't commit yet - caller handles commit)
        self._session.flush()
        
        return transaction