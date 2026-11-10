import type { Product } from "./types";

// Reviewed duplicate: the old collection card uses the same Rapunzel product.
export const productAliases: Record<string, string> = {
  gloss: "bbw-disney-princess-rapunzel-lip-gloss",
};

function normalize(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function productIdentity(product: Product) {
  // Preserve all words and numbers: shades, strengths, formulas and pack sizes
  // must never be inferred to be equivalent from similar names or images.
  const size = normalize(product.size ?? "").replace(/(?<=\d)\s+(?=[a-z])/g, "");
  return JSON.stringify([normalize(product.brand), normalize(product.name), size]);
}

export function deduplicateProducts(products: Product[]): Product[] {
  const ids = new Set(products.map(p => p.id));
  const seenIds = new Set<string>();
  const seenProducts = new Set<string>();
  return products.filter(product => {
    if (productAliases[product.id] && ids.has(productAliases[product.id])) return false;
    const identity = productIdentity(product);
    if (seenIds.has(product.id) || seenProducts.has(identity)) return false;
    seenIds.add(product.id);
    seenProducts.add(identity);
    return true;
  });
}
