const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { Client } = require('pg');
const { loadEnvConfig } = require('@next/env');

async function main() {
  loadEnvConfig(process.cwd());
  const directory = path.resolve(process.argv.includes('--framed') ? '../tmp/product-image-framed' : process.argv.includes('--unused') ? '../tmp/product-image-library' : '../tmp/product-image-audit');
  fs.mkdirSync(directory, { recursive: true });
  const seed = require('../src/lib/catalog/seed.json');
  let products = seed.products;
  if (process.env.DATABASE_URL) {
    const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
    try { await client.connect(); products = (await client.query('select id, brand, name, image, size from public.products where active = true order by id')).rows; }
    finally { await client.end(); }
  }
  fs.writeFileSync(path.join(directory, 'products.json'), JSON.stringify(products, null, 2));
  let unique = [...new Set(products.map(product => product.image).filter(Boolean))];
  if (process.argv.includes('--unused')) unique = fs.readdirSync('public/products').filter(file => /\.(png|webp|jpg)$/i.test(file)).map(file => `/products/${file}`).filter(image => !unique.includes(image));
  fs.writeFileSync(path.join(directory, 'images.json'), JSON.stringify(unique, null, 2));
  const columns = 8, pageSize = 56, width = 150, height = 180;
  for (let page = 0; page * pageSize < unique.length; page++) {
    const entries = unique.slice(page * pageSize, (page + 1) * pageSize);
    const layers = [];
    for (let index = 0; index < entries.length; index++) {
      const image = entries[index];
      if (!image.startsWith('/products/')) continue;
      const left = (index % columns) * width, top = Math.floor(index / columns) * height;
      const entry = process.argv.includes('--framed') ? require('../src/lib/catalog/product-image-presentation.json')[image] : undefined;
      let preview = sharp(path.resolve('public', (entry?.source ?? image).slice(1)));
      if (entry?.frame) {
        const [x, y, w, h] = entry.frame;
        preview = preview.extract({ left: Math.round(x * entry.width), top: Math.round(y * entry.height), width: Math.round(w * entry.width), height: Math.round(h * entry.height) });
      }
      const thumbnail = await preview.resize(140, 148, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toBuffer();
      layers.push({ input: thumbnail, left: left + 5, top: top + 4 });
      layers.push({ input: Buffer.from(`<svg width="150" height="25"><rect width="150" height="25" fill="white"/><text x="8" y="18" font-size="13">${page * pageSize + index}: ${path.basename(image).slice(0, 14)}</text></svg>`), left, top: top + 150 });
    }
    await sharp({ create: { width: columns * width, height: Math.ceil(entries.length / columns) * height, channels: 3, background: '#eeeeee' } }).composite(layers).png().toFile(path.join(directory, `sheet-${page + 1}.png`));
  }
  console.log(JSON.stringify({ products: products.length, uniqueImages: unique.length, sheets: Math.ceil(unique.length / pageSize), directory }));
}
main().catch(error => {console.error(error.message);process.exitCode = 1;});
