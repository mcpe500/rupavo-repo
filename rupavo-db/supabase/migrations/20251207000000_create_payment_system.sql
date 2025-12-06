-- Payment system for Rupavo
-- Supports online orders, payment via Midtrans, and merchant payouts

-- Add payment and order flow fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('cash', 'online', 'bank_transfer', 'qris', 'gopay', 'shopeepay', 'ovo', 'dana')),
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'manual' CHECK (order_type IN ('manual', 'online', 'preorder')),
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_address text,
ADD COLUMN IF NOT EXISTS customer_notes text,
ADD COLUMN IF NOT EXISTS delivery_method text CHECK (delivery_method IN ('pickup', 'delivery', null)),
ADD COLUMN IF NOT EXISTS delivery_fee numeric(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS merchant_received numeric(12,2), -- Amount merchant receives after fees
ADD COLUMN IF NOT EXISTS platform_fee numeric(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Transactions table for payment records
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_method text NOT NULL,
  payment_provider text DEFAULT 'midtrans', -- midtrans, manual, etc
  amount numeric(12,2) NOT NULL,
  platform_fee numeric(12,2) DEFAULT 0,
  merchant_amount numeric(12,2) NOT NULL, -- Amount credited to merchant
  
  -- Midtrans integration
  midtrans_order_id text UNIQUE,
  midtrans_transaction_id text,
  midtrans_status text,
  midtrans_payment_type text,
  midtrans_fraud_status text,
  midtrans_response jsonb,
  
  -- Status tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund')),
  paid_at timestamptz,
  expired_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shop_id ON public.transactions(shop_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_midtrans_order_id ON public.transactions(midtrans_order_id);

-- Trigger for transactions updated_at
DROP TRIGGER IF EXISTS transactions_set_updated_at ON public.transactions;
CREATE TRIGGER transactions_set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- Shop payment settings (bank accounts for payouts)
CREATE TABLE IF NOT EXISTS public.shop_payment_settings (
  shop_id uuid PRIMARY KEY REFERENCES public.shops(id) ON DELETE CASCADE,
  
  -- Bank account for payouts
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  
  -- Payment preferences
  accept_online_orders boolean DEFAULT true,
  accept_preorders boolean DEFAULT false,
  min_order_amount numeric(12,2) DEFAULT 0,
  
  -- Delivery settings
  delivery_available boolean DEFAULT false,
  delivery_radius_km numeric(5,2),
  delivery_base_fee numeric(12,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS shop_payment_settings_set_updated_at ON public.shop_payment_settings;
CREATE TRIGGER shop_payment_settings_set_updated_at
BEFORE UPDATE ON public.shop_payment_settings
FOR EACH ROW
EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- Payouts/Withdrawals table
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  
  amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Bank transfer details
  bank_name text NOT NULL,
  bank_account_number text NOT NULL,
  bank_account_holder text NOT NULL,
  
  -- Processing
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz,
  failed_reason text,
  
  -- Admin notes
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payouts_shop_id ON public.payouts(shop_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

DROP TRIGGER IF EXISTS payouts_set_updated_at ON public.payouts;
CREATE TRIGGER payouts_set_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- Shop balance view (calculated from transactions and payouts)
CREATE OR REPLACE VIEW public.shop_balances AS
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
GROUP BY s.id, s.name;

-- RLS Policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Transactions policies
DROP POLICY IF EXISTS "Shop owners can view their transactions" ON public.transactions;
CREATE POLICY "Shop owners can view their transactions"
  ON public.transactions FOR SELECT
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view transaction for order verification" ON public.transactions;
CREATE POLICY "Public can view transaction for order verification"
  ON public.transactions FOR SELECT
  USING (true); -- Needed for order status check in storefront

-- Shop payment settings policies
DROP POLICY IF EXISTS "Shop owners can manage their payment settings" ON public.shop_payment_settings;
CREATE POLICY "Shop owners can manage their payment settings"
  ON public.shop_payment_settings FOR ALL
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public can view payment settings for checkout" ON public.shop_payment_settings;
CREATE POLICY "Public can view payment settings for checkout"
  ON public.shop_payment_settings FOR SELECT
  USING (true);

-- Payouts policies
DROP POLICY IF EXISTS "Shop owners can view their payouts" ON public.payouts;
CREATE POLICY "Shop owners can view their payouts"
  ON public.payouts FOR SELECT
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Shop owners can request payouts" ON public.payouts;
CREATE POLICY "Shop owners can request payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Admin policies for payment management
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
CREATE POLICY "Admins can manage all transactions"
  ON public.transactions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%@rupavo.com'
  ));

DROP POLICY IF EXISTS "Admins can manage all payouts" ON public.payouts;
CREATE POLICY "Admins can manage all payouts"
  ON public.payouts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%@rupavo.com'
  ));

-- Comments for documentation
COMMENT ON TABLE public.transactions IS 'Payment transactions via Midtrans or other gateways';
COMMENT ON TABLE public.shop_payment_settings IS 'Shop payment configuration and bank account info';
COMMENT ON TABLE public.payouts IS 'Merchant withdrawal requests and processing';
COMMENT ON VIEW public.shop_balances IS 'Real-time shop balance calculation';
