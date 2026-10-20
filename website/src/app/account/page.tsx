import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOut from "./sign-out";

export const dynamic = "force-dynamic";
export default async function Account() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/signin");
  const { data: membership } = await client.from("store_admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  const phone = data.user.user_metadata.phone_number;
  return <main style={{ maxWidth: 620, margin: "80px auto", padding: 28, lineHeight: 2 }}><Link href="/">← Back to the collection</Link><h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, marginTop: 24 }}>Your Authéra account</h1><p>Signed in as {data.user.email}</p>{typeof phone === "string" && phone && <p>Contact number: {phone}</p>}{membership && <p><Link href="/admin">Open catalog manager →</Link></p>}<SignOut /></main>;
}
