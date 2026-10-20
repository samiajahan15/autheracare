import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productInput } from "../src/lib/catalog/validation.ts";

const seed = JSON.parse(readFileSync(new URL("../src/lib/catalog/seed.json", import.meta.url)));
const valid = { ...seed.products[0], image: seed.products[0].image ?? null,
  size: null, price: null, stock: null, description: null, active: true, edited_image: false, position: 0 };

test("all existing catalog entries satisfy backend validation", () => {
  assert.equal(new Set(seed.products.map(p => p.id)).size, seed.products.length);
  for (const p of seed.products) {
    const { editedImage, ...fields } = p;
    assert.ok(seed.brands.includes(p.brand));
    productInput.parse({ ...valid, ...fields, edited_image: Boolean(editedImage) });
  }
});
test("reject invalid price, fractional stock, unknown category, and privilege fields", () => {
  for (const patch of [{ price: -1 }, { price: 1.001 }, { stock: 1.5 }, { category: "invalid" }, { user_id: "admin" }]) {
    assert.equal(productInput.safeParse({ ...valid, ...patch }).success, false);
  }
});
test("reject untrusted image hosts and traversal", () => {
  for (const image of ["https://untrusted.example/image.png", "/products/../secret", "javascript:alert(1)"]) {
    assert.equal(productInput.safeParse({ ...valid, image }).success, false);
  }
});
test("unconfirmed price and stock remain null; zero is valid", () => {
  assert.equal(productInput.parse(valid).price, null);
  assert.equal(productInput.parse({ ...valid, price: 0, stock: 0 }).stock, 0);
});
