import json
import math
from pathlib import Path
from typing import List, Tuple, Literal, Dict, Optional
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import select
from investing.models.etf_universe import EtfUniverse

@dataclass
class ETFAllocation:
    ticker: str
    weight: float  # 0.0 to 1.0

class AllocationEngine:
    """
    Determines ETF recommendations based on user balance, risk profile,
    AND dynamic market data (Sector Momentum).
    """

    # (lower_inclusive, upper_exclusive, etf_count)
    BALANCE_TIERS: List[Tuple[float, float, int]] = [
        (0, 100, 1),
        (100, 500, 2),
        (500, 2000, 3),
        (2000, float('inf'), 4)
    ]

    def __init__(self, data_path: Path = None):
        if data_path is None:
            base_path = Path(__file__).parent.parent
            data_path = base_path / "data" / "etfs.json"
        self._etf_map = self._load_etf_data(data_path)

    def _load_etf_data(self, path: Path) -> dict:
        if not path.exists():
            raise FileNotFoundError(f"ETF configuration not found at {path}")
        with open(path, 'r') as f:
            return json.load(f)

    def get_etf_count(self, balance: float) -> int:
        if balance < 0: raise ValueError("Balance cannot be negative")
        if math.isnan(balance): raise ValueError("Balance cannot be NaN")

        for lower, upper, count in self.BALANCE_TIERS:
            if lower <= balance < upper:
                return count
        return self.BALANCE_TIERS[-1][2]

    def _get_base_allocations(self, count: int) -> Dict[str, float]:
        """Defines the 'Balanced' portfolio weights for each tier."""
        if count == 1:
            return {"VOO": 1.0}
        elif count == 2:
            return {"VOO": 0.70, "BND": 0.30}
        elif count == 3:
            return {"VOO": 0.40, "VTI": 0.30, "BND": 0.30}
        elif count == 4:
            # 70% Stocks / 30% Bonds
            return {"VOO": 0.25, "VTI": 0.25, "VXUS": 0.20, "AGG": 0.30}
        else:
            raise ValueError(f"No allocation map for {count} ETFs")

    def _get_momentum_winner(self, db: Session) -> Optional[str]:
        """
        Queries the database for the sector ETF with the highest momentum score.
        Returns None if no data exists or scores are negative (market crash).
        """
        if db is None:
            return None
            
        # Fetch top momentum score
        stmt = select(EtfUniverse).order_by(EtfUniverse.momentum_score.desc()).limit(1)
        winner = db.execute(stmt).scalars().first()
        
        if winner and winner.momentum_score > 0:
            return winner.ticker
        return None

    def recommend_portfolio(
        self, 
        balance: float, 
        risk_profile: Literal["conservative", "balanced", "growth"] = "balanced",
        db: Session = None
    ) -> List[ETFAllocation]:
        """
        Returns target portfolio with weights adjusted for risk AND market momentum.
        """
        # 1. Determine Tier
        count = self.get_etf_count(balance)
        tier_key = f"tier{count}"
        
        # 2. Tier 1 Override (Capital Constraint)
        if count == 1:
            return [ETFAllocation(ticker="VOO", weight=1.0)]

        # 3. Get Base Weights
        weights = self._get_base_allocations(count)

        # 4. DYNAMIC INJECTION (Phase 2 Logic)
        momentum_ticker = self._get_momentum_winner(db)
        
        if momentum_ticker:
            # The Strategy: We want to free up 30% (0.30) for the winner.
            target_tilt = 0.30
            needed = target_tilt
            
            # Source 1: VOO
            if "VOO" in weights:
                available = weights["VOO"]
                take = min(available, needed)
                weights["VOO"] = round(available - take, 2)
                needed -= take
            
            # Source 2: VTI (If VOO ran out, like in Tier 4)
            if needed > 0 and "VTI" in weights:
                available = weights["VTI"]
                take = min(available, needed)
                weights["VTI"] = round(available - take, 2)
                needed -= take
            
            # If we successfully freed up space, add the winner
            # (We check needed < 0.01 to account for float rounding errors)
            if needed < 0.01:
                weights[momentum_ticker] = weights.get(momentum_ticker, 0) + target_tilt
        
        # 5. Risk Profile Adjustments
        bond_ticker = "AGG" if "AGG" in weights else "BND"
        adjustment = 0.0
        
        if risk_profile == "conservative":
            adjustment = 0.20
        elif risk_profile == "growth":
            adjustment = -0.15 

        if adjustment != 0.0:
            # Apply risk adjustment to Stocks vs Bonds
            # Note: We prioritize keeping the Momentum Tilt intact.
            # We shift weight between the Core Stock (VOO) and Bond.
            
            # If VOO was depleted by the tilt (Tier 4), use VTI for adjustment
            stock_ticker = "VOO" if weights.get("VOO", 0) > 0.1 else "VTI"
            
            if stock_ticker in weights and bond_ticker in weights:
                current_bond = weights[bond_ticker]
                current_stock = weights[stock_ticker]
                
                new_bond = round(current_bond + adjustment, 2)
                new_stock = round(current_stock - adjustment, 2)
                
                # Safety Cap
                if 0.05 <= new_bond <= 0.95 and 0.05 <= new_stock <= 0.95:
                    weights[bond_ticker] = new_bond
                    weights[stock_ticker] = new_stock

        # 6. Clean up zero weights and return
        return [
            ETFAllocation(ticker=k, weight=v) 
            for k, v in weights.items() 
            if v > 0.01 # Filter out near-zero weights
        ]
