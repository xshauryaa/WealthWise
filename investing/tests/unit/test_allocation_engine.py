import pytest
import math
from unittest.mock import patch, MagicMock
from investing.services.allocation_engine import AllocationEngine

class TestAllocationEngine:
    @pytest.fixture
    def engine(self):
        return AllocationEngine()

    def test_invalid_risk_profile(self, engine):
        # Now that we added runtime validation, this should pass
        with pytest.raises(ValueError, match="Invalid risk profile"):
            engine.recommend_portfolio(200.0, "yolo_bets")

    def test_corrupt_config_schema(self):
        """Ensure clear error if etfs.json is missing a tier key."""
        # We patch the method that LOADS the data, forcing it to return bad data
        with patch.object(AllocationEngine, '_load_etf_data') as mock_load:
            mock_load.return_value = {"tier1": ["VOO"], "tier3": ["VOO"]} # Missing tier2
            
            engine = AllocationEngine()
            with pytest.raises(KeyError, match="tier2"):
                 # 150 triggers Tier 2
                 engine.recommend_portfolio(150.0)

    def test_zero_balance_returns_one_etf(self, engine):
        assert engine.get_etf_count(0.0) == 1
    
    def test_precision_boundary_lower(self, engine):
        assert engine.get_etf_count(99.99) == 1

    def test_boundary_at_100_dollars(self, engine):
        assert engine.get_etf_count(100.0) == 2

    def test_precision_boundary_upper(self, engine):
        assert engine.get_etf_count(1999.99) == 3

    def test_boundary_at_2000_dollars(self, engine):
        assert engine.get_etf_count(2000.0) == 4

    def test_extremely_large_balance(self, engine):
        assert engine.get_etf_count(100_000_000.00) == 4

    def test_tier_1_ignores_risk_profile(self, engine):
        allocations = engine.recommend_portfolio(50.0, "conservative")
        assert len(allocations) == 1
        assert allocations[0].ticker == "VOO"
        assert allocations[0].weight == 1.0

    def test_tier_2_balanced(self, engine):
        allocs = engine.recommend_portfolio(200.0, "balanced")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.70
        assert w["BND"] == 0.30

    def test_tier_2_conservative(self, engine):
        allocs = engine.recommend_portfolio(200.0, "conservative")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.50
        assert w["BND"] == 0.50

    def test_tier_2_growth(self, engine):
        allocs = engine.recommend_portfolio(200.0, "growth")
        w = {a.ticker: a.weight for a in allocs}
        assert w["VOO"] == 0.85
        assert w["BND"] == 0.15

    def test_weights_sum_to_one(self, engine):
        for profile in ["conservative", "balanced", "growth"]:
            allocs = engine.recommend_portfolio(1000.0, profile)
            total_weight = sum(a.weight for a in allocs)
            assert math.isclose(total_weight, 1.0, rel_tol=1e-9)
