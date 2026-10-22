import type { Product } from "./types";

export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function closeMatch(query: string, word: string) {
  if (query.length < 4 || Math.abs(query.length - word.length) > 1) return false;
  const distances = Array.from({ length: word.length + 1 }, (_, index) => index);
  for (let row = 1; row <= query.length; row++) {
    let diagonal = distances[0];
    distances[0] = row;
    for (let column = 1; column <= word.length; column++) {
      const previous = distances[column];
      distances[column] = Math.min(distances[column] + 1, distances[column - 1] + 1, diagonal + Number(query[row - 1] !== word[column - 1]));
      diagonal = previous;
    }
  }
  return distances[word.length] <= 1;
}

export function searchProducts(products: Product[], query: string): Product[] {
  const normalized = normalizeSearch(query).slice(0, 160);
  if (!normalized) return products;
  const aliases: Record<string, string> = { skincare: "face", skin: "face", haircare: "hair", bodycare: "body", makeup: "lip", fragrance: "perfume", fragrances: "perfume", moisturiser: "moisturizer", moisturisers: "moisturizer" };
  const tokens = normalized.split(/\s+/).map(token => aliases[token] ?? token);
  return products.map(product => {
    const name = normalizeSearch(`${product.brand} ${product.name}`);
    const fields = [name, normalizeSearch(product.category), normalizeSearch(`${product.size ?? ""} ${product.description ?? ""}`)];
    let score = name === normalized ? 100 : name.includes(normalized) ? 40 : 0;
    for (const token of tokens) {
      let best = 0;
      fields.forEach((field, index) => {
        for (const word of field.split(/\s+/)) {
          const weight = index === 0 ? 12 : index === 1 ? 8 : 2;
          if (word === token) best = Math.max(best, weight + 3);
          else if (word.startsWith(token)) best = Math.max(best, weight);
          else if (closeMatch(token, word)) best = Math.max(best, weight / 2);
        }
      });
      if (!best) return { product, score: 0 };
      score += best;
    }
    return { product, score };
  }).filter(match => match.score > 0).sort((first, second) => second.score - first.score).map(match => match.product);
}
