import test from "node:test";
import assert from "node:assert/strict";
import { shuffleProducts, prioritizePopular } from "../src/lib/catalog/discovery.ts";

const products = [{ id: "cream" }, { id: "balm" }, { id: "serum" }, { id: "lotion" }];
test("shuffle changes discovery order without dropping, duplicating or mutating products", () => {
  const shuffled = shuffleProducts(products, () => 0);
  assert.notDeepEqual(shuffled, products);
  assert.deepEqual([...shuffled].sort((a, b) => a.id.localeCompare(b.id)), [...products].sort((a, b) => a.id.localeCompare(b.id)));
  assert.equal(products[0].id, "cream");
});
test("popular products lead, ties keep shuffled order, absent counts keep all products", () => {
  const shuffled = shuffleProducts(products, () => 0);
  assert.deepEqual(prioritizePopular(shuffled, {}), shuffled);
  const ranked = prioritizePopular(shuffled, { cream: 3, serum: 9 });
  assert.deepEqual(ranked.slice(0, 2).map(p => p.id), ["serum", "cream"]);
  assert.deepEqual(ranked.slice(2), shuffled.filter(p => !["serum", "cream"].includes(p.id)));
  assert.deepEqual(prioritizePopular(shuffled, Object.fromEntries(products.map(p => [p.id, 2]))), shuffled);
});
