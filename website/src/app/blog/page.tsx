import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog | Authéra Journal", description: "Product stories and everyday care notes from Authéra." };

export default async function BlogPage() {
  const catalog = await getCatalog();
  return <Storefront products={catalog.products} catalogUnavailable={catalog.source === "preview"} blogPage/>;
}
