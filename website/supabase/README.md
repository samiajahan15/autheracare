# Catalog backend

Target project: `qiqamiznqaatmfvlpdhe` (`supabase-rose-marble`). Do not apply these files to the older project.

Apply `migrations/202610180001_catalog.sql` followed by `migrations/202610180002_catalog_seed.sql` through the authorized Supabase integration or SQL Editor. Both use transactions. The schema migration is for first-time installation; do not rerun it after success. The import preserves existing product IDs and never overwrites an existing product. Unknown prices and inventory remain NULL. Each current catalog listing is one product row; combined size labels are preserved without inventing separately priced variants.

Create an admin email/password user in Supabase Authentication → Users. Then use SQL Editor, replacing the placeholder with that user's ID:

```sql
insert into public.store_admins(user_id) values ('ADMIN_AUTH_USER_UUID');
```

Only a trusted database administrator can grant admin membership. App users cannot grant it to themselves. Sign in to `/admin` for the Overview, Products, Inventory, and Brands dashboard. It supports search, brand/status filters, pagination, creating products, editing products, hiding/unhiding listings, adding brands, and image uploads. New products start hidden. Product IDs are unique; creating a duplicate returns 409 rather than overwriting it. Unknown stock and prices remain null, distinct from zero. Existing images remain in the website's public folder.

The public Storage bucket `product-images` permits only approved admins to upload JPG, PNG, or WebP images up to 5 MB. The editor uploads directly with the signed-in Supabase client under Storage RLS. Removing an image from a product unlinks it; it does not delete the Storage file. Administrators can clean up unused files in the Supabase dashboard.

`/api/products` returns source `supabase` and HTTP 200 only when the database read succeeds. A failure returns 503 with the preview catalog. The storefront shows an explicit preview notice on failure; a successfully empty catalog stays empty. `/api/health` remains a process liveness check. Admin API writes require verified login, database admin membership, same-origin requests, valid fields, and database RLS permission.

Validation: `node --experimental-strip-types --test scripts/backend.test.mjs`, `npm run typecheck`, `npm run lint`, `npm run build`.

Checkout and payment processing are not implemented. Inventory is editable but is not reserved by the preview bag. Real order creation must validate server-side prices and reserve stock transactionally before checkout is enabled.
