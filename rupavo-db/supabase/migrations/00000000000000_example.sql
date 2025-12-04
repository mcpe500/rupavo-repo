-- ============================================================================
-- EXAMPLE MIGRATION TEMPLATE
-- ============================================================================
-- Rename this file when creating your first migration:
--   npm run db:make:migration create_products_table
--
-- Then copy and modify the patterns below.
-- Delete this file after you've created your own migrations.
-- ============================================================================

-- 1. Enable extensions (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- 2. Create your table
-- CREATE TABLE public.products (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name TEXT NOT NULL,
--     slug TEXT NOT NULL UNIQUE,
--     description TEXT,
--     price DECIMAL(12, 2) NOT NULL DEFAULT 0,
--     stock INTEGER NOT NULL DEFAULT 0,
--     is_active BOOLEAN NOT NULL DEFAULT true,
--     metadata JSONB DEFAULT '{}',
--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- 3. Create indexes for common queries
-- CREATE INDEX idx_products_slug ON public.products(slug);
-- CREATE INDEX idx_products_is_active ON public.products(is_active) WHERE is_active = true;
-- CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- 4. Enable Row Level Security (RLS)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Public read access
-- CREATE POLICY "Anyone can read active products"
--     ON public.products FOR SELECT
--     USING (is_active = true);

-- Authenticated users can insert (example)
-- CREATE POLICY "Authenticated users can insert"
--     ON public.products FOR INSERT
--     TO authenticated
--     WITH CHECK (true);

-- 6. Create trigger for updated_at
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_products_updated_at
--     BEFORE UPDATE ON public.products
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TIPS:
-- - Use uuid_generate_v4() for IDs (requires uuid-ossp extension)
-- - Always add created_at and updated_at timestamps
-- - Enable RLS and create appropriate policies
-- - Create indexes for columns used in WHERE clauses
-- - Use JSONB for flexible metadata
-- ============================================================================
