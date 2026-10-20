import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const access = await adminClient();
  if (access.denied) return access.denied;
  let input;
  try { input = z.object({ name: z.string().trim().min(1).max(100) }).strict().safeParse(await request.json()); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!input.success) return Response.json({ error: "Enter a brand name between 1 and 100 characters." }, { status: 400 });
  const { data, error } = await access.client!.from("brands").insert(input.data).select("name").single();
  if (error) return Response.json({ error: error.code === "23505" ? "That brand already exists." : "Could not add brand." }, { status: 400 });
  return Response.json({ brand: data }, { headers: { "Cache-Control": "private, no-store" } });
}
