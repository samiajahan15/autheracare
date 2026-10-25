"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import ProductPrice from "./product-price";

export function hasFlavorGallery(product: Product) {
  return product.brand === "EOS" && (product.id === "eos-spritz-lip-balm" || product.id.endsWith("-single"));
}

export default function FlavorGallery({ product, products, priority = false }: { product: Product; products: Product[]; priority?: boolean }) {
  const slides = [product, ...products.filter(p => hasFlavorGallery(p) && p.id !== product.id)].filter(p => p.image);
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? product;
  function move(next: number) {
    const row = track.current;
    if (!row) return;
    row.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, next)) * row.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <>
    <button className="flavor-gallery-trigger" data-product-click={product.id} aria-label={`Open ${product.name} photos and swipe through flavors`} onClick={() => {
      dialog.current?.showModal();
      track.current?.scrollTo({ left: 0, behavior: "instant" });
      setIndex(0);
    }}>
      {product.image && <Image src={product.image} alt={`${product.brand} ${product.name}`} fill sizes="(max-width: 700px) 90vw, 48vw" priority={priority}/>}
      <span className="flavor-gallery-hint">View flavors · {slides.length} photos</span>
    </button>
    <dialog ref={dialog} className="flavor-gallery-dialog" aria-label="EOS lip balm flavor photos" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        move(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    }}>
      <div className="flavor-gallery-header"><strong>EOS · Explore the flavors</strong><button autoFocus onClick={() => dialog.current?.close()} aria-label="Close flavor photos">✕</button></div>
      <div className="flavor-gallery-stage">
        <div ref={track} className="flavor-gallery-track" onScroll={event => {
          const row = event.currentTarget;
          if (row.clientWidth) setIndex(Math.round(row.scrollLeft / row.clientWidth));
        }}>
          {slides.map((p, i) => <div key={p.id} className="flavor-gallery-slide" role="group" aria-label={`${i + 1} of ${slides.length}: ${p.name}`}>
            <Image src={p.image!} alt={`${p.brand} ${p.name}`} fill sizes="(max-width: 600px) 94vw, 520px" draggable={false}/>
          </div>)}
        </div>
        <span className="flavor-gallery-count">{index + 1}/{slides.length}</span>
        <button className="flavor-gallery-prev" onClick={() => move(index - 1)} disabled={index === 0} aria-label="Previous flavor">‹</button>
        <button className="flavor-gallery-next" onClick={() => move(index + 1)} disabled={index === slides.length - 1} aria-label="Next flavor">›</button>
      </div>
      <div className="flavor-gallery-dots" aria-label="Choose flavor photo">{slides.map((p, i) => <button key={p.id} onClick={() => move(i)} aria-label={`Show ${p.name}`} aria-current={i === index ? "true" : undefined}/>)}</div>
      <div className="flavor-gallery-caption" aria-live="polite"><h2>{current.name}</h2><p>{current.size}</p><ProductPrice product={current}/><Link href={`/products/${current.id}`} onClick={() => dialog.current?.close()}>View this {current.id.endsWith("-single") ? "flavor" : "combo"}</Link></div>
    </dialog>
  </>;
}
