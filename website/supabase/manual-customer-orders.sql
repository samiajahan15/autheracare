begin;
create table if not exists payments.manual_customer_orders (
  id uuid primary key default gen_random_uuid(),
  phone_key text not null references payments.manual_customers(phone_key),
  customer jsonb not null,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  created_at timestamptz not null default now()
);
alter table payments.manual_customer_orders enable row level security;
revoke all on payments.manual_customer_orders from public, anon, authenticated;
create index if not exists manual_customer_orders_phone_created on payments.manual_customer_orders(phone_key, created_at desc);
commit;
