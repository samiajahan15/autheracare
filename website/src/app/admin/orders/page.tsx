import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import OrderManager from "./order-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order management | Authéra" };

export default async function AdminOrders() {
  const access = await adminClient();
  if (access.denied) redirect(access.denied.status === 401 ? "/signin" : "/account");
  return <OrderManager/>;
}
