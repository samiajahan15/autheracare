"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CheckoutQuote } from "@/lib/payments/quote";
import type { QuoteInput } from "@/lib/payments/validation";
import type { Product } from "@/lib/catalog/types";
import CustomerOrders from "./customer-orders";

function money(amount: number) { return `৳${(amount / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`; }

export default function Checkout({ items, products, enabled }: { items: QuoteInput["items"]; products: Product[]; enabled: boolean }) {
  const [region, setRegion] = useState<QuoteInput["region"]>("dhaka");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);
  const [order, setOrder] = useState<{ id: string; quote: CheckoutQuote } | null>(null);
  const submission = useRef<{ body: string; key: string } | null>(null);
  const summaryItems = items.map(item => {
    const product = products.find(product => product.id === item.productId);
    const verified = quote?.items.find(quoted => quoted.productId === item.productId);
    const unitAmount = verified?.unitAmount ?? (product?.price != null && product.price > 0 ? Math.round(product.price * 100) : null);
    return { ...item, name: product ? `${product.brand} ${product.name}` : item.productId, image: product?.image, unitAmount, lineAmount: unitAmount == null ? null : unitAmount * item.quantity };
  });
  const subtotal = summaryItems.every(item => item.lineAmount != null) ? summaryItems.reduce((sum, item) => sum + (item.lineAmount ?? 0), 0) : null;
  const delivery = region === "dhaka" ? 8000 : 12000;

  useEffect(() => {
    const controller = new AbortController();
    if (!items.length) return () => controller.abort();
    fetch("/api/payments/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, region }), signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not verify your bag.");
      setQuote(result.quote); setError("");
    }).catch(reason => {if (!controller.signal.aborted) {setError(reason instanceof Error ? reason.message : "Could not verify your bag.");setQuote(null);}}).finally(() => {if (!controller.signal.aborted)setLoading(false);});
    return () => controller.abort();
  }, [items, region]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !quote || loading || !enabled) return;
    const fields = new FormData(event.currentTarget);
    const body = JSON.stringify({ items, region, paymentMethod: "cod", expectedTotal: quote.total, customer: { name: fields.get("name"), phone: fields.get("phone"), city: fields.get("city"), address: fields.get("address") } });
    if (submission.current?.body !== body) submission.current = { body, key: crypto.randomUUID() };
    setBusy(true); setError("");setSignInRequired(false);
    try {
      const response = await fetch("/api/payments/orders", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": submission.current.key }, body });
      const result = await response.json();
      if (response.status === 401) setSignInRequired(true);
      if (!response.ok) throw new Error(result.error || "Could not place your order.");
      setOrder(result.order);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reach checkout. You can retry without submitting the same order twice."); }
    finally { setBusy(false); }
  }

  return <main className="checkout-page"><header className="checkout-header"><Link href="/" className="checkout-logo"><Image src="/brand/authera-logo.png" alt="Authéra Skincare" width={170} height={68} priority/></Link></header>
    {order ? <div className="checkout-success-grid"><section className="checkout-confirmation" role="status"><span className="checkout-eyebrow">THANK YOU FOR YOUR ORDER</span><h1>Your order is received.</h1><p>Your Cash on Delivery order has been placed.</p><p>Order reference: <strong>{order.id}</strong></p><p>Pay <strong>{money(order.quote.total)}</strong> on delivery. No online payment has been collected.</p><div className="checkout-success-actions"><Link href="/account/orders">View order history</Link><Link href="/shop/collection">Continue shopping</Link></div></section><CustomerOrders compact currentOrderId={order.id}/></div> : !items.length ? <section className="checkout-confirmation"><h1>Your bag is empty.</h1><p>Add products before checking out.</p><Link href="/shop/collection">Start shopping →</Link></section> : <><h1>Checkout</h1><p className="checkout-intro">Cash on Delivery · Pay when your order arrives.</p>
      <div className="checkout-grid"><form id="checkout-form" onSubmit={placeOrder}><fieldset disabled={busy}><legend>Billing Details</legend><label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100}/></label><label>Mobile number<input name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" pattern="(\+?88)?01[3-9][0-9]{8}" required/></label><label>Delivery area<select value={region} onChange={event => {setRegion(event.target.value as QuoteInput["region"]);setLoading(true);setQuote(null);setError("");}}><option value="dhaka">Inside Dhaka — ৳80</option><option value="outside-dhaka">Outside Dhaka — ৳120</option></select></label><label>City / district<input name="city" autoComplete="address-level2" required minLength={2} maxLength={100}/></label><label>Full delivery address<textarea name="address" autoComplete="street-address" required minLength={10} maxLength={500} rows={3}/></label></fieldset>
      <div className="checkout-method"><strong>Cash on Delivery</strong><p>Pay the order total to the delivery person when you receive your order.</p></div>
      {error && <p className="checkout-error" role="alert">{error}</p>}{signInRequired && <Link className="checkout-signin" href="/signin">Sign in, then return here to complete your order →</Link>}
      </form>
      <aside className="checkout-summary" aria-label="Order summary"><h2>Order Summary</h2><ul>{summaryItems.map(item => <li key={item.productId}>{item.image && <Image className="checkout-product-image" src={item.image} alt={item.name} width={56} height={64}/>}<span className="checkout-product-details"><Link href={`/products/${encodeURIComponent(item.productId)}`}>{item.name}</Link><small>{item.quantity} × {item.unitAmount == null ? "Price unavailable" : money(item.unitAmount)}</small></span><strong>{item.lineAmount == null ? "—" : money(item.lineAmount)}</strong></li>)}</ul><dl><div><dt>Sub Total</dt><dd>{subtotal == null ? "Awaiting prices" : money(subtotal)}</dd></div><div><dt>Shipping</dt><dd>{money(delivery)}</dd></div><div><dt>Discount</dt><dd>{money(0)}</dd></div><div className="checkout-total"><dt>Total (TK)</dt><dd>{subtotal == null ? "Awaiting prices" : money(subtotal + delivery)}</dd></div></dl>{loading && <p role="status">Checking current prices and availability…</p>}{subtotal == null && <p>One or more products do not have a price yet. Your total will be available once those prices are added.</p>}<div className="checkout-method"><strong>Payment</strong><p>◉ Cash on Delivery</p><p>Pay when your order arrives.</p></div><button className="checkout-place" form="checkout-form" disabled={!enabled || !quote || loading || busy} type="submit">{busy ? "Placing your order…" : "Place Order"}</button><Link href="/shop/collection">← Continue shopping</Link></aside></div>
    </>}
  </main>;
}
