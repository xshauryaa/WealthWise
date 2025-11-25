import pytest
import pandas as pd
import numpy as np
from investing.services.quant_engine import QuantEngine

class TestQuantEngine:
    
    @pytest.fixture
    def engine(self):
        return QuantEngine()

    def test_insufficient_data_returns_zeros(self, engine):
        """If we have < 90 days, return 0s."""
        # Create 50 days of dummy data
        df = pd.DataFrame({'price': [100.0] * 50})
        mom, vol, score = engine.calculate_metrics(df)
        assert mom == 0.0
        assert vol == 0.0
        assert score == 0.0

    def test_momentum_calculation(self, engine):
        """
        Simple Math Check:
        Day 0 (90 days ago): $100
        Day 90 (Today): $110
        Momentum = (110 - 100) / 100 = 0.10 (10%)
        """
        # Create 100 days of data
        # Days 0-89 are $100, Day 90+ is $110
        prices = [100.0] * 90 + [110.0] * 10
        df = pd.DataFrame({'price': prices})
        
        mom, vol, score = engine.calculate_metrics(df)
        
        # Use approx because float math can be 0.10000000001
        assert abs(mom - 0.10) < 0.0001

    def test_volatility_calculation(self, engine):
        """
        Flat line test:
        If price never changes, volatility should be 0.
        """
        prices = [100.0] * 100
        df = pd.DataFrame({'price': prices})
        
        mom, vol, score = engine.calculate_metrics(df)
        
        assert mom == 0.0
        assert vol == 0.0
        assert score == 0.0

    def test_score_logic(self, engine):
        """
        Score = Momentum / Volatility
        """
        # Create a steady uptrend (Positive Momentum, Low Volatility)
        # Prices: 100, 101, 102...
        prices = [100 + i for i in range(100)]
        df = pd.DataFrame({'price': prices})
        
        mom, vol, score = engine.calculate_metrics(df)
        
        assert mom > 0
        assert vol > 0
        assert score == mom / vol
