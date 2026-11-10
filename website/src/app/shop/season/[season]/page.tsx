import { notFound } from "next/navigation";
import Storefront from "@/components/storefront";
import { getCatalog } from "@/lib/catalog/server";
import { seasons } from "@/lib/catalog/seasonal-care";

export const dynamic = "force-dynamic";

export default async function SeasonalPage({ params }: { params: Promise<{ season: string }> }) {
  const { season: slug } = await params;
  const season = seasons.find(item => item.toLowerCase() === slug);
  if (!season) notFound();
  const catalog = await getCatalog();
  return <Storefront key={season} products={catalog.products} catalogUnavailable={catalog.source === "preview"} categoryPage collectionSeason={season} title={`All ${season} Products`}/>;
}
