import "server-only";
import { createHash } from "node:crypto";
import { Pool } from "pg";
import { createClient as createTokenClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { buildQuote, CheckoutError, type CheckoutProduct } from "./quote";
import type { OrderInput } from "./validation";

const databaseState = globalThis as typeof globalThis & { paymentPool?: Pool };

export function database() {
  if (!process.env.DATABASE_URL) throw new CheckoutError("Ordering is not available yet. Please contact Authéra to place your order.", 503);
  databaseState.paymentPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 8000, idleTimeoutMillis: 10000 });
  return databaseState.paymentPool;
}

export async function checkoutUser(request: Request) {
  const signInMessage = request.method === "GET" ? "Please sign in to view your orders." : "Please sign in to place an order.";
  const authorization = request.headers.get("authorization");
  if (authorization) {
    if (!/^Bearer \S+$/i.test(authorization)) throw new CheckoutError("Invalid access token.", 401);
    const { url, key } = getSupabaseConfig();
    const client = createTokenClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(authorization.slice(7));
    if (error || !data.user) throw new CheckoutError(signInMessage, 401);
    return data.user;
  }
  if (request.method === "POST" && request.headers.get("origin") !== new URL(request.url).origin) throw new CheckoutError("Invalid request origin.", 403);
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new CheckoutError(signInMessage, 401);
  return data.user;
}

export function paymentResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function paymentError(error: unknown) {
  if (error instanceof CheckoutError) return paymentResponse({ error: error.message }, error.status);
  console.error("Checkout operation failed", error instanceof Error ? error.name : "Unknown error");
  return paymentResponse({ error: "Checkout is temporarily unavailable. Please try again later." }, 503);
}

export async function placeCodOrder(userId: string, input: OrderInput, idempotencyKey: string) {
  const fingerprint = createHash("sha256").update(JSON.stringify({ ...input, items: [...input.items].sort((first, second) => first.productId.localeCompare(second.productId)) })).digest("hex");
  const client = await database().connect();
  try {
    await client.query("begin");
    await client.query("set local statement_timeout = '10s'");
    await client.query("select pg_advisory_xact_lock(hashtextextended($1, 0))", [`${userId}:${idempotencyKey}`]);
    const existing = await client.query("select id, request_hash, quote, status, payment_status, created_at from payments.orders where user_id = $1 and idempotency_key = $2", [userId, idempotencyKey]);
    if (existing.rows[0]) {
      if (existing.rows[0].request_hash !== fingerprint) throw new CheckoutError("This request key was already used for a different order.");
      await client.query("commit");
      const { request_hash: omitted, ...order } = existing.rows[0];
      void omitted;
      return { order, replayed: true };
    }
    const products = await client.query<CheckoutProduct>("select id, name, brand, price, stock, active from public.products where id = any($1::text[]) order by id for update", [input.items.map(item => item.productId)]);
    const quote = buildQuote(input, products.rows);
    if (quote.total !== input.expectedTotal) throw new CheckoutError("Prices changed. Refresh checkout to review the updated total before ordering.");
    const inserted = await client.query("insert into payments.orders(user_id, idempotency_key, request_hash, customer, quote, subtotal, delivery, total) values ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8) returning id, quote, status, payment_status, created_at", [userId, idempotencyKey, fingerprint, JSON.stringify(input.customer), JSON.stringify(quote), quote.subtotal, quote.delivery, quote.total]);
    await client.query("commit");
    return { order: inserted.rows[0], replayed: false };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally { client.release(); }
}

export async function getCustomerOrder(userId: string, orderId: string) {
  const result = await database().query("select id, quote, status, payment_status, created_at from payments.orders where id = $1 and user_id = $2", [orderId, userId]);
  if (!result.rows[0]) throw new CheckoutError("Order not found.", 404);
  return result.rows[0];
}

export async function listCustomerOrders(userId: string, page = 1, pageSize = 20) {
  const pool = database();
  const [orders, count] = await Promise.all([
    pool.query("select id, quote, total, status, payment_status, created_at from payments.orders where user_id = $1 order by created_at desc, id desc limit $2 offset $3", [userId, pageSize, (page - 1) * pageSize]),
    pool.query("select count(*)::int as total from payments.orders where user_id = $1", [userId]),
  ]);
  return { orders: orders.rows, total: count.rows[0].total, page, pageSize };
}

export async function listRecentOrders() {
  const access = await createClient();
  const { data: identity, error: identityError } = await access.auth.getUser();
  if (identityError || !identity.user) throw new CheckoutError("Admin access required.", 403);
  const { data: membership, error } = await access.from("store_admins").select("user_id").eq("user_id", identity.user.id).maybeSingle();
  if (error || !membership) throw new CheckoutError("Admin access required.", 403);
  const result = await database().query("select id, customer, quote, total, status, payment_status, created_at from payments.orders order by created_at desc limit 100");
  return result.rows;
}
