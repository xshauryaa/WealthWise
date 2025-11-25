import math
from dataclasses import dataclass

@dataclass
class BatchRecommendation:
    batch_size_dollars: float
    days_to_wait: int
    reasoning: str

class BatchCalculator:
    """
    Calculates optimal investment batch frequency to minimize total costs.
    Minimizes: Transaction Fees + Opportunity Cost (Cash Drag)
    """

    def calculate_optimal_batch(
        self,
        daily_accumulation: float,
        fixed_cost_per_trade: float,
        expected_daily_return: float = 0.0003  # Default ~7.5% annual / 252 trading days
    ) -> BatchRecommendation:
        """
        Returns optimal batch size and wait time.

        Formula: Batch = sqrt( 2 * FixedCost / (DailyAccumulation * DailyReturn) )
        """
        # 1. Validation
        if daily_accumulation <= 0:
            raise ValueError("Daily accumulation must be positive")
        
        if expected_daily_return <= 0:
            raise ValueError("Expected daily return must be positive")
            
        if fixed_cost_per_trade < 0:
            raise ValueError("Fixed cost cannot be negative")

        # 2. Zero-Cost Edge Case (Invest Immediately)
        if fixed_cost_per_trade == 0:
            return BatchRecommendation(
                batch_size_dollars=0.0,
                days_to_wait=0,
                reasoning="No transaction fees detected. Optimal strategy is to invest immediately."
            )

        # 3. Core Math
        # Denominator represents the "cost of waiting" (opportunity cost rate)
        opportunity_cost_factor = daily_accumulation * expected_daily_return
        
        optimal_batch = math.sqrt(
            (2 * fixed_cost_per_trade) / opportunity_cost_factor
        )

        days_to_wait = optimal_batch / daily_accumulation

        # 4. Cap at 365 days (Pragmatism override)
        if days_to_wait > 365:
            return BatchRecommendation(
                batch_size_dollars=daily_accumulation * 365,
                days_to_wait=365,
                reasoning="Optimal waiting period exceeds 1 year. Capped at 365 days for practicality."
            )

        return BatchRecommendation(
            batch_size_dollars=round(optimal_batch, 2),
            days_to_wait=int(days_to_wait),
            reasoning=f"Waiting {int(days_to_wait)} days minimizes the sum of fees (${fixed_cost_per_trade}) and opportunity cost."
        )
