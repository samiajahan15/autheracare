# Shared checkout and Cash on Delivery

The website and a future Android app use the same `/api/payments` endpoints.
COD is the only implemented method. No card data is collected and no online
gateway is connected. Amounts returned by the API are integer poisha (100 = ৳1).
Delivery costs ৳80 inside Dhaka and ৳120 outside Dhaka, per order.

## Activate

1. Apply `payment-foundation.sql` in this project's Supabase SQL editor. It
   creates a private `payments.orders` table, enables RLS and revokes public
   Data API access. This setup SQL has not been applied automatically.
2. Set the existing server-only `DATABASE_URL` to this project's PostgreSQL
   connection string, using a Supabase pooler connection for Vercel. Keep TLS
   certificate verification enabled. Never use a `NEXT_PUBLIC_` prefix.
3. Set `COD_ENABLED=true` in the server environment and redeploy/restart.
4. Publish positive prices and explicit stock counts for sellable products.
   Missing prices or unknown stock block ordering; catalog preview data is
   never accepted as a source of checkout prices.
5. Sign in with a test account and place a test COD order. Verify the order
   in `/admin/orders`, the stock decrement and the unchanged payment status
   `due_on_delivery`. Repeat the identical request key to verify one order.

Neither database setup nor a live database integration test could be run in
this workspace because `DATABASE_URL` is empty. Local unit tests cover quote
calculations and input validation. Test transactions against a staging
database before enabling production orders.

## API

- `GET /api/payments`: available methods, currency and delivery fees.
- `POST /api/payments/quote`: `{ "items": [{ "productId": "product-id", "quantity": 1 }], "region": "dhaka" }`.
  The alternative region is `outside-dhaka`. Returns `{ quote }` using live prices.
- `POST /api/payments/orders`: quote input plus `paymentMethod: "cod"`,
  `expectedTotal` in poisha and `customer: { name, phone, city, address }`.
  Requires `Idempotency-Key`, a client-generated UUID retained for retries of
  the same order. Returns `{ order, replayed }`. A changed request using the
  same key is rejected. Price changes require reviewing a new quote.
- `GET /api/payments/orders/:id`: authenticated owner can retrieve their order.

The website uses its authenticated session and same-origin requests. Android
sends `Authorization: Bearer <Supabase access token>`; this token is verified
with Supabase Auth. User identity is never accepted from the request body.
Native Android networking does not require browser CORS configuration.

Orders, stock deductions and idempotency checks run in a database transaction.
Products are locked in ID order. Order snapshots retain prices, product names,
quantities and delivery charges; prices and shipping totals supplied by clients
are not used for charging. Customer information stays in the private schema.
Customers cannot mark orders paid or read another customer's order. Admins
can view recent orders at `/admin/orders` after an explicit membership check.

## Operations and later payment providers

COD orders start as `placed` and `due_on_delivery`. Collection, cancellation,
refunds and automatic courier integration are not implemented yet. A trusted
operator must handle fulfillment and restore inventory if cancelling an order.
Do not mark payment collected until the courier confirms collection. Apply
appropriate retention and access controls to delivery addresses and phone data.

Future online providers should create their own payment attempts linked to
these orders and verify provider callbacks on the server before marking paid.
Do not treat a browser redirect as evidence of payment. A provider choice,
merchant credentials, callback validation and staging tests are still needed.
