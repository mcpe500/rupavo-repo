-- Optional: ensure gen_random_uuid() is available
create extension if not exists "pgcrypto";

-----------------------------
-- 1) PROFILES
-----------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trigger function for updated_at (standard Supabase pattern if not exists)
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_current_timestamp_updated_at();


-----------------------------
-- 2) SHOPS
-----------------------------
create table if not exists public.shops (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  slug            text not null unique,
  tagline         text,
  description     text,
  -- style/profile info for AI (vibe, target audience, etc)
  style_profile   jsonb,
  storefront_published boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_shops_owner_id on public.shops(owner_id);
create index if not exists idx_shops_slug on public.shops(slug);

create trigger shops_set_updated_at
before update on public.shops
for each row
execute procedure public.set_current_timestamp_updated_at();


-----------------------------
-- 3) PRODUCTS
-----------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  name            text not null,
  slug            text,
  description     text,
  price           numeric(12,2) not null,
  cost_price      numeric(12,2),
  image_url       text,
  is_active       boolean default true,
  sort_order      integer default 0,
  ai_metadata     jsonb,  -- e.g. original AI suggestion, tags, etc
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_products_shop_id on public.products(shop_id);
create index if not exists idx_products_active on public.products(shop_id, is_active);

create trigger products_set_updated_at
before update on public.products
for each row
execute procedure public.set_current_timestamp_updated_at();


-----------------------------
-- 4) ORDERS
-----------------------------
-- Minimalistic order table focused on analytics & simple checkout
create type public.order_source as enum ('manual', 'storefront');
create type public.order_status as enum ('draft', 'completed', 'cancelled');

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  source          public.order_source not null default 'manual',
  status          public.order_status not null default 'completed',
  total_amount    numeric(12,2) not null,
  currency        text not null default 'IDR',
  buyer_name      text,
  buyer_contact   text,
  note            text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_orders_shop_id on public.orders(shop_id);
create index if not exists idx_orders_shop_id_created_at on public.orders(shop_id, created_at);

create trigger orders_set_updated_at
before update on public.orders
for each row
execute procedure public.set_current_timestamp_updated_at();


-----------------------------
-- 5) ORDER ITEMS
-----------------------------
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(12,2) not null,
  subtotal        numeric(12,2) generated always as (quantity * unit_price) stored
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);


-----------------------------
-- 6) AI REPORTS
-----------------------------
create type public.report_granularity as enum ('daily', 'weekly', 'monthly', 'custom');

create table if not exists public.ai_reports (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  period_start    date not null,
  period_end      date not null,
  granularity     public.report_granularity not null default 'custom',
  metrics         jsonb not null,  -- aggregated numbers: totals, best_sellers, etc
  narrative       text not null,   -- AI-written explanation & action plan
  created_at      timestamptz default now()
);

create index if not exists idx_ai_reports_shop_id on public.ai_reports(shop_id);
create index if not exists idx_ai_reports_period on public.ai_reports(shop_id, period_start, period_end);


-----------------------------
-- 7) STOREFRONT LAYOUTS (AI GENERATED)
-----------------------------
create table if not exists public.storefront_layouts (
  shop_id         uuid primary key references public.shops(id) on delete cascade,
  layout          jsonb not null,   -- schema for sections, hero, grids, etc
  meta            jsonb,            -- e.g. which model, temperature, prompt version
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger storefront_layouts_set_updated_at
before update on public.storefront_layouts
for each row
execute procedure public.set_current_timestamp_updated_at();


-----------------------------
-- 8) AI CONVERSATIONS (CHAT DENGAN RUPAVO)
-----------------------------
create type public.ai_role as enum ('user', 'assistant', 'system');

create table if not exists public.ai_conversations (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops(id) on delete cascade,
  thread_id       uuid not null default gen_random_uuid(), -- bisa dipakai untuk grouping percakapan
  role            public.ai_role not null,
  content         text not null,
  created_at      timestamptz default now()
);

create index if not exists idx_ai_conversations_shop_id on public.ai_conversations(shop_id);
create index if not exists idx_ai_conversations_thread on public.ai_conversations(thread_id, created_at);


--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.ai_reports enable row level security;
alter table public.storefront_layouts enable row level security;
alter table public.ai_conversations enable row level security;

-- Policies

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Shops
create policy "Owner can manage own shops"
  on public.shops for all
  using ( owner_id = auth.uid() )
  with check ( owner_id = auth.uid() );

create policy "Public can view published shops"
  on public.shops for select
  using ( storefront_published = true );

-- Products
create policy "Owner can manage own products"
  on public.products for all
  using ( shop_id in (select id from public.shops where owner_id = auth.uid()) )
  with check ( shop_id in (select id from public.shops where owner_id = auth.uid()) );

create policy "Public can view active products of published shops"
  on public.products for select
  using ( is_active = true and shop_id in (select id from public.shops where storefront_published = true) );

-- Orders
create policy "Owner can manage orders of their shop"
  on public.orders for all
  using ( shop_id in (select id from public.shops where owner_id = auth.uid()) )
  with check ( shop_id in (select id from public.shops where owner_id = auth.uid()) );

-- Order Items
create policy "Owner can manage order items of their shop"
  on public.order_items for all
  using ( order_id in (select id from public.orders where shop_id in (select id from public.shops where owner_id = auth.uid())) )
  with check ( order_id in (select id from public.orders where shop_id in (select id from public.shops where owner_id = auth.uid())) );

-- AI Reports
create policy "Owner can view their shop reports"
  on public.ai_reports for select
  using ( shop_id in (select id from public.shops where owner_id = auth.uid()) );

-- Storefront Layouts
create policy "Owner can manage their shop layout"
  on public.storefront_layouts for all
  using ( shop_id in (select id from public.shops where owner_id = auth.uid()) )
  with check ( shop_id in (select id from public.shops where owner_id = auth.uid()) );

create policy "Public can view layout of published shops"
  on public.storefront_layouts for select
  using ( shop_id in (select id from public.shops where storefront_published = true) );

-- AI Conversations
create policy "Owner can manage their chat logs"
  on public.ai_conversations for all
  using ( shop_id in (select id from public.shops where owner_id = auth.uid()) )
  with check ( shop_id in (select id from public.shops where owner_id = auth.uid()) );
