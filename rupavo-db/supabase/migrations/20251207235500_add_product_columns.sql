-- Add missing columns to products table for Flutter app compatibility

-- Add category_id column (optional, for product categorization)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category_id text;

-- Add stock column (optional, for inventory tracking)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;

-- Add tagline column (for product slogans)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tagline text;

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(shop_id, category_id);
