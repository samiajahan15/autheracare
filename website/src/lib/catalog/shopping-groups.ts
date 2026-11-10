import type { Product } from "./types";

export const shoppingGroups = {
  beauty: { title: "Beauty", description: "Skin Care, Makeup & more" },
  "hair-body": { title: "Hair & Body", description: "Shampoo, Conditioner, Body Wash, Soap, Deodorant & more" },
  "health-wellness": { title: "Health & Wellness", description: "MCT Oil, Fibre, Electrolytes, Supplements & more" },
  "personal-care": { title: "Personal Care", description: "Toothpaste, GUM Soft-Picks, Cotton Swabs, Baby Formula & more" },
  lifestyle: { title: "Lifestyle & More", description: "Candles, Candle Wicks, Coffee & more" },
} as const;

export type ShoppingGroup = keyof typeof shoppingGroups;

export function matchesShoppingGroup(product: Product, group: ShoppingGroup) {
  const { name, category } = product;
  if (category === "Oral care" || /\b(?:toothpaste|soft[- ]picks|cotton swabs|(?:baby|infant) formula)\b/i.test(name)) {
    return group === "personal-care";
  }
  if (category === "Accessories" || (category === "Wellness" && /\bcoffee\b/i.test(name))) {
    return group === "lifestyle";
  }
  if (category === "Wellness") return group === "health-wellness";
  if (category === "Hair care" || category === "Body care") return group === "hair-body";
  return group === "beauty" && ["Face care", "Lip care", "Perfume"].includes(category);
}
