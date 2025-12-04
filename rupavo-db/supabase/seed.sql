-- =============================================================================
-- Rupavo Database Seed Data
-- Demo data for development and testing
-- =============================================================================

-- Note: This seed file assumes you have created a test user in Supabase Auth
-- Replace 'YOUR_TEST_USER_UUID' with the actual user ID from auth.users

-- For local development, you can create a user via Supabase Studio
-- or use the auth API, then update this UUID

-- =============================================================================
-- Demo Shop
-- =============================================================================
INSERT INTO shops (id, owner_id, name, slug, description, business_type, phone, email, address)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user UUID
    'Warung Kopi Mantap',
    'warung-kopi-mantap',
    'Warung kopi legendaris dengan racikan kopi pilihan dari berbagai daerah di Indonesia. Buka sejak 2020.',
    'food',
    '081234567890',
    'warungkopimantap@email.com',
    'Jl. Raya Sejahtera No. 123, Jakarta Selatan'
);

-- =============================================================================
-- Product Categories
-- =============================================================================
INSERT INTO product_categories (id, shop_id, name, description, sort_order)
VALUES 
    ('c1c1c1c1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kopi', 'Aneka minuman kopi', 1),
    ('c2c2c2c2-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Non-Kopi', 'Minuman selain kopi', 2),
    ('c3c3c3c3-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Makanan', 'Snack dan makanan ringan', 3);

-- =============================================================================
-- Products
-- =============================================================================
INSERT INTO products (id, shop_id, category_id, name, slug, description, tagline, price, stock, is_available, sort_order)
VALUES 
    -- Kopi
    ('p1p1p1p1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1c1c1c1-1111-1111-1111-111111111111',
     'Es Kopi Susu Gula Aren', 'es-kopi-susu-gula-aren',
     'Perpaduan sempurna espresso robusta pilihan dengan susu creamy dan manisnya gula aren asli. Disajikan dingin dengan es batu.',
     'Manisnya hari dimulai dari sini ☕',
     18000, 100, true, 1),
    
    ('p2p2p2p2-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1c1c1c1-1111-1111-1111-111111111111',
     'Americano', 'americano',
     'Espresso shot yang dipadukan dengan air panas. Rasa kopi yang bold dan authentic untuk pecinta kopi sejati.',
     'Bold & Beautiful',
     15000, 100, true, 2),
    
    ('p3p3p3p3-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1c1c1c1-1111-1111-1111-111111111111',
     'Cappuccino', 'cappuccino',
     'Espresso dengan steamed milk dan foam lembut. Perpaduan klasik yang selalu nikmat.',
     'Classic never dies',
     20000, 100, true, 3),
    
    -- Non-Kopi
    ('p4p4p4p4-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c2c2c2c2-2222-2222-2222-222222222222',
     'Matcha Latte', 'matcha-latte',
     'Matcha premium grade dari Jepang dengan susu creamy. Bisa disajikan panas atau dingin.',
     'Green goodness in a cup 🍵',
     22000, 50, true, 1),
    
    ('p5p5p5p5-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c2c2c2c2-2222-2222-2222-222222222222',
     'Cokelat Panas', 'cokelat-panas',
     'Cokelat Belgia premium yang dilelehkan sempurna dengan susu hangat. Creamy dan rich.',
     'Warm hug in a mug',
     18000, 50, true, 2),
    
    -- Makanan
    ('p6p6p6p6-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3c3c3c3-3333-3333-3333-333333333333',
     'Roti Bakar Cokelat Keju', 'roti-bakar-cokelat-keju',
     'Roti tawar premium yang dipanggang crispy dengan topping cokelat dan keju melted.',
     'Duo legendaris yang tak pernah salah',
     15000, 30, true, 1),
    
    ('p7p7p7p7-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3c3c3c3-3333-3333-3333-333333333333',
     'Pisang Goreng Crispy', 'pisang-goreng-crispy',
     'Pisang raja pilihan dengan balutan tepung crispy. Disajikan hangat dengan topping gula halus.',
     'Crispy outside, soft inside',
     12000, 20, true, 2);

-- =============================================================================
-- Demo Orders
-- =============================================================================
INSERT INTO orders (id, shop_id, customer_name, customer_phone, status, subtotal, total, notes, created_at)
VALUES 
    ('o1o1o1o1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'Budi Santoso', '081111111111', 'completed', 51000, 51000, 'Tolong tidak pakai gula', NOW() - INTERVAL '2 days'),
    
    ('o2o2o2o2-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'Siti Rahayu', '082222222222', 'completed', 40000, 40000, NULL, NOW() - INTERVAL '1 day'),
    
    ('o3o3o3o3-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'Ahmad Pratama', '083333333333', 'processing', 33000, 33000, 'Takeaway', NOW());

-- =============================================================================
-- Demo Order Items
-- =============================================================================
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES 
    -- Order 1
    ('o1o1o1o1-1111-1111-1111-111111111111', 'p1p1p1p1-1111-1111-1111-111111111111', 'Es Kopi Susu Gula Aren', 2, 18000, 36000),
    ('o1o1o1o1-1111-1111-1111-111111111111', 'p6p6p6p6-6666-6666-6666-666666666666', 'Roti Bakar Cokelat Keju', 1, 15000, 15000),
    
    -- Order 2
    ('o2o2o2o2-2222-2222-2222-222222222222', 'p4p4p4p4-4444-4444-4444-444444444444', 'Matcha Latte', 1, 22000, 22000),
    ('o2o2o2o2-2222-2222-2222-222222222222', 'p1p1p1p1-1111-1111-1111-111111111111', 'Es Kopi Susu Gula Aren', 1, 18000, 18000),
    
    -- Order 3
    ('o3o3o3o3-3333-3333-3333-333333333333', 'p2p2p2p2-2222-2222-2222-222222222222', 'Americano', 1, 15000, 15000),
    ('o3o3o3o3-3333-3333-3333-333333333333', 'p1p1p1p1-1111-1111-1111-111111111111', 'Es Kopi Susu Gula Aren', 1, 18000, 18000);

-- =============================================================================
-- Demo Storefront Layout
-- =============================================================================
INSERT INTO storefront_layouts (shop_id, is_active, layout_json, style_preferences)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    true,
    '{
        "theme": "warm-coffee",
        "sections": [
            {"type": "hero", "title": "Warung Kopi Mantap", "subtitle": "Kopi pilihan untuk hari yang lebih baik"},
            {"type": "featured", "title": "Menu Favorit", "productIds": ["p1p1p1p1-1111-1111-1111-111111111111", "p4p4p4p4-4444-4444-4444-444444444444"]},
            {"type": "categories", "title": "Kategori Menu"},
            {"type": "all-products", "title": "Semua Menu"}
        ],
        "colors": {
            "primary": "#136F63",
            "secondary": "#FF7A3C"
        }
    }'::JSONB,
    '{
        "style": "modern-warm",
        "font": "Poppins"
    }'::JSONB
);
