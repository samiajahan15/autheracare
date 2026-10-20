import "server-only";
import { createClient } from "./server";

export async function adminClient() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { denied: Response.json({ error: "Sign in required" }, { status: 401 }) };
  const { data: membership, error: membershipError } = await client.from("store_admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (membershipError || !membership) return { denied: Response.json({ error: "Admin access required" }, { status: 403 }) };
  return { client };
}
