import type { Product } from "./types";

// Match product names, rather than general descriptions that may mention dryness
// even for exfoliants or other products outside the winter hydration edit.
export function isWinterCareProduct(product: Product) {
  if (!["Face care", "Body care", "Lip care", "Hair care"].includes(product.category)) return false;
  return /\b(moisturi[sz](?:ing|er|ers|ation)|hydrat(?:ing|ion)|hyaluronic|barrier|healing ointment|lip balm|rice lipids|dry skin|hand cream|body butter)\b/i.test(product.name);
}
