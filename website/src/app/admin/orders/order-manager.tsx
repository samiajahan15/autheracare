"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orderStatuses, transitions, type OrderStatus, type PaymentStatus } from "@/lib/payments/order-management";
import type { CheckoutQuote } from "@/lib/payments/quote";
import styles from "./orders.module.css";

type Order = { id: string; customer: { name: string; phone: string; city: string; address: string }; quote: CheckoutQuote; total: string; status: OrderStatus; payment_status: PaymentStatus; created_at: string };
type Stats = { total: number; active: number; delivered: number; collected: string };
const money = (amount: string | number) => `৳${(Number(amount) / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
const label = (value: string) => value.replaceAll("_", " ");
export default function OrderManager() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>("placed");
  const [collect, setCollect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!selected) return;
    const element = dialog.current;
    element?.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = oldOverflow; };
  }, [selected]);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ q: search, status, payment, page: String(page) });
    fetch(`/api/admin/orders?${params}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (response.status === 401) { router.replace("/signin"); return; }
      if (response.status === 403) { router.replace("/account"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load orders.");
      setOrders(data.orders); setTotal(data.total); setStats(data.stats);
    }).catch(reason => { if (!controller.signal.aborted) { setError(reason.message); setOrders([]); setStats(null); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, status, payment, page, refresh, router]);
  function reload() { setLoading(true); setError(""); setRefresh(value => value + 1); }
  function open(order: Order) { setSelected(order); setNextStatus(order.status); setCollect(false); setSaveError(""); }
  async function save() {
    if (!selected || saving) return;
    setSaving(true); setSaveError("");
    try {
      const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, expectedStatus: selected.status, expectedPaymentStatus: selected.payment_status, status: nextStatus, collectPayment: collect }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save order.");
      setNotice("Order updated."); setSelected(null); reload();
    } catch (reason) { setSaveError(reason instanceof Error ? reason.message : "Could not save order."); }
    finally { setSaving(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><div><Link href="/admin">Back to administration</Link><h1>Orders</h1><p>Manage fulfillment and Cash on Delivery payments.</p></div><div className={styles.actions}><Link href="/" target="_blank" rel="noopener noreferrer">Visit site</Link><button onClick={reload} disabled={loading}>Refresh orders</button></div></header>
    <section className={styles.stats} aria-label="Order overview">{[["All orders", stats?.total], ["In progress", stats?.active], ["Delivered", stats?.delivered], ["COD collected", stats ? money(stats.collected) : null]].map(([name, value]) => <article key={name}><span>{name}</span><strong>{value ?? "—"}</strong></article>)}</section>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <section className={styles.panel}><div className={styles.filters}>
      <form onSubmit={event => { event.preventDefault(); setLoading(true); setError(""); setSearch(query.trim()); setPage(1); setRefresh(value => value + 1); }}><input aria-label="Search orders" placeholder="Customer name, phone or order ID" value={query} maxLength={160} onChange={event => setQuery(event.target.value)}/><button>Search</button></form>
      <select aria-label="Order status" value={status} onChange={event => { setLoading(true); setError(""); setStatus(event.target.value); setPage(1); }}><option value="">All order statuses</option>{orderStatuses.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>
      <select aria-label="Payment status" value={payment} onChange={event => { setLoading(true); setError(""); setPayment(event.target.value); setPage(1); }}><option value="">All payments</option><option value="due_on_delivery">Due on delivery</option><option value="collected">Collected</option><option value="cancelled">Cancelled</option></select>
    </div>
    {error ? <p className={styles.error} role="alert">{error}</p> : loading ? <p className={styles.empty} role="status">Loading orders…</p> : <><div className={styles.table}><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Fulfillment</th><th>Payment</th><th>Details</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>#{order.id.slice(0, 8)}</strong><small>{new Date(order.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}</small></td><td>{order.customer.name}<small>{order.customer.phone}</small></td><td>{money(order.total)}</td><td><span className={styles.badge}>{label(order.status)}</span></td><td>{label(order.payment_status)}</td><td><button onClick={() => open(order)}>Manage</button></td></tr>)}</tbody></table></div>{!orders.length && <p className={styles.empty}>No orders match your filters.</p>}<div className={styles.pagination}><span>{total} orders · Page {page} of {Math.max(1, Math.ceil(total / 20))}</span><button disabled={page <= 1} onClick={() => { setLoading(true); setPage(page - 1); }}>Previous</button><button disabled={page * 20 >= total} onClick={() => { setLoading(true); setPage(page + 1); }}>Next</button></div></>}
    </section>
    {selected && <dialog ref={dialog} className={styles.overlay} aria-labelledby="order-detail-title" onCancel={event => { if (saving) event.preventDefault(); else setSelected(null); }} onClick={event => { if (event.target === event.currentTarget && !saving) setSelected(null); }}><section className={styles.detail}>
      <header><h2 id="order-detail-title">Order #{selected.id.slice(0, 8)}</h2><button autoFocus onClick={() => setSelected(null)} disabled={saving}>Close</button></header>
      <p className={styles.reference}>{selected.id}</p><h3>Delivery details</h3><p>{selected.customer.name}</p><p><a href={`tel:${selected.customer.phone}`}>{selected.customer.phone}</a></p><p>{selected.customer.address}, {selected.customer.city}</p>
      <h3>Products</h3><ul className={styles.items}>{selected.quote.items.map(item => <li key={item.productId}><span>{item.brand} {item.name}<small>{item.quantity} × {money(item.unitAmount)}</small></span><strong>{money(item.lineAmount)}</strong></li>)}</ul><dl><div><dt>Subtotal</dt><dd>{money(selected.quote.subtotal)}</dd></div><div><dt>Shipping</dt><dd>{money(selected.quote.delivery)}</dd></div><div><dt>Total due</dt><dd>{money(selected.total)}</dd></div></dl>
      <h3>Update order</h3><label>Fulfillment status<select value={nextStatus} disabled={saving} onChange={event => { setNextStatus(event.target.value as OrderStatus); setCollect(false); }}><option value={selected.status}>{label(selected.status)}</option>{transitions[selected.status].map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>
      {selected.payment_status === "collected" ? <p>COD payment collected.</p> : nextStatus === "delivered" && <label className={styles.checkbox}><input type="checkbox" checked={collect} disabled={saving} onChange={event => setCollect(event.target.checked)}/>I confirm the COD payment was collected.</label>}
      {nextStatus === "cancelled" && selected.status !== "cancelled" && <p className={styles.warning}>{selected.quote.inventoryReserved === false ? "Saving will cancel this order." : "Saving will cancel this order and restore the reserved product stock."}</p>}
      {saveError && <p className={styles.error} role="alert">{saveError}</p>}<button className={styles.save} onClick={save} disabled={saving || (nextStatus === selected.status && !collect)}>{saving ? "Saving…" : "Save changes"}</button>
    </section></dialog>}
  </main>;
}
