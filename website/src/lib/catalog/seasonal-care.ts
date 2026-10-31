import type { Product } from "./types";
import { isWinterCareProduct } from "./winter-care";

export const seasons = ["Winter", "Summer", "Autumn", "Monsoon", "Spring"] as const;
export type Season = typeof seasons[number];
export const seasonDescriptions: Record<Season, string> = {
  Winter: "Comfort for colder days. Explore moisturizers, hydrating serums, lip balm, and nourishing care for skin and hair.",
  Summer: "Care for sunny days. Explore sunscreen, lightweight hydration, and refreshing cleansers.",
  Autumn: "Ease into cooler days with nourishing moisturizers, gentle cleansing, and barrier care.",
  Monsoon: "Refresh your rainy-day routine with cleansers, scalp care, and lightweight hydration.",
  Spring: "Refresh your everyday routine with gentle cleansing, hydration, and daily sun protection.",
};
export function isSeasonalCareProduct(product: Product, season: Season) {
  if (season === "Winter") return isWinterCareProduct(product);
  if (!["Face care", "Body care", "Lip care", "Hair care"].includes(product.category)) return false;
  const patterns = {
    Summer: /sunscreen|\bspf\b|ultra.light|cleanser|face wash|aloe|moisturizing gel/i,
    Autumn: /moisturi[sz]|hydrat|barrier|gentle|lip balm|conditioner/i,
    Monsoon: /cleanser|face wash|shampoo|scalp|anti.dandruff|oil.free|lightweight/i,
    Spring: /gentle|cleanser|hydrat|vitamin c|sunscreen|\bspf\b/i,
  };
  return patterns[season].test(product.name);
}
