import test from "node:test";
import assert from "node:assert/strict";
import { matchesSkinTypes } from "../src/lib/catalog/skin-types.ts";

test("no selection preserves products without skin-type information", () => {
  assert.equal(matchesSkinTypes({ name: "Serum" }, []), true);
  assert.equal(matchesSkinTypes({ name: "Serum" }, ["Sensitive"]), false);
});
test("multiple skin types match any selected type", () => {
  const product = { name: "Serum", skinTypes: ["Normal", "Sensitive"] };
  assert.equal(matchesSkinTypes(product, ["Oily", "Sensitive"]), true);
  assert.equal(matchesSkinTypes(product, ["Dry"]), false);
});
test("matches explicit descriptions without guessing from unrelated words", () => {
  assert.equal(matchesSkinTypes({ name: "Cream", description: "For dry skin" }, ["Dry"]), true);
  assert.equal(matchesSkinTypes({ name: "Dry Shampoo" }, ["Dry"]), false);
  assert.equal(matchesSkinTypes({ name: "Facial Oil" }, ["Oily"]), false);
});
