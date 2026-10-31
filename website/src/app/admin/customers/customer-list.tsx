"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reorderWhatsAppUrl } from "@/lib/customer-contact";
import styles from "../orders/orders.module.css";
import customerStyles from "./customers.module.css";

type Contact = { name: string; phone: string; address: string; city: string };
type Order = { id: string; created_at: string; status: string; customer: Contact; items: { productId: string; brand: string; name: string; quantity: number }[] };
type Customer = { phone_key: string; customer: Contact; order_count: number; last_order_at: string | null; orders: Order[] };
const date = (value: string) => new Date(value).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" });

export default function CustomerList() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Contact>({ name: "", phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!deleting) return;
    const element = deleteDialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, [deleting]);
  useEffect(() => {
    if (!adding) return;
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, [adding]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/customers?${new URLSearchParams({ q: search, page: String(page) })}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (response.status === 401) { router.replace("/signin"); return; }
      if (response.status === 403) { router.replace("/account"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load customers.");
      if (!controller.signal.aborted) { setCustomers(data.customers); setTotal(data.total); }
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load customers."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, page, refresh, router]);
  function reload() { setLoading(true); setError(""); setRefresh(value => value + 1); }
  async function deleteCustomer() {
    if (!deleting || saving) return;
    setSaving(true); setDeleteError("");
    try {
      const response = await fetch("/api/admin/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneKey: deleting.phone_key }) });
      if (response.status === 401) { router.replace("/signin"); return; }
      if (response.status === 403) { router.replace("/account"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete customer.");
      setNotice(`${deleting.customer.name} deleted from the customer list.`); setDeleting(null);
      if (customers.length === 1 && page > 1) setPage(page - 1);
      reload();
    } catch (reason) { setDeleteError(reason instanceof Error ? reason.message : "Could not delete customer."); }
    finally { setSaving(false); }
  }
  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setSaveError("");
    try {
      const response = await fetch("/api/admin/customers", { method: editingKey ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingKey ? { phoneKey: editingKey, customer: draft } : draft) });
      if (response.status === 401) { router.replace("/signin"); return; }
      if (response.status === 403) { router.replace("/account"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save customer.");
      setAdding(false); setNotice(`${data.customer.name} ${editingKey ? "updated" : "added"}.`);
      setQuery(""); setSearch(""); setPage(1); reload();
    } catch (reason) { setSaveError(reason instanceof Error ? reason.message : "Could not save customer."); }
    finally { setSaving(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><div><Link href="/admin">Back to administration</Link><h1>Customers</h1><p>Website and manually added customers, grouped by phone number. Cancelled orders are excluded.</p></div><div className={styles.actions}><Link href="/admin/orders">Manage orders</Link><button onClick={reload} disabled={loading}>Refresh customers</button><button onClick={() => { setEditingKey(null); setDraft({ name: "", phone: "", address: "", city: "" }); setSaveError(""); setAdding(true); }}>Add customer</button></div></header>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <section className={styles.panel} aria-label="Customer list">
      <div className={styles.filters}><form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(1); reload(); }}><input aria-label="Search customers" placeholder="Name, phone, address or product" maxLength={160} value={query} onChange={event => setQuery(event.target.value)}/><button>Search</button></form></div>
      {error ? <p className={styles.error} role="alert">{error}</p> : loading ? <p className={styles.empty} role="status">Loading customers…</p> : <>
        <p className={customerStyles.hint}>Includes website orders and manually recorded purchases. WhatsApp opens a prefilled inquiry using the latest order’s products. Review and send it in WhatsApp.</p>
        <div className={styles.table}><table><thead><tr><th>Customer</th><th>Latest delivery address</th><th>Products &amp; orders</th><th>Reorder inquiry</th></tr></thead><tbody>{customers.map(entry => {
          const contact = entry.customer;
          const url = reorderWhatsAppUrl(contact.phone, contact.name, entry.orders[0]?.items.map(item => `${item.brand} ${item.name}`) ?? []);
          return <tr key={entry.phone_key}><td><strong>{contact.name}</strong><small><a href={`tel:${contact.phone}`}>{contact.phone}</a></small><small>{entry.order_count} {entry.order_count === 1 ? "order" : "orders"}{entry.last_order_at ? ` · Latest ${date(entry.last_order_at)}` : " · Manually added"}</small><div className={customerStyles.rowActions}><button aria-label={`Edit ${contact.name}`} onClick={() => { setEditingKey(entry.phone_key); setDraft({ ...contact }); setSaveError(""); setAdding(true); }}>Edit customer</button><button className={customerStyles.danger} aria-label={`Delete ${contact.name}`} onClick={() => { setDeleteError(""); setDeleting(entry); }}>Delete</button></div></td>
            <td className={customerStyles.address}>{contact.address}<small>{contact.city}</small></td>
            <td>{entry.orders.length ? <><ul className={customerStyles.products}>{entry.orders[0].items.map(item => <li key={item.productId}>{item.brand} {item.name} × {item.quantity}</li>)}</ul><details className={customerStyles.history}><summary>View all orders ({entry.order_count})</summary>{entry.orders.map(order => <article key={order.id}><strong>#{order.id.slice(0, 8)} · {date(order.created_at)}</strong><small>{order.status.replaceAll("_", " ")}</small><ul className={customerStyles.products}>{order.items.map(item => <li key={item.productId}>{item.brand} {item.name} × {item.quantity}</li>)}</ul><small>Delivery address: {order.customer.address}, {order.customer.city}</small><small>{order.customer.name} · {order.customer.phone}</small></article>)}</details></> : <span>No orders recorded yet</span>}</td>
            <td>{url ? <a className={customerStyles.whatsapp} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Ask ${contact.name} about reordering on WhatsApp`}>WhatsApp inquiry ↗</a> : <span>Valid mobile number needed</span>}</td></tr>;
        })}</tbody></table></div>
        {!customers.length && <p className={styles.empty}>No customers found{search ? " matching your search" : ". Customers appear after placing an order"}.</p>}
        <div className={styles.pagination}><span>{total} customers · Page {page} of {Math.max(1, Math.ceil(total / 20))}</span><button disabled={page <= 1} onClick={() => { setPage(page - 1); reload(); }}>Previous</button><button disabled={page * 20 >= total} onClick={() => { setPage(page + 1); reload(); }}>Next</button></div>
      </>}
    </section>
    {deleting && <dialog ref={deleteDialog} className={styles.overlay} aria-labelledby="delete-customer-title" onCancel={event => { if (saving) event.preventDefault(); else setDeleting(null); }}>
      <section className={styles.detail}>
        <h2 id="delete-customer-title">Delete {deleting.customer.name}?</h2>
        <p>{deleting.customer.phone}</p><p>This removes the customer from this list and WhatsApp follow-ups. Existing orders are preserved. You can add the same phone number again to restore the customer.</p>
        {deleteError && <p className={styles.error} role="alert">{deleteError}</p>}
        <div className={customerStyles.rowActions}><button autoFocus disabled={saving} onClick={() => setDeleting(null)}>Cancel</button><button className={customerStyles.danger} disabled={saving} onClick={deleteCustomer}>{saving ? "Deleting…" : "Delete customer"}</button></div>
      </section>
    </dialog>}
    {adding && <dialog ref={dialog} className={styles.overlay} aria-labelledby="add-customer-title" onCancel={event => { if (saving) event.preventDefault(); else setAdding(false); }}>
      <form className={styles.detail} onSubmit={saveCustomer}>
        <header><h2 id="add-customer-title">{editingKey ? "Edit customer" : "Add customer"}</h2><button type="button" disabled={saving} onClick={() => setAdding(false)}>Close</button></header>
        <p>{editingKey ? "Update current contact details. Previous order details stay in the order history." : "Save contact details without placing an order."}</p>
        <fieldset className={customerStyles.fields} disabled={saving}>
          <label>Name<input autoFocus autoComplete="name" required minLength={2} maxLength={100} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })}/></label>
          <label>Phone number<input type="tel" autoComplete="tel" required pattern={"(\\+?88)?01[3-9][0-9]{8}"} title="Enter a Bangladesh mobile number, e.g. 01712345678 or +8801712345678" placeholder="01712345678" value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })}/></label>
          <label>Delivery address<textarea autoComplete="street-address" required minLength={10} maxLength={500} rows={3} value={draft.address} onChange={event => setDraft({ ...draft, address: event.target.value })}/></label>
          <label>City<input autoComplete="address-level2" required minLength={2} maxLength={100} value={draft.city} onChange={event => setDraft({ ...draft, city: event.target.value })}/></label>
        </fieldset>
        {saveError && <p className={styles.error} role="alert">{saveError}</p>}
        <button className={styles.save} disabled={saving}>{saving ? "Saving…" : editingKey ? "Save changes" : "Save customer"}</button>
      </form>
    </dialog>}
  </main>;
}
