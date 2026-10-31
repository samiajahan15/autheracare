import presentation from "./product-image-presentation.json";

export function productImageSource(source: string | undefined): string | undefined {
  if (!source) return undefined;
  return (presentation as Record<string, { source: string }>)[source]?.source ?? source;
}
