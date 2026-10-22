begin;
create schema if not exists payments;
revoke all on schema payments from public, anon, authenticated;
create table if not exists payments.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  idempotency_key uuid not null,
  request_hash text not null,
  customer jsonb not null,
  quote jsonb not null,
  currency text not null default 'BDT' check (currency = 'BDT'),
  subtotal bigint not null check (subtotal > 0),
  delivery bigint not null check (delivery in (8000,12000)),
  total bigint not null check (total = subtotal + delivery),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  payment_status text not null default 'due_on_delivery' check (payment_status in ('due_on_delivery','collected','cancelled')),
  status text not null default 'placed' check (status in ('placed','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(),
  unique(user_id, idempotency_key)
);
alter table payments.orders enable row level security;
revoke all on payments.orders from public, anon, authenticated;
create index if not exists orders_user_created on payments.orders(user_id, created_at desc);
commit;
