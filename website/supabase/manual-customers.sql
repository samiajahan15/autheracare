begin;
create table if not exists payments.manual_customers (
  phone_key text primary key check (phone_key ~ '^01[3-9][0-9]{8}$'),
  customer jsonb not null,
  created_at timestamptz not null default now()
);
alter table payments.manual_customers enable row level security;
revoke all on payments.manual_customers from public, anon, authenticated;
commit;
