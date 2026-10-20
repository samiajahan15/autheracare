import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AfterLogin() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/signin");

  const { data: membership } = await client.from("store_admins")
    .select("user_id").eq("user_id", data.user.id).maybeSingle();

  redirect(membership ? "/admin" : "/account");
}
