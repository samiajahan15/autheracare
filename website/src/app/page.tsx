import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();
  return <Storefront products={catalog.products} catalogUnavailable={catalog.source === "preview"} />;
}
