"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CheckoutQuote } from "@/lib/payments/quote";
import styles from "./customer-orders.module.css";

type Order = { id: string; quote: CheckoutQuote; total: string; status: string; payment_status: string; created_at: string };
type History = { orders: Order[]; total: number; pageSize: number };
const money = (amount: string | number) => `৳${(Number(amount) / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
const readable = (value: string) => value.replaceAll("_", " ");

export default function CustomerOrders({ compact = false, currentOrderId }: { compact?: boolean; currentOrderId?: string }) {
  const [history, setHistory] = useState<History | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/payments/orders?page=${page}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Please sign in to see your orders." : "We couldn’t load your orders. Please try again.");
      setHistory(data);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, retry]);
  const orders = history?.orders.filter(order => order.id !== currentOrderId) ?? [];
  function refresh() { setError(""); setLoading(true); setRetry(value => value + 1); }
  return <section className={`${styles.history} ${compact ? styles.compact : ""}`} aria-labelledby={compact ? "previous-orders-title" : "order-history-title"}>
    <header className={styles.heading}><h2 id={compact ? "previous-orders-title" : "order-history-title"}>{compact ? "Your previous orders" : "Order history"}</h2>{!compact && <button onClick={refresh} disabled={loading}>Refresh</button>}</header>
    {loading ? <p className={styles.message} role="status">Loading your orders…</p> : error ? <div className={styles.message} role="alert"><p>{error}</p><button onClick={refresh}>Try again</button><Link href="/signin">Sign in</Link></div> : !orders.length ? <p className={styles.message}>{currentOrderId && history?.total === 1 ? "This is your first order. You can return here to check its progress." : "You haven’t placed any orders yet."}</p> : <div className={styles.orders}>{orders.slice(0, compact ? 3 : undefined).map(order => <article className={styles.order} key={order.id}>
      <div className={styles.orderHeading}><div><strong>Order #{order.id.slice(0, 8)}</strong><time dateTime={order.created_at}>{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })}</time></div><span className={styles.status}>{readable(order.status)}</span></div>
      <ul>{order.quote.items.map(item => <li key={item.productId}><span><Link href={`/products/${encodeURIComponent(item.productId)}`}>{item.brand} {item.name}</Link><small>Quantity: {item.quantity}</small></span><strong>{money(item.lineAmount)}</strong></li>)}</ul>
      <footer><span>{readable(order.payment_status)}</span><strong>{money(order.total)}</strong></footer>
      {!compact && <details><summary>Order details</summary><p>Reference: {order.id}</p><p>Products: {money(order.quote.subtotal)}</p><p>Delivery: {money(order.quote.delivery)}</p><p>Payment method: Cash on Delivery</p></details>}
    </article>)}</div>}
    {compact ? <Link className={styles.viewAll} href="/account/orders">View order history</Link> : history && !error && <nav className={styles.pagination} aria-label="Order history pages"><span>{history.total} orders</span><button disabled={loading || page <= 1} onClick={() => { setLoading(true); setPage(page - 1); }}>Previous</button><span>Page {page}</span><button disabled={loading || page * history.pageSize >= history.total} onClick={() => { setLoading(true); setPage(page + 1); }}>Next</button></nav>}
  </section>;
}
