export const skinTypes = ["Normal", "Dry", "Oily", "Combination", "Sensitive"] as const;
export type SkinType = typeof skinTypes[number];

export function matchesSkinTypes(product: { name: string; description?: string; skinTypes?: SkinType[] }, selected: SkinType[]) {
  if (!selected.length) return true;
  if (product.skinTypes) return selected.some(type => product.skinTypes!.includes(type));
  const text = `${product.name} ${product.description ?? ""}`;
  return selected.some(type => new RegExp(`\\b${type}\\s+skin\\b`, "i").test(text));
}
