-- WealthWise Investing Schema
-- STRICT MODE: Constraints enforced at DB level

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
-- We use native VARCHAR with CHECK constraints instead of Postgres ENUMs 
-- for easier migrations and portability.

-- 3. TABLES

-- USERS (Simplification for MVP, usually managed by Auth service)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PORTFOLIOS
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- "name" is useful for UI (e.g. "Retirement Fund")
    name VARCHAR(50) NOT NULL,
    
    -- CRITICAL: The "Risk Profile" drives the Allocation Engine
    risk_profile VARCHAR(20) NOT NULL 
        CHECK (risk_profile IN ('conservative', 'balanced', 'growth')),
        
    -- CRITICAL: Prevent overdrafts at the database level
    cash_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
        CHECK (cash_balance >= 0),
        
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HOLDINGS (The current state of ownership)
CREATE TABLE IF NOT EXISTS holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    ticker VARCHAR(10) NOT NULL,
    
    -- Fractional shares support (up to 6 decimal places)
    shares DECIMAL(12, 6) NOT NULL 
        CHECK (shares > 0),
        
    -- Average Cost Basis (for tax/performance calc)
    avg_cost_per_share DECIMAL(10, 2) NOT NULL 
        CHECK (avg_cost_per_share >= 0),
        
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: One row per ticker per portfolio
    UNIQUE(portfolio_id, ticker)
);

-- TRANSACTIONS (The immutable history)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Transaction Metadata
    type VARCHAR(10) NOT NULL 
        CHECK (type IN ('BUY', 'SELL', 'DEPOSIT', 'WITHDRAW')),
        
    ticker VARCHAR(10),  -- NULL for Deposit/Withdraw
    
    -- Quantities
    shares DECIMAL(12, 6), -- NULL for Deposit/Withdraw
    price_per_share DECIMAL(10, 2), -- Price at execution
    
    -- The actual money moved
    total_amount DECIMAL(10, 2) NOT NULL,
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
-- Speed up "Get my latest trades"
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
