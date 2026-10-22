import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomerOrders from "@/components/customer-orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your orders | Authéra", robots: { index: false, follow: false } };

export default async function OrderHistoryPage() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect("/signin");
  return <main className="customer-orders-page"><nav aria-label="Account navigation"><Link href="/account">My account</Link><Link href="/shop/collection">Continue shopping</Link></nav><h1>Your orders</h1><p>Track your orders and review your past purchases.</p><CustomerOrders/></main>;
}
