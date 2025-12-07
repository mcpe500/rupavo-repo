alter table if exists orders
  add column if not exists additional_data text default '{}'::text;
