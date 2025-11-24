import pytest
import math
from investing.services.batch_calculator import BatchCalculator

class TestBatchCalculator:
    
    @pytest.fixture
    def calculator(self):
        return BatchCalculator()

    # --- HAPPY PATHS ---

    def test_zero_fees_recommends_immediate_investing(self, calculator):
        """If trading is free, never wait."""
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=10.0,
            fixed_cost_per_trade=0.0
        )
        assert rec.days_to_wait == 0
        assert rec.batch_size_dollars == 0.0
        assert "No transaction fees" in rec.reasoning

    def test_standard_case_sanity_check(self, calculator):
        """
        Standard Scenario:
        Accumulate: $10/day, Fee: $5, Return: 0.03% daily
        Math: ~5.77 days
        """
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=10.0,
            fixed_cost_per_trade=5.0,
            expected_daily_return=0.0003
        )
        # Check dollar amount stability
        assert 57.0 < rec.batch_size_dollars < 58.0
        # Check int truncation (5.77 -> 5 days)
        assert rec.days_to_wait == 5

    # --- BOUNDARY CONDITIONS (The "Exact" behaviors) ---

    def test_truncation_behavior(self, calculator):
        """
        CRITICAL: Ensure we truncate (round down) rather than round up.
        If math says 'wait 1.9 days', we want to see 1 day, not 2.
        Why? Better to invest slightly too early (time in market) than too late.
        """
        # Fixed Math:
        # Denom = 10 * 0.001 = 0.01
        # Batch = sqrt(3.6 / 0.01) = sqrt(360) = ~18.97
        # Days = 18.97 / 10 = 1.897 -> Truncates to 1
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=10.0,
            fixed_cost_per_trade=1.8,  
            expected_daily_return=0.001 # FIXED: changed from 0.01 to 0.001
        )
        assert rec.days_to_wait == 1

    def test_exact_cap_boundary(self, calculator):
        """
        Test exactly 365 days. Should NOT trigger the 'Capped' message.
        """
        # We reverse engineer inputs to get exactly 365 days
        # Days = Batch / Daily
        # 365 = Batch / 1  -> Batch = 365
        # Batch = sqrt(2*C / (1*R)) = 365
        # 365^2 = 2*C / R
        # Let R = 1, then C = 365^2 / 2 = 66612.5
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=1.0,
            fixed_cost_per_trade=66612.5,
            expected_daily_return=1.0
        )
        assert rec.days_to_wait == 365
        # Should NOT say "Capped" because it's exactly on the limit
        assert "Capped at 365 days" not in rec.reasoning

    def test_just_over_cap_boundary(self, calculator):
        """
        Test 365.1 days. Should trigger the 'Capped' message.
        """
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=1.0,
            fixed_cost_per_trade=70000.0, # Higher cost pushes it over 365
            expected_daily_return=1.0
        )
        assert rec.days_to_wait == 365
        assert rec.batch_size_dollars == 365.0
        assert "Capped at 365 days" in rec.reasoning

    # --- EXTREME INPUTS (Math Stability) ---

    def test_very_small_returns_handle_gracefully(self, calculator):
        """
        If expected return is near zero (e.g. 1e-9), result explodes to infinity.
        Ensure it hits the cap gracefully instead of crashing.
        """
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=10.0,
            fixed_cost_per_trade=5.0,
            expected_daily_return=0.000000001 # Tiny return
        )
        assert rec.days_to_wait == 365
        assert "Capped" in rec.reasoning

    def test_whale_accumulation(self, calculator):
        """
        User saves $1M/day. Fees are negligible.
        Should recommend daily investing (0 days wait).
        """
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=1_000_000.0,
            fixed_cost_per_trade=5.0,
            expected_daily_return=0.0003
        )
        assert rec.days_to_wait == 0

    # --- INVALID INPUTS (Validation) ---

    def test_zero_accumulation_raises_error(self, calculator):
        with pytest.raises(ValueError, match="accumulation must be positive"):
            calculator.calculate_optimal_batch(daily_accumulation=0.0, fixed_cost_per_trade=5.0)

    def test_negative_return_raises_error(self, calculator):
        with pytest.raises(ValueError, match="return must be positive"):
            calculator.calculate_optimal_batch(
                daily_accumulation=10.0,
                fixed_cost_per_trade=5.0,
                expected_daily_return=-0.001
            )

    def test_zero_return_raises_error(self, calculator):
        """Division by zero protection."""
        with pytest.raises(ValueError, match="return must be positive"):
            calculator.calculate_optimal_batch(
                daily_accumulation=10.0,
                fixed_cost_per_trade=5.0,
                expected_daily_return=0.0
            )

    def test_negative_fee_raises_error(self, calculator):
        with pytest.raises(ValueError, match="cost cannot be negative"):
            calculator.calculate_optimal_batch(
                daily_accumulation=10.0,
                fixed_cost_per_trade=-5.0
            )

    def test_math_precision_stability(self, calculator):
        """Ensure no floating point drift on standard inputs."""
        rec = calculator.calculate_optimal_batch(
            daily_accumulation=5.0,
            fixed_cost_per_trade=2.0,
            expected_daily_return=0.0001
        )
        # sqrt(4 / 0.0005) = sqrt(8000) = ~89.4427
        assert math.isclose(rec.batch_size_dollars, 89.44, rel_tol=1e-2)
