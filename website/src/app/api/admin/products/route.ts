import { adminClient } from "@/lib/supabase/admin";
import { productInput } from "@/lib/catalog/validation";

export async function GET() {
  const access = await adminClient();
  if (access.denied) return access.denied;
  const { data, error } = await access.client!.from("products").select("*").order("position").order("id").limit(1000);
  if (error) return Response.json({ error: "Could not load products" }, { status: 503 });
  const { data: brands, error: brandError } = await access.client!.from("brands").select("name").order("position").order("name");
  if (brandError) return Response.json({ error: "Could not load brands" }, { status: 503 });
  return Response.json({ products: data, brands: brands.map(b => b.name) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  return saveProduct(request, false);
}

export async function PUT(request: Request) {
  return saveProduct(request, true);
}

async function saveProduct(request: Request, creating: boolean) {
  // Cookie-authenticated writes must originate from this application.
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const access = await adminClient();
  if (access.denied) return access.denied;
  let input;
  try { input = productInput.safeParse(await request.json()); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!input.success) return Response.json({ error: "Invalid product", details: input.error.flatten() }, { status: 400 });
  const query = creating ? access.client!.from("products").insert(input.data) : access.client!.from("products").update(input.data).eq("id", input.data.id);
  const { data, error } = await query.select().single();
  if (error?.code === "23505") return Response.json({ error: "That product ID already exists. Choose a different ID." }, { status: 409 });
  if (error) return Response.json({ error: "Could not save product. Check its brand and fields." }, { status: 400 });
  return Response.json({ product: data }, { headers: { "Cache-Control": "private, no-store" } });
}
