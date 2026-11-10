import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";
import { productAliases } from "@/lib/catalog/deduplicate";

export const dynamic = "force-dynamic";
const loadCatalog = cache(getCatalog);
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const catalog = await loadCatalog();
  const product = catalog.products.find(item => item.id === (productAliases[id] ?? id));
  return { title: product ? `${product.brand} ${product.name} | Authéra` : "Product not found | Authéra", description: product?.description };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  if (productAliases[id]) permanentRedirect(`/products/${productAliases[id]}`);
  const catalog = await loadCatalog();
  const product = catalog.products.find(item => item.id === id);
  if (!product) notFound();
  return <Storefront key={id} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage selectedProduct={product} />;
}
