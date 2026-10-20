import { getCatalog } from "@/lib/catalog/server";

export async function GET() {
  const catalog = await getCatalog();
  return Response.json(catalog, { status: catalog.source === "supabase" ? 200 : 503,
    headers: { "Cache-Control": "no-store" } });
}
