const { Client } = require('pg');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');
const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
(async () => {
  try {
    await client.connect();
    await client.query('begin');
    const { rows } = await client.query('select id from public.products where active = true limit 1');
    const id = rows[0].id;
    const visitor = randomUUID();
    const insert = 'insert into product_analytics.clicks (product_id, visitor_id) values ($1,$2) on conflict do nothing';
    await client.query(insert, [id, visitor]);
    await client.query(insert, [id, visitor]);
    const result = await client.query('select count(*)::integer as clicks from product_analytics.clicks where product_id=$1 and visitor_id=$2', [id, visitor]);
    assert.equal(result.rows[0].clicks, 1);
    const access = await client.query("select has_schema_privilege('anon','product_analytics','usage') as exposed");
    assert.equal(access.rows[0].exposed, false);
    const ranking = await client.query(`select c.product_id, count(*)::integer as clicks from product_analytics.clicks c join public.products p on p.id=c.product_id where c.clicked_on >= current_date-29 and p.active=true group by c.product_id order by clicks desc, c.product_id limit 1000`);
    assert.ok(ranking.rows.some(row => row.product_id === id && row.clicks >= 1));
    console.log('Verified deduplication, shared popularity query and private schema permissions.');
  } finally {
    await client.query('rollback').catch(() => {});
    await client.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
