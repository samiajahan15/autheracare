"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import type { Product } from '@/lib/catalog/types';
import { shadeNumber } from '@/lib/catalog/shades';
import ProductImage from './product-image';
import ProductPrice from './product-price';

export default function LumiMatteCard({ variants, initial, cart, saved, onAdd, onSave }: {
  variants: Product[]; initial: Product; cart: Record<string, number>; saved: string[];
  onAdd: (id: string) => void; onSave: (id: string) => void;
}) {
  const [id, setId] = useState(initial.id);
  const product = variants.find(p => p.id === id) ?? initial;
  const shades = [...variants].sort((a,b) => Number(shadeNumber(a))-Number(shadeNumber(b)));
  return <article className="product-card">
    <div className="product-photo"><Link className="product-image-button" href={`/products/${product.id}`} aria-label="View Maybelline Super Stay Lumi Matte Foundation">
      <ProductImage src="/products/maybelline-lumi-matte-332-product-only.webp" alt="Maybelline Super Stay Lumi Matte Foundation, shade 332 shown" fill sizes="(max-width: 600px) 45vw, 24vw"/>
    </Link><button className={`save-button ${saved.includes(product.id) ? 'saved' : ''}`} aria-label={`Save Lumi Matte shade ${shadeNumber(product)}`} aria-pressed={saved.includes(product.id)} onClick={()=>onSave(product.id)}><Heart size={18}/></button></div>
    <div className="product-card-content"><div className="product-card-meta"><span className="product-card-brand">Maybelline</span><span className="product-card-category">Lip & makeup</span></div>
      <h3 className="product-card-title"><Link className="product-name" href={`/products/${product.id}`}>Super Stay Lumi Matte Foundation</Link></h3>
      <label className="shade-picker">Shade · {shades.length} options<select aria-label="Lumi Matte shade" value={product.id} onChange={e=>setId(e.target.value)}>{shades.map(p=><option key={p.id} value={p.id}>Shade {shadeNumber(p)}</option>)}</select></label>
      <small className="shade-photo-note">Photo shows shade 332; selected shade may differ.</small>
      <p className="product-size">{product.size}</p><ProductPrice product={product}/>
      <button className="preview-button" aria-label={`Add Lumi Matte shade ${shadeNumber(product)} to cart`} onClick={()=>onAdd(product.id)}>{cart[product.id] ? `In cart (${cart[product.id]}) · Add another` : 'Add to cart'}<Plus size={16}/></button>
    </div>
  </article>;
}
