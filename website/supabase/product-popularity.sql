begin;
create schema if not exists product_analytics;
revoke all on schema product_analytics from public, anon, authenticated;
create table if not exists product_analytics.clicks (
  product_id text not null references public.products(id) on delete cascade,
  visitor_id uuid not null,
  clicked_on date not null default current_date,
  primary key (product_id, visitor_id, clicked_on)
);
alter table product_analytics.clicks enable row level security;
revoke all on product_analytics.clicks from public, anon, authenticated;
create index if not exists product_clicks_date_idx on product_analytics.clicks(clicked_on);
commit;
