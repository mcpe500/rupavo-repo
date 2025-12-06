-- Add admin policies untuk principal dashboard

-- Create a function to check if user is admin
-- Admin users are those with @rupavo.com email or in admin_users table
create or replace function public.is_admin()
returns boolean as $$
declare
  user_email text;
begin
  select email into user_email from auth.users where id = auth.uid();
  return user_email = 'admin@rupavo.com';
end;
$$ language plpgsql security definer;

-- Update Shops policies to allow admin view all
drop policy if exists "Admin can view all shops" on public.shops;
create policy "Admin can view all shops"
  on public.shops for select
  using ( public.is_admin() = true );

-- Update Shops policies to allow admin modify all
drop policy if exists "Admin can manage all shops" on public.shops;
create policy "Admin can manage all shops"
  on public.shops for all
  using ( public.is_admin() = true )
  with check ( public.is_admin() = true );

-- Update Products policies to allow admin view all
drop policy if exists "Admin can view all products" on public.products;
create policy "Admin can view all products"
  on public.products for select
  using ( public.is_admin() = true );

-- Update Products policies to allow admin manage all
drop policy if exists "Admin can manage all products" on public.products;
create policy "Admin can manage all products"
  on public.products for all
  using ( public.is_admin() = true )
  with check ( public.is_admin() = true );

-- Update Orders policies to allow admin view all
drop policy if exists "Admin can view all orders" on public.orders;
create policy "Admin can view all orders"
  on public.orders for select
  using ( public.is_admin() = true );

-- Update Orders policies to allow admin manage all
drop policy if exists "Admin can manage all orders" on public.orders;
create policy "Admin can manage all orders"
  on public.orders for all
  using ( public.is_admin() = true )
  with check ( public.is_admin() = true );

-- Update Order Items policies to allow admin view all
drop policy if exists "Admin can view all order items" on public.order_items;
create policy "Admin can view all order items"
  on public.order_items for select
  using ( public.is_admin() = true );

-- Update AI Reports policies to allow admin view all
drop policy if exists "Admin can view all reports" on public.ai_reports;
create policy "Admin can view all reports"
  on public.ai_reports for select
  using ( public.is_admin() = true );

-- Update AI Conversations policies to allow admin view all
drop policy if exists "Admin can view all conversations" on public.ai_conversations;
create policy "Admin can view all conversations"
  on public.ai_conversations for select
  using ( public.is_admin() = true );
