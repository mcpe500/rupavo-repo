-- Security fix for views that expose data across shops
-- Both shop_transactions and shop_balances need proper security

-------------------------------------------
-- 1) Fix shop_transactions view
-------------------------------------------
DROP VIEW IF EXISTS public.shop_transactions;

CREATE VIEW public.shop_transactions 
WITH (security_invoker = true) AS
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
INNER JOIN public.shops s ON s.id = o.shop_id
WHERE o.deleted_at IS NULL
  AND s.owner_id = auth.uid()  -- SECURITY: Only show current user's shop transactions

UNION ALL

SELECT 
  e.id,
  e.shop_id,
  'expense' as type,
  e.description,
  -e.amount as amount,
  e.created_at,
  e.deleted_at,
  e.recorded_via
FROM public.expenses e
INNER JOIN public.shops s ON s.id = e.shop_id
WHERE e.deleted_at IS NULL
  AND s.owner_id = auth.uid()  -- SECURITY: Only show current user's shop expenses

ORDER BY created_at DESC;

COMMENT ON VIEW public.shop_transactions IS 'Secure combined view of sales and expenses - filtered by current user';

-------------------------------------------
-- 2) Fix shop_balances view
-------------------------------------------
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
WHERE s.owner_id = auth.uid()  -- SECURITY: Only show balance for user's own shops
GROUP BY s.id, s.name;

COMMENT ON VIEW public.shop_balances IS 'Secure shop balance calculation - filtered by current user';
