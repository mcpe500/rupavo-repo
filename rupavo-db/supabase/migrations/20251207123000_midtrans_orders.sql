create extension if not exists "uuid-ossp";

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  "orderId" text unique,
  amount integer,
  status text,
  "paymentType" text,
  "midtransTransactionId" text,
  "customerName" text,
  "customerEmail" text,
  "customerPhone" text,
  "createdAt" timestamp default now(),
  "paidAt" timestamp
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  "orderId" text,
  name text,
  price integer,
  qty integer
);

create index if not exists order_items_order_id_idx on order_items("orderId");
