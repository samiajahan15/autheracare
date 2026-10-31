import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const presentation = JSON.parse(readFileSync(new URL("../src/lib/catalog/product-image-presentation.json", import.meta.url)));
const directory = new URL("../public/", import.meta.url);

test("image mappings resolve directly to final assets without switching images a second time", () => {
  for (const [source, entry] of Object.entries(presentation)) {
    assert.equal(presentation[entry.source]?.source ?? entry.source, entry.source, `${source} maps through another image`);
    assert.ok(existsSync(new URL(`.${entry.source}`, directory)), `Missing replacement for ${source}`);
  }
});

test("marked Ordinary posters and their alternate paths use the correct product-only variant", () => {
  for (const name of ["ordinary-niacinamide-30", "ordinary-rice-60", "ordinary-rice-120", "ordinary-mini-set"]) {
    assert.equal(presentation[`/products/${name}.png`].source, `/products/${name}-product-only.webp`);
  }
  assert.equal(presentation["/products/ordinary-rice-60-alternate-1.png"].source, "/products/ordinary-rice-60-product-only.webp");
  assert.equal(presentation["/products/ordinary-rice-120-alternate-1.png"].source, "/products/ordinary-rice-120-product-only.webp");
});

test("new product-only images retain transparency rather than an opaque poster background", async () => {
  for (const name of ["ordinary-niacinamide-30", "ordinary-rice-60", "ordinary-rice-120", "ordinary-mini-set"]) {
    const file = path.resolve("public/products", `${name}-product-only.webp`);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.hasAlpha, true, name);
    const corner = await sharp(file).extract({ left: 0, top: 0, width: 1, height: 1 }).ensureAlpha().raw().toBuffer();
    assert.equal(corner[3], 0, `${name} has an opaque corner`);
  }
});

test("Baby Moisturizing Cream uses its own 227 g tube rather than the three-product poster", async () => {
  const replacement = presentation["/products/pdf-01-004-1-cerave-baby-moisturizing-cream-227g.png"].source;
  assert.equal(replacement, "/products/cerave-baby-cream-227g-product-only.webp");
  const metadata = await sharp(readFileSync(new URL(`.${replacement}`, directory))).metadata();
  assert.equal(metadata.hasAlpha, true);
});

test("catalog posters resolve to separate complete product images for each set and size", async () => {
  const variants = [
    ["pdf-03-005-1-aveeno-daily-moisturizing-lotion-71-ml", "aveeno-daily-lotion-71ml-product-only"],
    ["pdf-03-006-1-aveeno-daily-moisturizing-lotion-nourishing-dry-skin-227-ml", "aveeno-daily-lotion-227ml-product-only"],
    ["pdf-03-011-1-aveeno-intense-relief-over-night-cream-with-shea-butter-very-dry-skin-208-ml", "aveeno-intense-relief-208ml-product-only"],
    ["pdf-04-002-1-the-ordinary-acne-set-box-set", "ordinary-acne-set-product-only"],
    ["pdf-04-003-1-the-ordinary-bright-set-box-set", "ordinary-bright-set-product-only"],
    ["pdf-04-005-1-the-ordinary-glycolic-acid-7-exfoliating-toner-100-ml", "ordinary-glycolic-100ml-product-only"],
    ["pdf-04-005-2-the-ordinary-glycolic-acid-7-exfoliating-toner-240-ml", "ordinary-glycolic-240ml-product-only"],
    ["pdf-04-008-2-the-ordinary-natural-moisturizing-factors-ha-100-ml", "ordinary-nmf-100ml-product-only"],
    ["pdf-04-010-1-the-ordinary-hyaluronic-acid-2-b5-ceramide-30-ml", "ordinary-hyaluronic-ceramides-30ml-product-only"],
  ];
  for (const [original, replacement] of variants) {
    const source = presentation[`/products/${original}.png`].source;
    assert.equal(source, `/products/${replacement}.webp`);
    assert.equal((await sharp(readFileSync(new URL(`.${source}`, directory))).metadata()).hasAlpha, true);
  }
});
