import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { Product } from "@/lib/catalog/types";

export default function CartContents({ products, cart, onAdjust, onClose }: { products: Product[]; cart: Record<string, number>; onAdjust: (id: string, delta: number) => void; onClose: () => void }) {
  const items = products.filter(product => cart[product.id] > 0);
  const pricesReady = items.every(product => product.price != null && product.price > 0);
  const subtotal = items.reduce((sum, product) => sum + Math.round((product.price ?? 0) * 100) * cart[product.id], 0);
  const money = (amount: number) => `৳${(amount / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  const checkout = `/checkout?items=${encodeURIComponent(JSON.stringify(items.map(product => ({ productId: product.id, quantity: cart[product.id] }))))}`;
  return <>
    <div className="cart-drawer-items">
      {!items.length ? <div className="cart-drawer-empty"><p>Your cart is empty.</p><Link href="/shop/collection" onClick={onClose}>Continue shopping</Link></div> : items.map(product => <article className="cart-drawer-item" key={product.id}>
        <Link className="cart-drawer-photo" href={`/products/${encodeURIComponent(product.id)}`} onClick={onClose}>{product.image ? <Image src={product.image} alt={product.name} fill sizes="72px"/> : <span>{product.brand}</span>}</Link>
        <div className="cart-drawer-product"><small>{product.brand}</small><Link href={`/products/${encodeURIComponent(product.id)}`} onClick={onClose}>{product.name}</Link>{product.size && <small>{product.size}</small>}
          <div className="quantity"><button aria-label={`Remove one ${product.name}`} onClick={() => onAdjust(product.id, -1)}><Minus size={14}/></button><span aria-label="Quantity">{cart[product.id]}</span><button aria-label={`Add one ${product.name}`} disabled={cart[product.id] >= 99} onClick={() => onAdjust(product.id, 1)}><Plus size={14}/></button></div>
          <p>{cart[product.id]} × {product.price != null && product.price > 0 ? money(Math.round(product.price * 100)) : "Price unavailable"}</p>
        </div>
        <button className="cart-drawer-remove" aria-label={`Remove ${product.name} from cart`} onClick={() => onAdjust(product.id, -cart[product.id])}><X size={15}/></button>
      </article>)}
    </div>
    {items.length > 0 && <div className="cart-drawer-footer"><div className="cart-drawer-subtotal"><strong>Subtotal</strong><strong aria-live="polite">{pricesReady ? money(subtotal) : "Awaiting prices"}</strong></div><p>Shipping is calculated at checkout.</p><Link className="cart-drawer-continue" href="/shop/collection" onClick={onClose}>Continue shopping</Link><Link className="bag-checkout" href={checkout}>Checkout</Link></div>}
  </>;
}
