-- Add business_type column to shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'General';

COMMENT ON COLUMN public.shops.business_type IS 'Type of business (e.g. F&B, Retail, Services) for AI context';
