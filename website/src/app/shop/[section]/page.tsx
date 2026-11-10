import { notFound } from "next/navigation";
import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";
import { sections, categoryLabel } from "@/lib/catalog/sections";
import { shoppingGroups, type ShoppingGroup } from "@/lib/catalog/shopping-groups";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ brand?: string; q?: string }> };

export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const group = Object.hasOwn(shoppingGroups, section) ? shoppingGroups[section as ShoppingGroup] : undefined;
  const title = group?.title ?? sections[section as keyof typeof sections];
  return { title: `${categoryLabel(title ?? "Shop")} | Authéra` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { section } = await params;
  const group = Object.hasOwn(shoppingGroups, section) ? section as ShoppingGroup : undefined;
  if (!group && !Object.hasOwn(sections, section)) notFound();
  const title = sections[section as keyof typeof sections];
  const { brand, q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 160) : "";
  const catalog = await getCatalog();
  const label = group ? shoppingGroups[group].title : categoryLabel(title);
  return <Storefront key={`${section}-${brand ?? ""}-${query}`} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage searchPage={Boolean(query)} initialQuery={query} title={query ? `${label}: ${query}` : label} initialTab={group || title === "Our collection" ? "Featured products" : title} initialBrand={brand} shoppingGroup={group} />;
}
