import json
import math
from pathlib import Path
from typing import List, Tuple, Literal, Dict
from dataclasses import dataclass

@dataclass
class ETFAllocation:
    ticker: str
    weight: float  # 0.0 to 1.0

class AllocationEngine:
    """
    Determines ETF recommendations based on user balance and risk profile.
    
    Tiers:
    - Tier 1 ($0-$100): 1 ETF (VOO) - Risk profiles ignored
    - Tier 2 ($100-$500): 2 ETFs (VOO, BND)
    - Tier 3 ($500-$2000): 3 ETFs (VOO, VTI, BND)
    - Tier 4 ($2000+): 4 ETFs (VOO, VTI, AGG, VXUS)
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
            # 70% Stocks (VOO+VTI+VXUS), 30% Bonds (AGG)
            return {"VOO": 0.25, "VTI": 0.25, "VXUS": 0.20, "AGG": 0.30}
        else:
            raise ValueError(f"No allocation map for {count} ETFs")

    def recommend_portfolio(
        self, 
        balance: float, 
        risk_profile: Literal["conservative", "balanced", "growth"] = "balanced"
    ) -> List[ETFAllocation]:
        """
        Returns target portfolio with weights adjusted for risk.
        
        Adjustments (Additive):
        - Conservative: -20% Stocks, +20% Bonds
        - Growth: +15% Stocks, -15% Bonds
        """
        # 1. Determine Tier
        count = self.get_etf_count(balance)
        
        # 1.5 Validation: Ensure this tier exists in our config Source of Truth
        # (This catches the 'corrupt config' scenario where Python logic drifts from JSON config)
        tier_key = f"tier{count}"
        if tier_key not in self._etf_map:
            raise KeyError(f"Configuration for {tier_key} missing in etfs.json")
        
        # 2. Tier 1 Override (Capital Constraint)
        # If balance < $100, you get VOO regardless of risk profile
        if count == 1:
            return [ETFAllocation(ticker="VOO", weight=1.0)]

        # 3. Get Base (Balanced) Weights
        weights = self._get_base_allocations(count)

        # 4. Apply Risk Adjustments
        # Strategy: Shift weight between primary Stock (VOO) and primary Bond (BND or AGG)
        bond_ticker = "AGG" if "AGG" in weights else "BND"
        
        adjustment = 0.0
        if risk_profile == "conservative":
            adjustment = 0.20  # Shift 20% to bonds
        elif risk_profile == "growth":
            adjustment = -0.15 # Shift 15% away from bonds (to stocks)
        elif risk_profile != "balanced":
            raise ValueError(f"Invalid risk profile: {risk_profile}")

        if adjustment != 0.0:
            # FIX: Round BEFORE checking constraints to avoid floating point errors
            new_bond_weight = round(weights[bond_ticker] + adjustment, 2)
            new_stock_weight = round(weights["VOO"] - adjustment, 2)

            # Cap/Floor logic to prevent negative weights
            if 0.05 <= new_bond_weight <= 0.95 and 0.05 <= new_stock_weight <= 0.95:
                weights[bond_ticker] = new_bond_weight
                weights["VOO"] = new_stock_weight
            else:
                # Fallback: if adjustment breaks constraints, keep balanced (or log warning)
                pass 

        # 5. Convert to List
        return [
            ETFAllocation(ticker=k, weight=v) 
            for k, v in weights.items()
        ]
