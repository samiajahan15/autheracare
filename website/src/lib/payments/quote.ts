import type { QuoteInput } from "./validation";

export type CheckoutProduct = { id: string; name: string; brand: string; price: number | string | null; stock: number | null; active: boolean };

export class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 409) { super(message); this.status = status; }
}

export function buildQuote(input: QuoteInput, products: CheckoutProduct[]) {
  const catalog = new Map(products.map(product => [product.id, product]));
  const items = input.items.map(item => {
    const product = catalog.get(item.productId);
    if (!product?.active) throw new CheckoutError("A product is no longer available. Please update your bag.");
    const price = product.price == null ? NaN : Number(product.price);
    const unitAmount = Math.round(price * 100);
    if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(unitAmount) || Math.abs(price * 100 - unitAmount) > 0.001) throw new CheckoutError(`The price for ${product.name} is not ready for checkout.`);
    return { productId: product.id, name: product.name, brand: product.brand, quantity: item.quantity, unitAmount, lineAmount: unitAmount * item.quantity };
  });
  const subtotal = items.reduce((total, item) => total + item.lineAmount, 0);
  const delivery = input.region === "dhaka" ? 8000 : 12000;
  const total = subtotal + delivery;
  if (!Number.isSafeInteger(total) || total > 999999999999) throw new CheckoutError("Order total exceeds the supported limit.", 400);
  return { currency: "BDT" as const, amountUnit: "poisha" as const, items, subtotal, delivery, total, region: input.region, paymentMethod: "cod" as const, paymentStatus: "due_on_delivery" as const, inventoryReserved: false };
}

export type CheckoutQuote = ReturnType<typeof buildQuote>;
