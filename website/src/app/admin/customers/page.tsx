import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import CustomerList from "./customer-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers | Authéra" };

export default async function AdminCustomers() {
  const access = await adminClient();
  if (access.denied) redirect(access.denied.status === 401 ? "/signin" : "/account");
  return <CustomerList/>;
}
