-- Comprehensive RLS Security Fix for Payment System
-- Fixes: permission denied errors, unrestricted tables/views

-------------------------------------
-- 1) FIX TRANSACTIONS TABLE RLS
-------------------------------------
-- Ensure RLS is enabled (should already be, but confirm)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Fix admin policy - use auth.jwt() instead of querying auth.users
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
CREATE POLICY "Admins can manage all transactions"
  ON public.transactions FOR ALL
  USING (
    (auth.jwt() ->> 'email') LIKE '%@rupavo.com'
  );

-------------------------------------
-- 2) FIX PAYOUTS TABLE RLS
-------------------------------------
-- Ensure RLS is enabled
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Fix admin policy - use auth.jwt() instead of querying auth.users
DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts"
  ON public.payouts FOR ALL
  USING (
    (auth.jwt() ->> 'email') LIKE '%@rupavo.com'
  );

-- Add UPDATE policy for shop owners (was missing)
DROP POLICY IF EXISTS "Shop owners can update their pending payouts" ON public.payouts;
CREATE POLICY "Shop owners can update their pending payouts"
  ON public.payouts FOR UPDATE
  USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
    AND status = 'pending'
  );

-- Add DELETE policy for shop owners (was missing)
DROP POLICY IF EXISTS "Shop owners can cancel their pending payouts" ON public.payouts;
CREATE POLICY "Shop owners can cancel their pending payouts"
  ON public.payouts FOR DELETE
  USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
    AND status = 'pending'
  );

-------------------------------------
-- 3) FIX SHOP_BALANCES VIEW
-------------------------------------
-- Views need to be recreated with SECURITY INVOKER to respect RLS
-- Drop and recreate the view with proper security
DROP VIEW IF EXISTS public.shop_balances;

CREATE VIEW public.shop_balances 
WITH (security_invoker = true) AS
SELECT 
  s.id as shop_id,
  s.name as shop_name,
  COALESCE(SUM(t.merchant_amount) FILTER (WHERE t.status = 'settlement'), 0) as total_earned,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status IN ('completed', 'processing')), 0) as total_withdrawn,
  COALESCE(SUM(t.merchant_amount) FILTER (WHERE t.status = 'settlement'), 0) - 
    COALESCE(SUM(p.amount) FILTER (WHERE p.status IN ('completed', 'processing')), 0) as available_balance,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'pending'), 0) as pending_withdrawal
FROM public.shops s
LEFT JOIN public.transactions t ON t.shop_id = s.id
LEFT JOIN public.payouts p ON p.shop_id = s.id
WHERE s.owner_id = auth.uid()  -- Only show balance for user's own shops
GROUP BY s.id, s.name;

COMMENT ON VIEW public.shop_balances IS 'Secure shop balance calculation - respects RLS';

-------------------------------------
-- 4) FIX SHOP_PAYMENT_SETTINGS RLS
-------------------------------------
-- Ensure RLS is enabled
ALTER TABLE public.shop_payment_settings ENABLE ROW LEVEL SECURITY;

-- The "Public can view" policy is TOO permissive, restrict it
DROP POLICY IF EXISTS "Public can view payment settings for checkout" ON public.shop_payment_settings;
CREATE POLICY "Public can view payment settings for checkout"
  ON public.shop_payment_settings FOR SELECT
  USING (
    -- Only allow viewing settings for published shops
    shop_id IN (SELECT id FROM public.shops WHERE storefront_published = true)
  );
