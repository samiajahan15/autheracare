import { notFound } from "next/navigation";
import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";
import { sections } from "@/lib/catalog/sections";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ brand?: string; q?: string }> };

export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const title = sections[section as keyof typeof sections];
  return { title: `${title ?? "Shop"} | Authéra` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  const title = sections[section as keyof typeof sections];
  const { brand, q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 160) : "";
  const catalog = await getCatalog();
  return <Storefront key={`${section}-${brand ?? ""}-${query}`} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage searchPage={Boolean(query)} initialQuery={query} title={query ? `${title}: ${query}` : title} initialTab={title === "Our collection" ? "Featured products" : title} initialBrand={brand} />;
}
