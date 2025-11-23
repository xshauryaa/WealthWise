from decimal import Decimal
from datetime import datetime
import calendar

class VelocityCalculator:
    def calculate_projected_spend(self, current_spend: Decimal, date: datetime) -> Decimal:
        """
        Project end-of-month spend based on current pace.
        Formula: (Spend / Days_Passed) * Days_In_Month
        """
        # Get total days in the transaction's month
        _, days_in_month = calendar.monthrange(date.year, date.month)
        day_of_month = date.day

        # Avoid division by zero on the 1st of the month (treat as 1 day passed)
        effective_days = max(1, day_of_month)

        # Calculate daily burn rate
        daily_rate = current_spend / Decimal(effective_days)
        
        # Project to end of month
        projected = daily_rate * Decimal(days_in_month)
        
        return round(projected, 2)
