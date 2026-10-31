const { loadEnvConfig } = require('@next/env');
const { Client } = require('pg');

loadEnvConfig(process.cwd());
const ids = ['eos-strawberry-limoncello-single', 'eos-pistachio-gelato-single', 'eos-tangerine-spritz-single'];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    await client.query('begin');
    const existing = await client.query('select id from public.products where id = any($1::text[]) and brand = $2 for update', [ids, 'EOS']);
    if (existing.rowCount !== ids.length) throw new Error('Expected exactly three EOS singles; no changes applied');
    await client.query('update public.products set active = false where id = any($1::text[]) and brand = $2', [ids, 'EOS']);
    const verified = await client.query('select id, active from public.products where id = any($1::text[])', [ids]);
    if (verified.rows.some(product => product.active)) throw new Error('Unpublishing verification failed');
    await client.query('commit');
    console.log(JSON.stringify(verified.rows));
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally { await client.end(); }
}

main().catch(() => { console.error('Could not unpublish the three EOS singles. Check database access.'); process.exitCode = 1; });
