import pytest
import math
import json
from pathlib import Path
from unittest.mock import patch
from investing.services.allocation_engine import AllocationEngine

class TestAllocationEngine:
    
    @pytest.fixture
    def engine(self):
        return AllocationEngine()

    # ==========================================
    # 1. BALANCE TIER TESTS (The Logic of "How Many")
    # ==========================================

    def test_zero_balance_returns_one_etf(self, engine):
        """Tier 1: $0 start."""
        assert engine.get_etf_count(0.0) == 1

    def test_precision_boundary_lower(self, engine):
        """CRITICAL: $99.99 is NOT $100.00."""
        assert engine.get_etf_count(99.99) == 1

    def test_boundary_at_100_dollars(self, engine):
        """Tier 2 Boundary: Exact $100."""
        assert engine.get_etf_count(100.0) == 2

    def test_precision_boundary_upper(self, engine):
        """CRITICAL: $1999.99 is NOT $2000.00."""
        assert engine.get_etf_count(1999.99) == 3

    def test_boundary_at_2000_dollars(self, engine):
        """Tier 4 Boundary: $2000+."""
        assert engine.get_etf_count(2000.0) == 4

    def test_extremely_large_balance(self, engine):
        """Whale test: $100 Million balance."""
        assert engine.get_etf_count(100_000_000.00) == 4

    # ==========================================
    # 2. RISK PROFILE TESTS (The Logic of "Which Weight")
    # ==========================================

    # --- TIER 1 (Constraint Override) ---
    def test_tier_1_ignores_risk_profile(self, engine):
        """User has $50 but wants 'Conservative'. Should still get 100% VOO."""
        allocations = engine.recommend_portfolio(50.0, "conservative")
        assert len(allocations) == 1
        assert allocations[0].ticker == "VOO"
        assert allocations[0].weight == 1.0

    # --- TIER 2 (Standard Adjustments) ---
    def test_tier_2_balanced(self, engine):
        """$200 Balanced -> 70/30 Split."""
        allocs = engine.recommend_portfolio(200.0, "balanced")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.70
        assert w["BND"] == 0.30

    def test_tier_2_conservative(self, engine):
        """$200 Conservative -> Shift 20% to Bonds (50/50)."""
        allocs = engine.recommend_portfolio(200.0, "conservative")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.50
        assert w["BND"] == 0.50

    def test_tier_2_growth(self, engine):
        """$200 Growth -> Shift 15% to Stocks (85/15)."""
        allocs = engine.recommend_portfolio(200.0, "growth")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.85
        assert w["BND"] == 0.15

    # --- TIER 3 (Previously Untested) ---
    def test_tier_3_growth(self, engine):
        """$1000 Growth -> VOO increases, BND decreases."""
        # Base: VOO 0.40, VTI 0.30, BND 0.30
        # Growth: VOO +0.15 (0.55), BND -0.15 (0.15)
        allocs = engine.recommend_portfolio(1000.0, "growth")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.55
        assert w["BND"] == 0.15
        assert w["VTI"] == 0.30

    # --- TIER 4 (Complex Portfolio & Rounding) ---
    def test_tier_4_conservative(self, engine):
        """$5000 Conservative -> AGG increases by 0.20."""
        allocs = engine.recommend_portfolio(5000.0, "conservative")
        w = {a.ticker: a.weight for a in allocs}
        
        # AGG starts at 0.30, adds 0.20 -> 0.50
        assert w["AGG"] == 0.50
        # VOO starts at 0.25, subtracts 0.20 -> 0.05
        # This tests the floating point fix (0.25 - 0.20 >= 0.05)
        assert w["VOO"] == 0.05 
        assert w["VTI"] == 0.25

    def test_tier_4_growth(self, engine):
        """$5000 Growth -> Stock up, Bond down."""
        allocs = engine.recommend_portfolio(5000.0, "growth")
        w = {a.ticker: a.weight for a in allocs}
        # AGG 0.30 - 0.15 -> 0.15
        assert w["AGG"] == 0.15
        # VOO 0.25 + 0.15 -> 0.40
        assert w["VOO"] == 0.40

    # ==========================================
    # 3. SAFETY & DEFENSIVE TESTS (The "What Ifs")
    # ==========================================

    def test_weights_sum_to_one(self, engine):
        """Mathematical integrity check."""
        for profile in ["conservative", "balanced", "growth"]:
            allocs = engine.recommend_portfolio(1000.0, profile)
            total_weight = sum(a.weight for a in allocs)
            assert math.isclose(total_weight, 1.0, rel_tol=1e-9)

    def test_fallback_logic_prevents_negative_weights(self, engine):
        """
        Force a scenario where adjustment would create negative weights.
        The engine should fall back to 'Balanced' rather than return garbage.
        """
        # Mock base allocation to be very fragile: 10% Stock, 90% Bond
        fragile_allocation = {"VOO": 0.10, "BND": 0.90}
        
        with patch.object(engine, '_get_base_allocations', return_value=fragile_allocation):
            # Conservative wants to subtract 0.20 from Stock (0.10 - 0.20 = -0.10)
            # This should trigger the safety check and return the original fragile allocation
            allocs = engine.recommend_portfolio(200.0, "conservative")
            w = {a.ticker: a.weight for a in allocs}
            
            # Assert we kept the original weights instead of crashing or negative
            assert w["VOO"] == 0.10
            assert w["BND"] == 0.90

    # ==========================================
    # 4. INFRASTRUCTURE & ERROR HANDLING
    # ==========================================

    def test_missing_config_file(self):
        """Ensure clear error if etfs.json is missing."""
        with patch("pathlib.Path.exists", return_value=False):
            with pytest.raises(FileNotFoundError, match="ETF configuration not found"):
                AllocationEngine(data_path=Path("fake/path.json"))

    def test_corrupt_config_schema(self):
        """Ensure clear error if etfs.json is missing a tier key."""
        malformed_data = {"tier1": ["VOO"], "tier3": ["VOO", "VTI"]} # Missing tier2
        
        with patch("json.load", return_value=malformed_data):
            engine = AllocationEngine()
            # Fails only when accessing the missing tier
            with pytest.raises(KeyError, match="Configuration for tier2 missing"):
                engine.recommend_portfolio(150.0)

    def test_invalid_risk_profile(self, engine):
        with pytest.raises(ValueError, match="Invalid risk profile"):
            engine.recommend_portfolio(200.0, "yolo_bets")

    def test_negative_balance_guard(self, engine):
        with pytest.raises(ValueError):
            engine.recommend_portfolio(-100.0)

    def test_nan_balance_guard(self, engine):
        with pytest.raises(ValueError, match="NaN"):
            engine.recommend_portfolio(float('nan'))
