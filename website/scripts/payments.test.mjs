import test from "node:test";
import assert from "node:assert/strict";
import { buildQuote } from "../src/lib/payments/quote.ts";
import { quoteInput, orderInput } from "../src/lib/payments/validation.ts";

const product = { id: "serum", name: "Serum", brand: "Authéra", price: "595.50", stock: 8, active: true };
const input = { items: [{ productId: "serum", quantity: 2 }], region: "dhaka" };
const customer = { name: "Test Customer", phone: "01712345678", city: "Dhaka", address: "House 1, Road 2, Dhaka" };

test("uses integer poisha and the correct delivery fees", () => {
  const quote = buildQuote(input, [product]);
  assert.equal(quote.subtotal, 119100);
  assert.equal(quote.delivery, 8000);
  assert.equal(quote.total, 127100);
  assert.equal(buildQuote({ ...input, region: "outside-dhaka" }, [product]).total, 131100);
  assert.equal(quote.paymentStatus, "due_on_delivery");
});
test("rejects missing and unpublished products", () => {
  for (const products of [[], [{ ...product, active: false }]]) assert.throws(() => buildQuote(input, products));
});

test("stock quantities do not block checkout or reserve inventory", () => {
  for (const stock of [null, 0, 1, 8]) {
    const quote = buildQuote(input, [{ ...product, stock }]);
    assert.equal(quote.total, 127100);
    assert.equal(quote.inventoryReserved, false);
  }
});
test("does not allow unpriced or malformed catalog prices", () => {
  for (const price of [null, 0, -5, NaN, Infinity, "bad", "1.001"]) assert.throws(() => buildQuote(input, [{ ...product, price }]));
});
test("rejects quantity manipulation, duplicate items and client prices", () => {
  for (const items of [[], [{ productId: "serum", quantity: 0 }], [{ productId: "serum", quantity: -1 }], [{ productId: "serum", quantity: 1.5 }], [{ productId: "serum", quantity: 100 }], [...input.items, ...input.items], [{ productId: "serum", quantity: 1, price: 1 }]]) assert.equal(quoteInput.safeParse({ ...input, items }).success, false);
});
test("requires COD, valid Bangladesh contact details and the reviewed total", () => {
  const order = { ...input, paymentMethod: "cod", customer, expectedTotal: 127100 };
  assert.equal(orderInput.safeParse(order).success, true);
  for (const patch of [{ paymentMethod: "paid" }, { paymentStatus: "collected" }, { expectedTotal: 0 }, { customer: { ...customer, phone: "123" } }, { customer: { ...customer, address: "x" } }]) assert.equal(orderInput.safeParse({ ...order, ...patch }).success, false);
});
test("rejects unknown delivery regions and unsupported currencies", () => {
  assert.equal(quoteInput.safeParse({ ...input, region: "unknown" }).success, false);
  assert.equal(quoteInput.safeParse({ ...input, currency: "USD" }).success, false);
});
