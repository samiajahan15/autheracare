import test from "node:test";
import assert from "node:assert/strict";
import { deduplicateProducts } from "../src/lib/catalog/deduplicate.ts";

const product = (id, name = "Hydrating Cream", size = "50 mL") => ({ id, brand: "Example", name, size, category: "Face care" });

test("duplicate IDs and equivalent names and sizes appear only once", () => {
  const original = product("first");
  assert.deepEqual(deduplicateProducts([original, original, { ...product("second", "HYDRATING CREAM", "50ml"), category: "Body care" }]), [original]);
});

test("different sizes, shades, formulas and bundles stay separate even with a shared image", () => {
  const products = [product("small"), product("large", "Hydrating Cream", "100 mL"), product("shade1", "Foundation Shade 01"), product("shade2", "Foundation Shade 10"), product("spf", "Hydrating Cream SPF 50"), product("bundle", "Hydrating Cream Twin Pack", "2 × 50 mL")].map(p => ({ ...p, image: "/products/shared.png" }));
  assert.deepEqual(deduplicateProducts(products), products);
});

test("reviewed duplicate aliases prefer the specific product and preserve input", () => {
  const products = [product("gloss", "Disney Princess Lip Gloss Collections"), product("bbw-disney-princess-rapunzel-lip-gloss", "Disney Princess Rapunzel Lip Gloss", "14 mL")];
  assert.deepEqual(deduplicateProducts(products), [products[1]]);
  assert.equal(products.length, 2);
  assert.deepEqual(deduplicateProducts([products[0]]), [products[0]]);
});
