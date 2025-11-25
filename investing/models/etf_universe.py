from sqlalchemy import String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from investing.models.base import Base
from datetime import datetime

class EtfUniverse(Base):
    """
    Phase 2: Quantitative Engine Data.
    Stores the daily calculated scores for Sector Rotation.
    """
    __tablename__ = "etf_universe"

    # Ticker Symbol (e.g. "XLK")
    ticker: Mapped[str] = mapped_column(String(10), primary_key=True)
    
    # Sector Name (e.g. "Technology")
    sector: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Mathematical Scores (Calculated by NumPy)
    momentum_score: Mapped[float] = mapped_column(Float, default=0.0)
    volatility: Mapped[float] = mapped_column(Float, default=0.0)
    
    # The price at the time of analysis
    last_price: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Audit timestamp
    last_analyzed: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
