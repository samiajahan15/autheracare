import Checkout from "@/components/checkout";
import { cartInput } from "@/lib/payments/validation";
import { getCatalog } from "@/lib/catalog/server";

export const metadata = { title: "Cash on Delivery checkout | Authéra", robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const { items } = await searchParams;
  let cart: unknown = [];
  try { cart = JSON.parse(typeof items === "string" && items.length <= 12000 ? items : "[]"); } catch { cart = []; }
  const parsed = cartInput.safeParse(cart);
  const { products } = await getCatalog();
  return <Checkout items={parsed.success ? parsed.data : []} products={products} enabled={process.env.COD_ENABLED === "true" && Boolean(process.env.DATABASE_URL)} />;
}
