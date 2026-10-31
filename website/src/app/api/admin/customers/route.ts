import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { database, paymentResponse } from "@/lib/payments/server";
import { orderInput } from "@/lib/payments/validation";

export const dynamic = "force-dynamic";
const filters = z.object({ q: z.string().trim().max(160).default(""), page: z.coerce.number().int().min(1).max(100000).default(1) });

export async function GET(request: Request) {
  const access = await adminClient();
  if (access.denied) return access.denied;
  const parsed = filters.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return paymentResponse({ error: "Invalid customer filters." }, 400);
  const { q, page } = parsed.data;
  try {
    // Checkout accepts local, 880 and +880 Bangladesh numbers. Match all three.
    const result = await database().query(`
      with orders as (
        select o.id, o.customer, o.quote, o.status, o.created_at,
          coalesce(m.phone_key, right(regexp_replace(o.customer->>'phone', '[^0-9]', '', 'g'), 11)) as phone_key
        from payments.orders o left join payments.manual_customers m
          on m.phone_key = right(regexp_replace(o.customer->>'phone', '[^0-9]', '', 'g'), 11)
          or right(regexp_replace(o.customer->>'phone', '[^0-9]', '', 'g'), 11) = any(m.phone_aliases)
        where o.status <> 'cancelled'
        union all
        select id, customer, jsonb_build_object('items', items) as quote,
          'manually recorded' as status, created_at, phone_key from payments.manual_customer_orders
      ), records as (
        select phone_key, customer, created_at, (quote->'items')::text as products, false as edited from orders
        union all
        select phone_key, customer, coalesce(edited_at, created_at), '' as products, edited_at is not null as edited from payments.manual_customers
      ), matched as (
        select phone_key, max(created_at) as last_activity_at from records r
        where not exists (select 1 from payments.manual_customers m where m.phone_key = r.phone_key and m.deleted_at is not null)
        group by phone_key
        having $1 = '' or bool_or(customer->>'name' ilike $1 or customer->>'phone' ilike $1
          or customer->>'address' ilike $1 or customer->>'city' ilike $1 or products ilike $1)
      ), selected as (
        select * from matched order by last_activity_at desc, phone_key limit 20 offset $2
      )
      select (select count(*)::int from matched) as total,
        coalesce((select jsonb_agg(to_jsonb(c) order by c.last_activity_at desc, c.phone_key) from (
          select s.phone_key, s.last_activity_at,
            (select r.customer from records r where r.phone_key = s.phone_key order by r.edited desc, r.created_at desc, r.customer::text limit 1) as customer,
            max(o.created_at) as last_order_at,
            count(o.id)::int as order_count,
            coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'created_at', o.created_at,
              'status', o.status, 'customer', o.customer, 'items', o.quote->'items')
              order by o.created_at desc, o.id desc) filter (where o.id is not null), '[]'::jsonb) as orders
          from selected s left join orders o using (phone_key)
          group by s.phone_key, s.last_activity_at
        ) c), '[]'::jsonb) as customers`, [q ? `%${q}%` : "", (page - 1) * 20]);
    return paymentResponse({ ...result.rows[0], page });
  } catch {
    return paymentResponse({ error: "Customer orders could not be loaded. Check the order database and try again." }, 503);
  }
}

const customerInput = orderInput.shape.customer;

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return paymentResponse({ error: "Invalid request origin." }, 403);
  const access = await adminClient();
  if (access.denied) return access.denied;
  const parsed = customerInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return paymentResponse({ error: parsed.error.issues[0]?.message || "Invalid customer details." }, 400);
  const phoneKey = parsed.data.phone.replace(/\D/g, "").slice(-11);
  const customer = { ...parsed.data, phone: `+88${phoneKey}` };
  let client;
  try {
    client = await database().connect();
    await client.query("begin");
    await client.query("lock table payments.manual_customers in share row exclusive mode");
    const restored = await client.query(`update payments.manual_customers
      set customer = $2::jsonb, deleted_at = null, edited_at = now()
      where deleted_at is not null and (phone_key = $1 or $1 = any(phone_aliases)) returning phone_key`, [phoneKey, JSON.stringify(customer)]);
    if (restored.rowCount) {
      await client.query("commit");
      return paymentResponse({ customer }, 201);
    }
    const result = await client.query(`
      insert into payments.manual_customers (phone_key, customer)
      select $1, $2::jsonb where not exists (
        select 1 from payments.orders where status <> 'cancelled'
          and right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 11) = $1
      ) and not exists (select 1 from payments.manual_customers where $1 = any(phone_aliases))
      on conflict (phone_key) do nothing returning phone_key`, [phoneKey, JSON.stringify(customer)]);
    await client.query("commit");
    if (!result.rowCount) return paymentResponse({ error: "A customer with this phone number already exists. Search for their phone number in the customer list." }, 409);
    return paymentResponse({ customer }, 201);
  } catch {
    if (client) await client.query("rollback").catch(() => {});
    return paymentResponse({ error: "Customer could not be saved. Check the customer database and try again." }, 503);
  } finally { client?.release(); }
}

const editInput = z.object({ phoneKey: z.string().regex(/^01[3-9]\d{8}$/), customer: customerInput }).strict();

export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return paymentResponse({ error: "Invalid request origin." }, 403);
  const access = await adminClient();
  if (access.denied) return access.denied;
  const parsed = editInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return paymentResponse({ error: parsed.error.issues[0]?.message || "Invalid customer details." }, 400);
  const { phoneKey } = parsed.data;
  const newPhoneKey = parsed.data.customer.phone.replace(/\D/g, "").slice(-11);
  const customer = { ...parsed.data.customer, phone: `+88${newPhoneKey}` };
  let client;
  try {
    client = await database().connect();
    await client.query("begin");
    await client.query("lock table payments.manual_customers in share row exclusive mode");
    const existing = await client.query<{ phone_aliases: string[]; deleted_at: string | null }>("select phone_aliases, deleted_at from payments.manual_customers where phone_key = $1", [phoneKey]);
    if (existing.rows[0]?.deleted_at) { await client.query("rollback"); return paymentResponse({ error: "Customer was deleted. Refresh the list." }, 404); }
    if (!existing.rowCount) {
      const order = await client.query("select 1 from payments.orders where status <> 'cancelled' and right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 11) = $1 limit 1", [phoneKey]);
      if (!order.rowCount) { await client.query("rollback"); return paymentResponse({ error: "Customer no longer exists. Refresh the list." }, 404); }
    }
    const aliases = [...new Set([phoneKey, ...(existing.rows[0]?.phone_aliases ?? []), newPhoneKey])];
    const duplicate = await client.query(`
      select 1 from payments.manual_customers where phone_key <> $1 and (phone_key = $2 or $2 = any(phone_aliases))
      union all
      select 1 from payments.orders where status <> 'cancelled'
        and right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 11) = $2
        and not ($2 = any($3::text[])) limit 1`, [phoneKey, newPhoneKey, [phoneKey, ...(existing.rows[0]?.phone_aliases ?? [])]]);
    if (duplicate.rowCount) { await client.query("rollback"); return paymentResponse({ error: "This phone number belongs to another customer. Use a different number." }, 409); }
    await client.query(`insert into payments.manual_customers (phone_key, customer, phone_aliases, edited_at)
      values ($1, $2::jsonb, $3::text[], now()) on conflict (phone_key) do update
      set customer = excluded.customer, phone_aliases = excluded.phone_aliases, edited_at = excluded.edited_at`, [phoneKey, JSON.stringify(customer), aliases]);
    await client.query("commit");
    return paymentResponse({ customer });
  } catch {
    if (client) await client.query("rollback").catch(() => {});
    return paymentResponse({ error: "Customer changes could not be saved. Please try again." }, 503);
  } finally { client?.release(); }
}

const deleteInput = z.object({ phoneKey: z.string().regex(/^01[3-9]\d{8}$/) }).strict();

export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return paymentResponse({ error: "Invalid request origin." }, 403);
  const access = await adminClient();
  if (access.denied) return access.denied;
  const parsed = deleteInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return paymentResponse({ error: "Invalid customer." }, 400);
  let client;
  try {
    client = await database().connect();
    await client.query("begin");
    await client.query("lock table payments.manual_customers in share row exclusive mode");
    const result = await client.query(`insert into payments.manual_customers (phone_key, customer, deleted_at)
      select $1, customer, now() from (
        select customer, 0 as priority, created_at from payments.manual_customers where phone_key = $1
        union all
        select customer, 1 as priority, created_at from payments.orders
          where status <> 'cancelled' and right(regexp_replace(customer->>'phone', '[^0-9]', '', 'g'), 11) = $1
      ) source order by priority, created_at desc limit 1
      on conflict (phone_key) do update set deleted_at = excluded.deleted_at returning phone_key`, [parsed.data.phoneKey]);
    await client.query("commit");
    if (!result.rowCount) return paymentResponse({ error: "Customer not found. Refresh the list." }, 404);
    return paymentResponse({ deleted: true });
  } catch {
    if (client) await client.query("rollback").catch(() => {});
    return paymentResponse({ error: "Customer could not be deleted. Please try again." }, 503);
  } finally { client?.release(); }
}
