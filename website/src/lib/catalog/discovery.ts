export function shuffleProducts<T>(products: readonly T[], random = Math.random): T[] {
  const result = [...products];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function prioritizePopular<T extends { id: string }>(products: readonly T[], counts: Record<string, number>): T[] {
  // Stable sorting preserves the shuffled order for ties and unclicked products.
  return [...products].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
}
