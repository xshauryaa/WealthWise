import time
import threading
from ml.core.exceptions import RateLimitExceeded

class InMemoryRateLimiter:
    """
    Thread-safe Token Bucket implementation.
    Refills tokens automatically based on time elapsed.
    """
    def __init__(self, rate_limit: int = 15, time_window: int = 60):
        self.rate = rate_limit
        self.window = time_window
        self.tokens = rate_limit
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        # Calculate tokens to add (rate per second * elapsed seconds)
        refill_amount = elapsed * (self.rate / self.window)
        
        if refill_amount > 0:
            self.tokens = min(self.rate, self.tokens + refill_amount)
            self.last_refill = now

    def acquire(self):
        with self.lock:
            self._refill()
            if self.tokens >= 1:
                self.tokens -= 1
                return True
            else:
                raise RateLimitExceeded(f"Rate limit of {self.rate} RPM exceeded. Try again later.")

# Global singleton instance
limiter = InMemoryRateLimiter()
