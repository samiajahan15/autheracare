begin;
alter table payments.manual_customers add column if not exists phone_aliases text[] not null default '{}';
alter table payments.manual_customers add column if not exists edited_at timestamptz;
create index if not exists manual_customers_phone_aliases on payments.manual_customers using gin(phone_aliases);
commit;
