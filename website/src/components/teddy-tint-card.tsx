"use client";

import Link from 'next/link';

import { useRef, useState } from 'react';

import { Heart, Plus } from 'lucide-react';

import type { Product } from '@/lib/catalog/types';

import { teddyShade } from '@/lib/catalog/shades';

import ProductImage from './product-image';

import ProductPrice from './product-price';

import styles from './teddy-tint.module.css';



export function TeddyCarousel({ variants, initial, onSelect }: { variants: Product[]; initial: Product; onSelect: (product: Product) => void }) {

  const slides = [...variants].sort((a,b)=>parseInt(teddyShade(a))-parseInt(teddyShade(b)));

  const initialIndex = Math.max(0, slides.findIndex(p=>p.id===initial.id));

  const [index,setIndex] = useState(initialIndex);

  const track = useRef<HTMLDivElement>(null);

  const drag = useRef<{x:number;left:number}|null>(null);

  const current = slides[index] ?? initial;

  function move(next:number) {

    const row=track.current;

    if(row) row.scrollTo({left:Math.max(0,Math.min(slides.length-1,next))*row.clientWidth,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});

  }

  return <section className={styles.gallery} aria-label="Teddy Tint shades" aria-roledescription="carousel">

    <div className={styles.track} ref={node=>{track.current=node;if(node && !node.dataset.initialized){node.scrollLeft=initialIndex*node.clientWidth;node.dataset.initialized='true';}}} tabIndex={0} aria-label="Swipe or use arrow keys to browse shades" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(index+(e.key==='ArrowRight'?1:-1));}}} onScroll={e=>{const row=e.currentTarget;if(!row.clientWidth)return;const next=Math.max(0,Math.min(slides.length-1,Math.round(row.scrollLeft/row.clientWidth)));if(next!==index){setIndex(next);onSelect(slides[next]);}}}

    onPointerDown={e=>{if(e.pointerType!=='mouse'||e.button!==0)return;e.preventDefault();e.currentTarget.focus({preventScroll:true});drag.current={x:e.clientX,left:e.currentTarget.scrollLeft};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.style.scrollSnapType='none';}}

    onPointerMove={e=>{if(drag.current)e.currentTarget.scrollLeft=drag.current.left+drag.current.x-e.clientX;}}

    onPointerUp={e=>{const start=drag.current;if(!start)return;drag.current=null;e.currentTarget.style.scrollSnapType='';const distance=start.x-e.clientX;move(Math.round(start.left/e.currentTarget.clientWidth)+(Math.abs(distance)>35?Math.sign(distance):0));}}

    onLostPointerCapture={e=>{if(drag.current){drag.current=null;e.currentTarget.style.scrollSnapType='';move(Math.round(e.currentTarget.scrollLeft/e.currentTarget.clientWidth));}}}>

      {slides.map((p,i)=><div className={styles.slide} key={p.id} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${slides.length}: ${teddyShade(p)}`}><ProductImage src={p.image!} alt={`Maybelline Teddy Tint ${teddyShade(p)}`} fill sizes="(max-width:700px) 85vw, 40vw" draggable={false}/></div>)}

    </div>

    <button className={styles.previous} disabled={index===0} onClick={()=>move(index-1)} aria-label="Previous shade">‹</button>

    <button className={styles.next} disabled={index===slides.length-1} onClick={()=>move(index+1)} aria-label="Next shade">›</button>

    <span className={styles.count}>{index+1} / {slides.length}</span>

    <div className={styles.caption} aria-live="polite">{teddyShade(current)}</div>

    <label className={styles.picker}>Choose shade<select aria-label="Teddy Tint shade" value={current.id} onChange={e=>{const next=slides.findIndex(p=>p.id===e.target.value);if(next<0)return;track.current?.scrollTo({left:next*track.current.clientWidth,behavior:'instant'});setIndex(next);onSelect(slides[next]);}}>{slides.map(p=><option key={p.id} value={p.id}>{teddyShade(p)}</option>)}</select></label>

  </section>;

}

export default function TeddyTintCard({variants,initial,cart,saved,onAdd,onSave}:{variants:Product[];initial:Product;cart:Record<string,number>;saved:string[];onAdd:(id:string)=>void;onSave:(id:string)=>void}) {

  const [product,setProduct]=useState(initial);

  return <article className="product-card" data-product-family="teddy-tint"><div className={`product-photo ${styles.photo}`}><TeddyCarousel variants={variants} initial={initial} onSelect={setProduct}/><button className={`save-button ${saved.includes(product.id)?'saved':''}`} aria-label={`Save Teddy Tint ${teddyShade(product)}`} aria-pressed={saved.includes(product.id)} onClick={()=>onSave(product.id)}><Heart size={18}/></button></div><div className="product-card-content"><div className="product-card-meta"><span className="product-card-brand">Maybelline</span><span className="product-card-category">Lip & makeup</span></div><h3 className="product-card-title"><Link className="product-name" href={`/products/${product.id}`}>Super Stay Teddy Tint</Link></h3><p>{teddyShade(product)}</p><p className="product-size">{product.size}</p><ProductPrice product={product}/><small>Confirm availability</small><button className="preview-button" aria-label={`Add Teddy Tint ${teddyShade(product)} to cart`} onClick={()=>onAdd(product.id)}>{cart[product.id]?`In cart (${cart[product.id]}) · Add another`:'Add to cart'}<Plus size={16}/></button></div></article>;

}

