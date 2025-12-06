-- =============================================================================
-- Migration: Add expense tracking and soft delete support
-- For Asisten transaction recording feature
-- =============================================================================

-- 1. Create expenses table for tracking purchases/costs
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  
  -- Details
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('bahan_baku', 'operasional', 'gaji', 'utilitas', 'marketing', 'general')),
  supplier_name text,
  
  -- Source tracking
  recorded_via text DEFAULT 'asisten' CHECK (recorded_via IN ('manual', 'asisten', 'import')),
  
  -- Soft delete
  deleted_at timestamptz DEFAULT NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_shop_id ON public.expenses(shop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(shop_id, created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_not_deleted ON public.expenses(shop_id) WHERE deleted_at IS NULL;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS expenses_set_updated_at ON public.expenses;
CREATE TRIGGER expenses_set_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- 2. Add soft delete to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_not_deleted ON public.orders(shop_id) WHERE deleted_at IS NULL;

-- 3. Add recorded_via column to orders for tracking source
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS recorded_via text DEFAULT 'manual' CHECK (recorded_via IN ('manual', 'asisten', 'storefront', 'import'));

-- 4. RLS Policies for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage their shop expenses" ON public.expenses;
CREATE POLICY "Owner can manage their shop expenses"
  ON public.expenses FOR ALL
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- 5. Create a combined view for transactions (orders + expenses)
CREATE OR REPLACE VIEW public.shop_transactions AS
SELECT 
  o.id,
  o.shop_id,
  'sale' as type,
  COALESCE(o.buyer_name, 'Penjualan') as description,
  o.total_amount as amount,
  o.created_at,
  o.deleted_at,
  o.recorded_via
FROM public.orders o
WHERE o.deleted_at IS NULL

UNION ALL

SELECT 
  e.id,
  e.shop_id,
  'expense' as type,
  e.description,
  -e.amount as amount, -- Negative for expenses
  e.created_at,
  e.deleted_at,
  e.recorded_via
FROM public.expenses e
WHERE e.deleted_at IS NULL

ORDER BY created_at DESC;

-- Comments
COMMENT ON TABLE public.expenses IS 'Shop expenses/purchases for cashflow tracking';
COMMENT ON VIEW public.shop_transactions IS 'Combined view of sales (orders) and expenses for transaction list';
