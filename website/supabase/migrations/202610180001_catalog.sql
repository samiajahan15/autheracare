begin;
create table public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.store_admins enable row level security;
revoke all on public.store_admins from anon, authenticated;
grant select on public.store_admins to authenticated;
create policy "Read own admin membership" on public.store_admins for select to authenticated using (user_id = (select auth.uid()));

create function public.is_store_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$ select exists(select 1 from public.store_admins where user_id = (select auth.uid())); $$;
revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;
grant select on public.store_admins to anon;

create table public.brands (
  name text primary key check (length(name) between 1 and 100),
  position integer not null default 0
);
create table public.products (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  brand text not null references public.brands(name),
  name text not null check (length(name) between 1 and 200),
  category text not null check (category in ('Face care','Body care','Hair care','Lip care','Accessories','Sets','Perfume','Wellness','Oral care')),
  image text,
  edited_image boolean not null default false,
  size text,
  price numeric(12,2) check (price >= 0),
  currency text not null default 'BDT' check (currency = 'BDT'),
  stock integer check (stock >= 0),
  description text,
  active boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);
create index products_catalog_order on public.products(active, position, id);
create index products_brand on public.products(brand);
create function public.touch_product() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger product_updated before update on public.products for each row execute function public.touch_product();
alter table public.brands enable row level security;
alter table public.products enable row level security;
revoke all on public.brands, public.products from anon, authenticated;
grant select on public.brands, public.products to anon, authenticated;
grant insert, update, delete on public.brands, public.products to authenticated;
create policy "Read brands" on public.brands for select to anon, authenticated using (true);
create policy "Admins manage brands" on public.brands for all to authenticated using ((select public.is_store_admin())) with check ((select public.is_store_admin()));
create policy "Read published products" on public.products for select to anon, authenticated using (active or (select public.is_store_admin()));
create policy "Admins manage products" on public.products for all to authenticated using ((select public.is_store_admin())) with check ((select public.is_store_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "Admins upload product images" on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and (select public.is_store_admin()));
create policy "Admins update product images" on storage.objects for update to authenticated
using (bucket_id = 'product-images' and (select public.is_store_admin()))
with check (bucket_id = 'product-images' and (select public.is_store_admin()));
create policy "Admins delete product images" on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and (select public.is_store_admin()));
create policy "Admins list product images" on storage.objects for select to authenticated
using (bucket_id = 'product-images' and (select public.is_store_admin()));
commit;
