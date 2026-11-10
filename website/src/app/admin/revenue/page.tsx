import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase/admin';
import { database } from '@/lib/payments/server';
import styles from './revenue.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Revenue | Authéra' };
const money = (amount: string | number) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(amount) / 100);

export default async function Revenue({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const access = await adminClient();
  if (access.denied) redirect(access.denied.status === 401 ? '/signin' : '/account');
  const current = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
  const defaultMonth = `${current.find(p=>p.type==='year')!.value}-${current.find(p=>p.type==='month')!.value}`;
  const requested = (await searchParams).month;
  const month = requested && /^20\d{2}-(0[1-9]|1[0-2])$/.test(requested) ? requested : defaultMonth;
  let rows: { day: string; orders: number; collected: string; sales: string; delivery: string; pending: string; manual: string; unpriced: number }[] = [];
  let unavailable = false;
  let productSales: { product_id: string; name: string; brand: string; source: string; quantity: string; amount: string; unpriced: number }[] = [];
  try {
    const result = await database().query(`
      with manual as (
        select m.created_at,coalesce(
          (select (i->'orderSummary'->>'subtotal')::bigint from jsonb_array_elements(m.items) i where i->'orderSummary'->>'amountUnit'='poisha' and i->'orderSummary'->>'subtotal' ~ '^[0-9]+$' limit 1),
          (select case when count(*)=count(*) filter(where i->>'currency'='BDT' and i->>'lineAmount' ~ '^[0-9]+$') then sum((i->>'lineAmount')::bigint) end from jsonb_array_elements(m.items) i)
        ) as amount from payments.manual_customer_orders m
      ), entries as (
        select created_at,total,subtotal,delivery,payment_status,0::numeric as manual,0::int as unpriced from payments.orders where status<>'cancelled' and payment_status<>'cancelled'
        union all select created_at,0,coalesce(amount,0),0,'manual',coalesce(amount,0),case when amount is null then 1 else 0 end from manual
      )
      select to_char(created_at at time zone 'Asia/Dhaka','YYYY-MM-DD') as day,count(*)::int as orders,
        coalesce(sum(total) filter(where payment_status='collected'),0)::text as collected,
        coalesce(sum(subtotal) filter(where payment_status in ('collected','manual')),0)::text as sales,
        coalesce(sum(delivery) filter(where payment_status='collected'),0)::text as delivery,
        coalesce(sum(total) filter(where payment_status='due_on_delivery'),0)::text as pending,
        coalesce(sum(manual),0)::text as manual,sum(unpriced)::int as unpriced
      from entries where created_at >= ($1::date::timestamp at time zone 'Asia/Dhaka')
        and created_at < (($1::date + interval '1 month')::timestamp at time zone 'Asia/Dhaka')
      group by 1 order by 1 desc`, [`${month}-01`]);
    rows = result.rows;
    const breakdown = await database().query(`
      with sales as (
        select created_at, quote->'items' as items, 'Website (collected)' as source
        from payments.orders where status <> 'cancelled' and payment_status='collected'
        union all
        select created_at,items,'Manual' from payments.manual_customer_orders
      ), lines as (
        select source,i->>'productId' as product_id,coalesce(i->>'name','Unnamed product') as name,
          coalesce(i->>'brand','') as brand,
          case when i->>'quantity' ~ '^[0-9]+$' then (i->>'quantity')::numeric else 0 end as quantity,
          case when i->>'lineAmount' ~ '^[0-9]+$' and (source='Website (collected)' or i->>'currency'='BDT')
            then (i->>'lineAmount')::numeric end as amount
        from sales cross join lateral jsonb_array_elements(items) i
        where created_at >= ($1::date::timestamp at time zone 'Asia/Dhaka')
          and created_at < (($1::date + interval '1 month')::timestamp at time zone 'Asia/Dhaka')
      )
      select product_id,name,brand,source,sum(quantity)::text as quantity,
        coalesce(sum(amount),0)::text as amount,count(*) filter(where amount is null)::int as unpriced
      from lines group by product_id,name,brand,source order by sum(amount) desc nulls last,name`, [`${month}-01`]);
    productSales = breakdown.rows;
  } catch { unavailable = true; }
  const sum = (key: 'orders'|'collected'|'sales'|'delivery'|'pending'|'manual'|'unpriced') => rows.reduce((total,row)=>total+Number(row[key]),0);
  const maximum = Math.max(1,...rows.map(row=>Number(row.sales)));
  return <main className={styles.page}>
    <nav className={styles.nav}><Link href="/admin">← Administration</Link><Link href="/admin/orders">Manage orders</Link><Link href="/admin/customers">Customers</Link></nav>
    <header className={styles.header}><div><p>STORE PERFORMANCE</p><h1>Revenue</h1><span>Track sales and payments in Bangladeshi taka.</span></div><form><label>Order month<input type="month" name="month" defaultValue={month} required min="2000-01" max="2099-12"/></label><button>View revenue</button></form></header>
    {unavailable ? <p role="alert" className={styles.notice}>Revenue could not be loaded. Please refresh or try again later.</p> : <>
      <section className={styles.metrics} aria-label="Revenue summary">{[
        ['Recorded product sales',money(sum('sales')),'Collected website sales plus priced manual sales'],
        ['Total collected',money(sum('collected')),'Product revenue plus delivery charges'],
        ['Delivery collected',money(sum('delivery')),'Shown separately from product revenue'],
        ['Pending payments',money(sum('pending')),'Uncollected order totals including delivery'],
        ['Manual product sales',money(sum('manual')),'Recorded amounts; collection status not tracked'],
      ].map(([label,value,note])=><article key={label}><h2>{label}</h2><strong>{value}</strong><p>{note}</p></article>)}</section>
      {sum('unpriced') > 0 && <p role="status" className={styles.notice}>{sum('unpriced')} manual sales records have no saved amounts and are excluded from monetary totals.</p>}
      <section className={styles.panel}><h2>Daily revenue</h2><p>{sum('orders')} website and manual sales records in {month}. Dates use Bangladesh time.</p>
        {!rows.length ? <p className={styles.empty}>No qualifying sales records for this month.</p> : <div className={styles.scroll}><table><caption className={styles.caption}>Revenue by order date</caption><thead><tr><th>Date</th><th>Orders</th><th>Recorded product sales</th><th>Total collected</th><th>Pending</th></tr></thead><tbody>{rows.map(row=><tr key={row.day}><th scope="row">{row.day}</th><td>{row.orders}</td><td><span>{money(row.sales)}</span><div className={styles.bar} aria-hidden="true"><i style={{width:`${Number(row.sales)/maximum*100}%`}}/></div></td><td>{money(row.collected)}</td><td>{money(row.pending)}</td></tr>)}</tbody></table></div>}
      </section>
      <section className={styles.panel} style={{marginTop:24}}><h2>Sales by product</h2><p>Collected website sales and manually recorded sales for {month}. Amounts exclude delivery charges.</p>
        {!productSales.length ? <p className={styles.empty}>No product sales recorded for this month.</p> : <div className={styles.scroll}><table><thead><tr><th>Product</th><th>Brand</th><th>Source</th><th>Quantity</th><th>Sales amount</th></tr></thead><tbody>{productSales.map((product,index)=><tr key={`${product.product_id}-${product.source}-${index}`}><th scope="row">{product.name}</th><td>{product.brand}</td><td>{product.source}</td><td>{product.quantity}</td><td>{product.unpriced && Number(product.amount)===0 ? 'Amount not recorded' : money(product.amount)}{product.unpriced > 0 && Number(product.amount)>0 && <small> · {product.unpriced} unpriced entries excluded</small>}</td></tr>)}</tbody></table></div>}
        <p className={styles.notice}>Product amounts use the saved sale line totals. A manual order with only an order subtotal may appear in the revenue summary without an amount allocated to its individual products.</p>
      </section>
    </>}
    <p className={styles.notice}>Figures are grouped by the order’s creation date and reflect its current payment status. Cancelled website orders are excluded. Manual sales use saved amounts in poisha, never current catalog prices, and are included in recorded product sales only. Manual payment status and delivery collection are not tracked. Product sales exclude delivery charges. Profit and refunds are not tracked here.</p>
  </main>;
}
