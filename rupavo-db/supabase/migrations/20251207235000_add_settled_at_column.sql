-- Add settled_at column to transactions table
-- This column stores when the payment was settled by Midtrans

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS settled_at timestamptz;

-- Add comment
COMMENT ON COLUMN public.transactions.settled_at IS 'Timestamp when payment was settled by payment provider';
