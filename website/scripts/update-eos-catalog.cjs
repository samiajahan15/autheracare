const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const variants = [
  ['vanilla-bean', 'Vanilla Bean', 'Cream', '62ed84a3-77eb-4852-ab84-3ce842df0305'],
  ['raspberry-rose', 'Raspberry Rosé', 'Pink', '85abb680-47bb-44f3-8a81-cdd1784cb533'],
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    const existing = await client.query('select id,name,price,stock,position,active from public.products where brand=$1', ['EOS']);
    console.log('Existing EOS products:', JSON.stringify(existing.rows));
    if (process.argv.includes('--inspect')) return;
    const combo = existing.rows.find(p => p.id === 'eos-spritz-lip-balm');
    if (!combo) throw new Error('Expected existing EOS combo not found');
    const seedPath = 'src/lib/catalog/seed.json';
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    const products = variants.map(([slug, flavor, color, attachment]) => {
      const image = `/products/eos-${slug}-single.png`;
      fs.copyFileSync(path.join(process.env.TEMP, `codex-clipboard-${attachment}.png`), `public${image}`);
      return {
        id: `eos-${slug}-single`, brand: 'EOS',
        name: `Shea Natural Smooth Lip Balm – ${flavor} (Single)`,
        category: 'Lip care', image, editedImage: true, size: '1 lip balm · 4 g', price: 320,
        description: `One ${color.toLowerCase()} ${flavor} lip balm, sold individually for ৳320. The 9-pack box pictured is for reference and is not included with this single product.`,
      };
    });
    const comboDescription = 'Nine lip balms in five flavors: Tangerine Spritz, Strawberry Limoncello, Raspberry Rosé, Vanilla Bean, and Pistachio Gelato. Regular total: 9 × ৳320 = ৳2,880. Save ৳150 with the combo: ৳2,730.';
    const localCombo = seed.products.find(p => p.id === combo.id);
    Object.assign(localCombo, { name: 'Spritz Shea Natural Smooth Lip Balm 9-Pack Combo', price: 2730, description: comboDescription });
    for (const product of products) {
      const index = seed.products.findIndex(p => p.id === product.id);
      if (index >= 0) seed.products[index] = product;
      else seed.products.splice(seed.products.findIndex(p => p.id === combo.id), 0, product);
    }
    await client.query('begin');
    try {
      await client.query('update public.products set name=$1,price=$2,description=$3 where id=$4', [localCombo.name, 2730, comboDescription, combo.id]);
      for (const [index, p] of products.entries()) {
        await client.query(`insert into public.products (id,brand,name,category,image,edited_image,size,price,description,active,position)
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10)
          on conflict (id) do update set name=excluded.name,image=excluded.image,edited_image=excluded.edited_image,size=excluded.size,price=excluded.price,description=excluded.description`,
        [p.id,p.brand,p.name,p.category,p.image,p.editedImage,p.size,p.price,p.description,combo.position + index + 1]);
      }
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n');
    console.log('Updated live catalog and preview: two singles at 320, combo at 2730.');
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
