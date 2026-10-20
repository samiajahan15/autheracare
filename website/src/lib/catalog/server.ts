import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import seed from "./seed.json";
import type { Product } from "./types";

export async function getCatalog(): Promise<{ products: Product[]; source: "supabase" | "preview" }> {
  try {
    const { url, key } = getSupabaseConfig();
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("products")
      .select("id,brand,name,category,image,edited_image,size,price,description")
      .eq("active", true).order("position").order("id").limit(1000)
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    return { source: "supabase", products: (data ?? []).map(row => ({
      ...row, category: row.category as Product["category"],
      image: row.image ?? undefined, editedImage: row.edited_image,
      size: row.size ?? undefined, price: row.price == null ? undefined : Number(row.price),
      description: row.description ?? undefined,
    })) };
  } catch (error) {
    console.error("Supabase catalog unavailable:", error instanceof Error ? error.message : "Database query failed");
    return { source: "preview", products: seed.products as Product[] };
  }
}
