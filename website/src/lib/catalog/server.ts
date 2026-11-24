import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import seed from "./seed.json";
import oralCareProducts from "./oral-care-products.json";
import additionalProducts from "./additional-products.json";
import type { Product } from "./types";
import { productImageSource } from "./product-image";
import { deduplicateProducts } from "./deduplicate";

const productImageFallbacks: Record<string, string> = {
  "qtips-cotton-swabs-500": "/products/qtips-cotton-swabs-500-studio.webp",
  "pdf-18-087-1-g-u-m-sunstar-g-u-m-soft-picks-advanced-90-34": "/products/gum-soft-picks-advanced-270-studio.webp",
};

export async function getCatalog(): Promise<{ products: Product[]; source: "supabase" | "preview" }> {
  try {
    const { url, key } = getSupabaseConfig();
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("products")
      .select("id,brand,name,category,image,edited_image,size,price,description")
      .eq("active", true).order("position").order("id").limit(1000)
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    const databaseProducts: Product[] = (data ?? []).map(row => ({
      ...row, category: row.category as Product["category"],
      image: productImageSource(row.image ?? productImageFallbacks[row.id]), editedImage: row.edited_image || Boolean(productImageFallbacks[row.id]),
      size: row.size ?? undefined, price: row.price == null ? undefined : Number(row.price),
      description: row.description ?? undefined,
    }));
    const curatedProducts = [...oralCareProducts, ...additionalProducts] as Product[];
    const curatedById = new Map(curatedProducts.map(product => [product.id, product]));
    return { source: "supabase", products: deduplicateProducts([
      ...databaseProducts.map(product => {
        const updated = curatedById.get(product.id);
        return updated ? { ...product, name: updated.name, image: updated.image, editedImage: true } : product;
      }),
      ...curatedProducts.filter(product => !databaseProducts.some(existing => existing.id === product.id)),
    ]) };
  } catch (error) {
    console.error("Supabase catalog unavailable:", error instanceof Error ? error.message : "Database query failed");
    return { source: "preview", products: deduplicateProducts((seed.products as Product[]).map(product => ({ ...product, image: productImageSource(product.image) }))) };
  }
}
