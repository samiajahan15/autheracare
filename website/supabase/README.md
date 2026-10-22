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

Cash on Delivery checkout validates server-side prices. Stock quantities are informational and do not block or change during new orders. The preview bag itself does not reserve inventory. Enable ordering only after configuring the order database and confirming catalog prices.

## Order management

Open **Orders** in the admin sidebar or visit `/admin/orders`. This page supports customer name, phone and order ID search, fulfillment/payment filters, 20 orders per page, store-wide totals, and order details with saved product prices and delivery information.

Setup: apply `payment-foundation.sql` to the same project's database and configure the server-only `DATABASE_URL` with that database's Postgres or Supabase pooler connection string. Use the project's connection settings for SSL and credentials. Never put the connection string in a `NEXT_PUBLIC_` variable. Restart the development server after changing environment variables. Keep `COD_ENABLED=false` until checkout is ready; existing orders can still be managed while new ordering is disabled.

Fulfillment follows placed → confirmed → shipped → delivered. Placed and confirmed orders can be cancelled; new orders do not reserve stock, so cancellation leaves inventory unchanged. Legacy orders that reserved stock restore it once in the cancellation transaction. Shipped/delivered orders cannot be cancelled here. COD can be marked collected when delivering an order or afterwards. Collected payments cannot be reset or cancelled through this interface; returns/refunds are outside this workflow.

All order reads and writes require verified admin membership. Orders stay in the private `payments` schema. Updates lock the order row, reject stale status/payment values, and roll back stock changes if any update fails. No extra database migration is required beyond the existing payment foundation.

Checks: `node scripts/order-management.test.mjs`, `node scripts/payments.test.mjs`, and `npm run typecheck`. Live save/cancellation verification requires the configured database and an admin session.
