import pytest
import pandas as pd
from unittest.mock import Mock, patch
from investing.services.market_data import AlphaVantageClient

class TestMarketDataLogic:
    """
    Zero-cost verification of the data processing logic.
    Ensures the DataFrame is built correctly BEFORE we touch the real API.
    """

    def test_fetch_history_parsing_logic(self):
        # 1. Setup the Client
        client = AlphaVantageClient(api_key="TEST_KEY_DO_NOT_USE")

        # 2. Create a Fake API Response (mimicking Alpha Vantage exactly)
        # Note: TIME_SERIES_DAILY uses "4. close"
        mock_api_data = {
            "Meta Data": {"1. Information": "Daily Prices..."},
            "Time Series (Daily)": {
                "2023-11-24": {
                    "1. open": "150.00",
                    "4. close": "155.00",  # <--- The value we want
                    "5. volume": "100"
                },
                "2023-11-23": {
                    "1. open": "148.00",
                    "4. close": "149.50",
                    "5. volume": "200"
                },
                "2023-11-22": {  # Oldest date
                    "1. open": "145.00",
                    "4. close": "146.00",
                    "5. volume": "300"
                }
            }
        }

        # 3. Patch the network call so we don't hit the internet
        with patch.object(client, '_make_request', return_value=mock_api_data["Time Series (Daily)"]):
            
            # 4. Run the method
            df = client.fetch_daily_history("TEST_TICKER")

            # 5. rigorous Assertions
            print("\n[Logic Check] dataframe structure:")
            print(df)
            
            # Check Types
            assert isinstance(df, pd.DataFrame), "Result must be a Pandas DataFrame"
            
            # Check Columns
            assert "date" in df.columns, "Missing 'date' column"
            assert "price" in df.columns, "Missing 'price' column"
            
            # Check Sorting (Critical for Momentum)
            # Index 0 should be the OLDEST date (Nov 22), Index 2 should be NEWEST (Nov 24)
            assert df.iloc[0]['price'] == 146.00, "Sorting Error: First row should be oldest"
            assert df.iloc[-1]['price'] == 155.00, "Sorting Error: Last row should be newest"
            
            # Check Length
            assert len(df) == 3, f"Expected 3 rows, got {len(df)}"

