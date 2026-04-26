-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    seller_user_id TEXT,
    funder_user_id TEXT,
    buyer TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    discount NUMERIC NOT NULL,
    due TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'funded', 'repaid')),
    seller TEXT NOT NULL,
    funder TEXT,
    yield NUMERIC NOT NULL,
    funded NUMERIC NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    risk_score INTEGER,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('Fund', 'List', 'Repay')),
    name TEXT NOT NULL,
    amount TEXT NOT NULL,
    xlm TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Success', 'Pending')),
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    idempotency_key UUID UNIQUE
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    visits INTEGER DEFAULT 1,
    user_agent TEXT,
    language TEXT,
    platform TEXT,
    consented BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nonces table for wallet auth
CREATE TABLE IF NOT EXISTS nonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    nonce TEXT NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_seller_user_id ON invoices(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_funder_user_id ON invoices(funder_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_actor_user_id ON transactions(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_user_id ON visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_nonces_address ON nonces(address);
CREATE INDEX IF NOT EXISTS idx_nonces_consumed ON nonces(consumed);

-- Unique constraint: one active funding per (invoiceId, funderAddress)
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_funding_unique ON invoices(id, funder) WHERE status = 'funded' AND funder IS NOT NULL;

-- Enable Row-Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE nonces ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices (users can see their own invoices)
CREATE POLICY IF NOT EXISTS "Users can view own invoices"
    ON invoices FOR SELECT
    USING (auth.uid()::text = seller_user_id OR auth.uid()::text = funder_user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "Users can insert invoices"
    ON invoices FOR INSERT
    WITH CHECK (auth.uid()::text = seller_user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "Users can update own invoices"
    ON invoices FOR UPDATE
    USING (auth.uid()::text = seller_user_id OR auth.uid()::text = funder_user_id OR auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.uid()::text = seller_user_id OR auth.uid()::text = funder_user_id OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for transactions
CREATE POLICY IF NOT EXISTS "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid()::text = actor_user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "Users can insert transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid()::text = actor_user_id OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for visitors
CREATE POLICY IF NOT EXISTS "Users can view own visitors"
    ON visitors FOR SELECT
    USING (auth.uid()::text = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "Unauthenticated can insert visitors"
    ON visitors FOR INSERT
    WITH CHECK (true);

-- RLS Policies for nonces (internal use only)
CREATE POLICY IF NOT EXISTS "Service role can manage nonces"
    ON nonces FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
