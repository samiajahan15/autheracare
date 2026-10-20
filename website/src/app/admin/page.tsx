import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "./dashboard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Store administration | Authéra" };
export default async function AdminPage() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/signin");
  const { data: admin } = await client.from("store_admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) redirect("/account");
  return <Dashboard email={data.user.email ?? "Administrator"} />;
}
