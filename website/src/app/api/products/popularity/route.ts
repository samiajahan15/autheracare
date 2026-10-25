import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { popularityDatabase } from "@/lib/catalog/popularity-server";

export async function GET() {
  try {
    const { rows } = await popularityDatabase().query<{ product_id: string; clicks: number }>(`
      select c.product_id, count(*)::integer as clicks
      from product_analytics.clicks c join public.products p on p.id = c.product_id
      where c.clicked_on >= current_date - 29 and p.active = true
      group by c.product_id order by clicks desc, c.product_id limit 1000`);
    return Response.json({ counts: Object.fromEntries(rows.map(row => [row.product_id, row.clicks])) }, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch {
    return Response.json({ counts: {} }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new Response(null, { status: 403 });
  let productId: unknown;
  try { ({ productId } = await request.json()); } catch { return new Response(null, { status: 400 }); }
  if (typeof productId !== "string" || !/^[a-zA-Z0-9_-]{1,160}$/.test(productId)) return new Response(null, { status: 400 });
  const previous = request.cookies.get("authera_visitor")?.value;
  const visitor = previous && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(previous) ? previous : randomUUID();
  try {
    // One click per browser/product/day; repeated clicks cannot inflate the ranking.
    await popularityDatabase().query(`insert into product_analytics.clicks (product_id, visitor_id)
      select id, $2::uuid from public.products where id = $1 and active = true
      on conflict do nothing`, [productId, visitor]);
    const response = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    if (visitor !== previous) response.cookies.set("authera_visitor", visitor, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch { return new Response(null, { status: 503 }); }
}
