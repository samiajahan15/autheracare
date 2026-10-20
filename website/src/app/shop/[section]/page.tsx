import { notFound } from "next/navigation";
import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";
import { sections } from "@/lib/catalog/sections";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ brand?: string }> };

export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const title = sections[section as keyof typeof sections];
  return { title: `${title ?? "Shop"} | Authéra` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  const title = sections[section as keyof typeof sections];
  const { brand } = await searchParams;
  const catalog = await getCatalog();
  return <Storefront key={`${section}-${brand ?? ""}`} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage title={title} initialTab={title === "Our collection" ? "Featured products" : title} initialBrand={brand} />;
}
