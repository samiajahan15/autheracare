import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search products | Authéra", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 160) : "";
  const catalog = await getCatalog();
  return <Storefront key={query} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage searchPage initialQuery={query} title={query ? `Results for “${query}”` : "Explore all products"}/>;
}
