import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { database, paymentResponse } from "@/lib/payments/server";
import { orderChange, orderStatuses, type OrderStatus, type PaymentStatus } from "@/lib/payments/order-management";
import type { CheckoutQuote } from "@/lib/payments/quote";

export const dynamic = "force-dynamic";
const filters = z.object({ q: z.string().max(160).default(""), status: z.enum(["", ...orderStatuses]).default(""), payment: z.enum(["", "due_on_delivery", "collected", "cancelled"]).default(""), page: z.coerce.number().int().min(1).max(100000).default(1) });
export async function GET(request: Request) {
  const access = await adminClient();
  if (access.denied) return access.denied;
  const parsed = filters.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return paymentResponse({ error: "Invalid order filters." }, 400);
  const { q, status, payment, page } = parsed.data;
  const where = "where ($1 = '' or id::text ilike $1 or customer->>'name' ilike $1 or customer->>'phone' ilike $1) and ($2 = '' or status = $2) and ($3 = '' or payment_status = $3)";
  const values = [q ? `%${q}%` : "", status, payment];
  try {
    const pool = database();
    const [orders, count, stats] = await Promise.all([
      pool.query(`select id, customer, quote, total, status, payment_status, created_at from payments.orders ${where} order by created_at desc, id desc limit 20 offset $4`, [...values, (page - 1) * 20]),
      pool.query(`select count(*)::int as total from payments.orders ${where}`, values),
      pool.query("select count(*)::int as total, count(*) filter (where status in ('placed','confirmed','shipped'))::int as active, count(*) filter (where status = 'delivered')::int as delivered, coalesce(sum(total) filter (where payment_status = 'collected'),0)::text as collected from payments.orders"),
    ]);
    return paymentResponse({ orders: orders.rows, total: count.rows[0].total, stats: stats.rows[0], page });
  } catch { return paymentResponse({ error: "Order storage is unavailable. Configure DATABASE_URL and apply supabase/payment-foundation.sql before managing orders." }, 503); }
}

const changeInput = z.object({ id: z.uuid(), expectedStatus: z.enum(orderStatuses), expectedPaymentStatus: z.enum(["due_on_delivery", "collected", "cancelled"]), status: z.enum(orderStatuses), collectPayment: z.boolean().default(false) }).strict();
export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return paymentResponse({ error: "Invalid request origin." }, 403);
  const access = await adminClient();
  if (access.denied) return access.denied;
  const parsed = changeInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return paymentResponse({ error: "Invalid order update." }, 400);
  let client;
  try {
    client = await database().connect();
    await client.query("begin");
    await client.query("set local statement_timeout = '10s'");
    const { id, expectedStatus, expectedPaymentStatus, status, collectPayment } = parsed.data;
    const result = await client.query<{ status: OrderStatus; payment_status: PaymentStatus; quote: CheckoutQuote }>("select status, payment_status, quote from payments.orders where id = $1 for update", [id]);
    const order = result.rows[0];
    if (!order) { await client.query("rollback"); return paymentResponse({ error: "Order not found." }, 404); }
    if (order.status !== expectedStatus || order.payment_status !== expectedPaymentStatus) { await client.query("rollback"); return paymentResponse({ error: "This order changed. Refresh the order list before saving." }, 409); }
    let change;
    try { change = orderChange(order, status, collectPayment); }
    catch (error) { await client.query("rollback"); return paymentResponse({ error: error instanceof Error ? error.message : "Invalid status change." }, 409); }
    if (change.restock && order.quote.inventoryReserved !== false) {
      for (const item of [...order.quote.items].sort((a, b) => a.productId.localeCompare(b.productId))) {
        const stock = await client.query("update public.products set stock = stock + $1 where id = $2 and stock is not null", [item.quantity, item.productId]);
        if (stock.rowCount !== 1) throw new Error("Cannot restore product stock");
      }
    }
    const updated = await client.query("update payments.orders set status = $1, payment_status = $2 where id = $3 returning id, customer, quote, total, status, payment_status, created_at", [change.status, change.payment_status, id]);
    await client.query("commit");
    return paymentResponse({ order: updated.rows[0] });
  } catch {
    if (client) await client.query("rollback").catch(() => {});
    return paymentResponse({ error: "Order could not be saved. Check the order database, then retry." }, 503);
  } finally { client?.release(); }
}
