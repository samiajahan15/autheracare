import test from "node:test";
import assert from "node:assert/strict";
import { searchProducts } from "../src/lib/catalog/search.ts";

const products = [
  { id: "lotion", brand: "CeraVe", name: "Daily Lotion", category: "Body care", description: "Moisturizer for dry skin", size: "200 ml" },
  { id: "serum", brand: "The Ordinary", name: "Hydrating Serum", category: "Face care" },
  { id: "perfume", brand: "Authéra", name: "Rose Mist", category: "Perfume" },
];

test("ranks product names ahead of descriptions", () => {
  const catalog = [...products, { id: "other", brand: "Other", name: "Daily Lotion Treatment", category: "Face care", description: "CeraVe" }];
  assert.equal(searchProducts(catalog, "cerave")[0].id, "lotion");
});
test("matches words in any order and requires every query token", () => {
  assert.deepEqual(searchProducts(products, "lotion cerave").map(product => product.id), ["lotion"]);
  assert.deepEqual(searchProducts(products, "cerave perfume"), []);
});
test("handles accents, punctuation, prefixes, and a single typo", () => {
  for (const query of ["cera", "cerav", "cerave", "cerave lotion", "cerave-lotion"]) assert.equal(searchProducts(products, query)[0].id, "lotion");
  assert.equal(searchProducts(products, "authera")[0].id, "perfume");
});
test("supports category aliases and description and size searches", () => {
  assert.equal(searchProducts(products, "fragrance")[0].id, "perfume");
  assert.equal(searchProducts(products, "skincare")[0].id, "serum");
  assert.equal(searchProducts(products, "moisturiser")[0].id, "lotion");
  assert.equal(searchProducts(products, "200 ml")[0].id, "lotion");
});
test("empty searches preserve catalog order and irrelevant queries return no results", () => {
  assert.deepEqual(searchProducts(products, "  "), products);
  assert.deepEqual(searchProducts(products, "nonexistent"), []);
  assert.deepEqual(searchProducts(products, "xyz"), []);
});
