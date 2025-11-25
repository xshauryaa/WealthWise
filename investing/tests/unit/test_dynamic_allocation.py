import pytest
from unittest.mock import MagicMock
from investing.services.allocation_engine import AllocationEngine
from investing.models.etf_universe import EtfUniverse

class TestDynamicAllocation:
    
    @pytest.fixture
    def engine(self):
        return AllocationEngine()

    @pytest.fixture
    def mock_db(self):
        """Mocks a database session with a clear Momentum Winner."""
        session = MagicMock()
        
        # Scenario: Tech (XLK) is winning with 15% momentum
        winner = EtfUniverse(ticker="XLK", momentum_score=0.15)
        
        # Setup the query chain: session.execute(stmt).scalars().first()
        session.execute.return_value.scalars.return_value.first.return_value = winner
        return session

    @pytest.fixture
    def empty_db(self):
        """Mocks a database with NO data."""
        session = MagicMock()
        session.execute.return_value.scalars.return_value.first.return_value = None
        return session

    def test_dynamic_tilt_applied(self, engine, mock_db):
        """
        Scenario: User has $1000 (Tier 3).
        Base: VOO (40%), VTI (30%), BND (30%)
        Winner: XLK (Tech)
        
        Expected:
        - VOO reduces by 30% -> 10%
        - XLK gets 30%
        - Others stay same
        """
        allocs = engine.recommend_portfolio(1000.0, "balanced", db=mock_db)
        w = {a.ticker: a.weight for a in allocs}
        
        assert w["XLK"] == 0.30  # The Tilt
        assert w["VOO"] == 0.10  # Reduced from 0.40
        assert w["BND"] == 0.30  # Unchanged
        
        # Sum is still 1.0
        assert sum(w.values()) == 1.0

    def test_fallback_if_db_empty(self, engine, empty_db):
        """
        Scenario: Harvester hasn't run yet.
        Expected: Standard static allocation (No crash).
        """
        allocs = engine.recommend_portfolio(1000.0, "balanced", db=empty_db)
        w = {a.ticker: a.weight for a in allocs}
        
        assert "XLK" not in w
        assert w["VOO"] == 0.40  # Original weight
        assert w["BND"] == 0.30

    def test_tier_1_ignores_dynamic(self, engine, mock_db):
        """
        Scenario: User has $50 (Tier 1).
        Rule: Tier 1 allows NO diversification, even for momentum.
        """
        allocs = engine.recommend_portfolio(50.0, "balanced", db=mock_db)
        w = {a.ticker: a.weight for a in allocs}
        
        assert len(w) == 1
        assert w["VOO"] == 1.0
        assert "XLK" not in w

