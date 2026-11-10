import type { Product } from './types';

export function isLumiMatte(product: Product) {
  return product.brand.toLowerCase() === 'maybelline' && /super stay lumi matte foundation/i.test(product.name);
}
export function isTeddyTint(product: Product) {
  return product.brand.toLowerCase() === 'maybelline' && /super\s*stay teddy tint/i.test(product.name);
}
export function teddyShade(product: Product) {
  return product.name.match(/(?:Shade\s+|\()(\d+)[\s–-]+(.+?)\)?$/i)?.slice(1).join(' · ') ?? product.name;
}
export function shadeNumber(product: Product) {
  return product.name.match(/shade\s+(\d+)/i)?.[1] ?? '';
}
export function groupShadeCards(products: Product[]) {
  const seen = new Set<string>();
  return products.filter(product => {
    const family = isLumiMatte(product) ? 'lumi' : isTeddyTint(product) ? 'teddy' : '';
    if (!family) return true;
    if (seen.has(family)) return false;
    seen.add(family);
    return true;
  });
}
