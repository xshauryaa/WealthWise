from abc import ABC, abstractmethod
from ml.core.models import CategorizeRequest, CategorizeResponse

class BaseCategorizer(ABC):
    @abstractmethod
    async def categorize(self, request: CategorizeRequest) -> CategorizeResponse:
        """
        Determine category for a transaction.
        """
        pass
