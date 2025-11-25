import time
import logging
from typing import List
from sqlalchemy.orm import Session
from investing.models.base import get_session_context
from investing.models.etf_universe import EtfUniverse
from investing.services.market_data import AlphaVantageClient
from investing.services.quant_engine import QuantEngine
from investing.config import ALPHA_VANTAGE_API_KEY

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class Harvester:
    """
    Background service to fetch sector data, calculate momentum,
    and update the ETF Universe database.
    """
    
    # Standard SPDR Sector ETFs
    SECTOR_WATCHLIST = {
        "XLK": "Technology",
        "XLF": "Financials",
        "XLV": "Healthcare",
        "XLE": "Energy",
        "XLP": "Consumer Staples",
    }

    def __init__(self):
        self.client = AlphaVantageClient(api_key=ALPHA_VANTAGE_API_KEY)
        self.quant = QuantEngine()

    def run(self):
        """Execute the daily harvest."""
        logger.info("🚜 Starting Sector Harvest...")
        
        with get_session_context() as session:
            for ticker, sector in self.SECTOR_WATCHLIST.items():
                self._process_ticker(session, ticker, sector)
                
                # Rate Limit Protection (4 calls/min safe zone)
                logger.info("zzZ Sleeping 15s to respect API limits...")
                time.sleep(15)

        logger.info("✅ Harvest Complete.")

    def _process_ticker(self, session: Session, ticker: str, sector: str):
        try:
            logger.info(f"Processing {ticker} ({sector})...")
            
            # FIXED: Updated method name to match the Free Tier client
            history = self.client.fetch_daily_history(ticker)
            
            if history.empty:
                logger.warning(f"⚠️ No data found for {ticker}. Skipping.")
                return

            # 2. Calculate Math
            mom, vol, score = self.quant.calculate_metrics(history)
            last_price = history.iloc[-1]['price']
            
            logger.info(f"   -> Score: {score:.4f} (Mom: {mom:.2%}, Vol: {vol:.2%})")

            # 3. Upsert to Database
            existing = session.query(EtfUniverse).get(ticker)
            
            if existing:
                existing.momentum_score = mom
                existing.volatility = vol
                existing.last_price = last_price
            else:
                new_record = EtfUniverse(
                    ticker=ticker,
                    sector=sector,
                    momentum_score=mom,
                    volatility=vol,
                    last_price=last_price
                )
                session.add(new_record)
            
            session.flush()

        except Exception as e:
            logger.error(f"❌ Failed to process {ticker}: {e}")

if __name__ == "__main__":
    harvester = Harvester()
    harvester.run()
