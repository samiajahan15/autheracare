begin;
alter table payments.manual_customers add column if not exists deleted_at timestamptz;
commit;
