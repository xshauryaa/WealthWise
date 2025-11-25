import numpy as np
import pandas as pd
from typing import Tuple

class QuantEngine:
    """
    Performs quantitative analysis on historical price data.
    """

    def calculate_metrics(self, history: pd.DataFrame) -> Tuple[float, float, float]:
        """
        Calculates Momentum, Volatility, and Risk-Adjusted Score.
        
        Args:
            history: DataFrame with 'date' and 'price' columns, sorted Oldest -> Newest.
            
        Returns:
            (momentum_score, volatility_score, final_score)
        """
        if len(history) < 90:
            # Not enough data to calculate 90-day momentum
            return 0.0, 0.0, 0.0

        prices = history['price'].values
        
        # 1. Calculate Momentum (90-day Rate of Change)
        # Formula: (Price_Today - Price_90DaysAgo) / Price_90DaysAgo
        # We use index -90 because list is sorted Oldest -> Newest (last item is today)
        price_today = prices[-1]
        price_90_ago = prices[-90]
        
        if price_90_ago == 0:
            momentum = 0.0
        else:
            momentum = (price_today - price_90_ago) / price_90_ago

        # 2. Calculate Volatility (Annualized Standard Deviation)
        # Calculate daily percentage returns: (Price_t / Price_t-1) - 1
        daily_returns = np.diff(prices) / prices[:-1]
        
        # StdDev of returns * sqrt(252 trading days)
        daily_std = np.std(daily_returns)
        volatility = daily_std * np.sqrt(252)

        # 3. Calculate Risk-Adjusted Score
        # Formula: Momentum / Volatility
        # Handle division by zero if volatility is 0 (rare, but possible with flat data)
        if volatility == 0:
            score = 0.0
        else:
            score = momentum / volatility

        return float(momentum), float(volatility), float(score)
