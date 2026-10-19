create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  customer_phone text not null check (char_length(customer_phone) between 10 and 16),
  address text not null check (char_length(address) between 1 and 400),
  city text not null check (char_length(city) between 1 and 80),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  notes text check (notes is null or char_length(notes) <= 300),
  items jsonb not null,
  subtotal_paise integer not null check (subtotal_paise > 0),
  shipping_paise integer not null default 0 check (shipping_paise >= 0),
  total_paise integer not null check (total_paise = subtotal_paise + shipping_paise),
  currency text not null default 'INR' check (currency = 'INR'),
  payment_status text not null default 'created' check (payment_status in ('created','verification_pending','paid','failed','refunded')),
  fulfilment_status text not null default 'new' check (fulfilment_status in ('new','confirmed','processing','shipped','delivered','cancelled')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  paid_at timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_fulfilment_status_idx on public.orders (fulfilment_status);

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
-- Intentionally no public policies: only trusted server routes using the service-role key may access order records.
-- Never expose SUPABASE_SERVICE_ROLE_KEY in browser code.
