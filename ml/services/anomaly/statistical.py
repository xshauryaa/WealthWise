import numpy as np
from decimal import Decimal
from typing import List
from ml.core.models import DetectAnomalyResponse, AnomalyComparison

class StatisticalDetector:
    def __init__(self, sensitivity: float = 2.0):
        """
        sensitivity: Number of standard deviations to trigger an anomaly (default 2.0)
        """
        self.sensitivity = sensitivity

    def detect(self, history: List[Decimal], current_amount: Decimal) -> DetectAnomalyResponse:
        """
        Analyze if current_amount is an outlier compared to history.
        """
        # Not enough data to judge?
        if len(history) < 5:
            return DetectAnomalyResponse(
                is_anomaly=False,
                severity="none",
                reasons=["Not enough historical data (need 5+ txns)"]
            )

        # Convert Decimals to floats for numpy math
        values = np.array([float(x) for x in history])
        current = float(current_amount)

        mean = np.mean(values)
        std_dev = np.std(values)
        
        # Prevent division by zero if variance is 0 (e.g., all txns are exactly $10.00)
        if std_dev == 0:
            std_dev = 0.01

        # Z-Score Formula: (Value - Mean) / StdDev
        z_score = (current - mean) / std_dev
        
        threshold_price = mean + (self.sensitivity * std_dev)
        is_anomaly = current > threshold_price

        severity = "none"
        if is_anomaly:
            if z_score > 4: severity = "high"
            elif z_score > 3: severity = "medium"
            else: severity = "low"

        return DetectAnomalyResponse(
            is_anomaly=is_anomaly,
            severity=severity,
            reasons=[f"Transaction is {z_score:.1f}x standard deviations above average"] if is_anomaly else [],
            comparison=AnomalyComparison(
                category_mean=Decimal(f"{mean:.2f}"),
                category_std=Decimal(f"{std_dev:.2f}"),
                threshold=Decimal(f"{threshold_price:.2f}"),
                z_score=float(z_score)
            )
        )
