import { cache } from "react";
import { notFound } from "next/navigation";
import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";

export const dynamic = "force-dynamic";
const loadCatalog = cache(getCatalog);
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const catalog = await loadCatalog();
  const product = catalog.products.find(item => item.id === id);
  return { title: product ? `${product.brand} ${product.name} | Authéra` : "Product not found | Authéra", description: product?.description };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const catalog = await loadCatalog();
  const product = catalog.products.find(item => item.id === id);
  if (!product) notFound();
  return <Storefront key={id} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage selectedProduct={product} />;
}
