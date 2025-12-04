-- =============================================================================
-- Rupavo Database - Row Level Security Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SHOPS POLICIES
-- =============================================================================

-- Owner can do everything with their shop
CREATE POLICY "Owner can manage their shop"
    ON shops FOR ALL
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Public can read shops (for storefront)
CREATE POLICY "Public can view shops"
    ON shops FOR SELECT
    USING (true);

-- =============================================================================
-- PRODUCT CATEGORIES POLICIES
-- =============================================================================

-- Owner can manage categories
CREATE POLICY "Owner can manage categories"
    ON product_categories FOR ALL
    USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Public can read categories
CREATE POLICY "Public can view categories"
    ON product_categories FOR SELECT
    USING (true);

-- =============================================================================
-- PRODUCTS POLICIES
-- =============================================================================

-- Owner can manage products
CREATE POLICY "Owner can manage products"
    ON products FOR ALL
    USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Public can read available products
CREATE POLICY "Public can view available products"
    ON products FOR SELECT
    USING (is_available = true);

-- =============================================================================
-- ORDERS POLICIES
-- =============================================================================

-- Owner can read/update their shop's orders
CREATE POLICY "Owner can manage shop orders"
    ON orders FOR ALL
    USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Anyone can create orders (for storefront checkout)
CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- =============================================================================
-- ORDER ITEMS POLICIES
-- =============================================================================

-- Owner can manage order items
CREATE POLICY "Owner can view order items"
    ON order_items FOR SELECT
    USING (order_id IN (
        SELECT o.id FROM orders o 
        JOIN shops s ON o.shop_id = s.id 
        WHERE s.owner_id = auth.uid()
    ));

-- Anyone can insert order items (for checkout)
CREATE POLICY "Anyone can create order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- =============================================================================
-- STOREFRONT LAYOUTS POLICIES
-- =============================================================================

-- Owner can manage layouts
CREATE POLICY "Owner can manage storefront layouts"
    ON storefront_layouts FOR ALL
    USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- Public can read active layouts
CREATE POLICY "Public can view active layouts"
    ON storefront_layouts FOR SELECT
    USING (is_active = true);

-- =============================================================================
-- CHAT SESSIONS POLICIES
-- =============================================================================

-- Owner can manage their chat sessions
CREATE POLICY "Owner can manage chat sessions"
    ON chat_sessions FOR ALL
    USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- =============================================================================
-- CHAT MESSAGES POLICIES
-- =============================================================================

-- Owner can manage messages in their sessions
CREATE POLICY "Owner can manage chat messages"
    ON chat_messages FOR ALL
    USING (session_id IN (
        SELECT cs.id FROM chat_sessions cs
        JOIN shops s ON cs.shop_id = s.id
        WHERE s.owner_id = auth.uid()
    ))
    WITH CHECK (session_id IN (
        SELECT cs.id FROM chat_sessions cs
        JOIN shops s ON cs.shop_id = s.id
        WHERE s.owner_id = auth.uid()
    ));
