"use client";

import ProductImage from "./product-image";
import { useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import styles from "./flavor-gallery.module.css";

export function hasFlavorGallery(product: Product) {
  return product.brand === "EOS" && (product.id === "eos-spritz-lip-balm" || product.id.endsWith("-single"));
}

export default function FlavorGallery({ product, products, priority = false }: { product: Product; products: Product[]; priority?: boolean }) {
  const slides = [product, ...products.filter(p => hasFlavorGallery(p) && p.id !== product.id)].filter(p => p.image);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [index, setIndex] = useState(0);
  function move(next: number) {
    const row = track.current;
    if (!row) return;
    row.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, next)) * row.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <section className={styles.gallery} aria-label={`${product.brand} flavor photos`} aria-roledescription="carousel">
    <div ref={track} className={styles.track} tabIndex={0} aria-label="Swipe left or right to browse flavors" onKeyDown={event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); move(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    }} onScroll={event => {
      const row = event.currentTarget;
      if (row.clientWidth) setIndex(Math.max(0, Math.min(slides.length - 1, Math.round(row.scrollLeft / row.clientWidth))));
    }} onPointerDown={event => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault(); event.currentTarget.focus({ preventScroll: true });
      drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.style.scrollSnapType = "none";
    }} onPointerMove={event => {
      if (drag.current) event.currentTarget.scrollLeft = drag.current.left + drag.current.x - event.clientX;
    }} onPointerUp={event => {
      const start = drag.current;
      if (!start) return;
      drag.current = null;
      event.currentTarget.style.scrollSnapType = "";
      const startIndex = Math.round(start.left / event.currentTarget.clientWidth);
      const distance = start.x - event.clientX;
      move(startIndex + (Math.abs(distance) > 35 ? Math.sign(distance) : 0));
    }} onLostPointerCapture={event => {
      if (!drag.current) return;
      drag.current = null; event.currentTarget.style.scrollSnapType = "";
      move(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth));
    }}>
      {slides.map((slide, i) => <div key={slide.id} className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}: ${slide.name}`}>
        <ProductImage src={slide.image!} alt={`${slide.brand} ${slide.name}`} fill sizes="(max-width: 700px) 90vw, 48vw" priority={priority && i === 0} draggable={false}/>
      </div>)}
    </div>
    {slides.length > 1 && <>
      <button className={styles.previous} onClick={() => move(index - 1)} disabled={index === 0} aria-label="Previous flavor">‹</button>
      <button className={styles.next} onClick={() => move(index + 1)} disabled={index === slides.length - 1} aria-label="Next flavor">›</button>
      <div className={styles.dots} aria-label="Choose flavor photo">{slides.map((slide, i) => <button key={slide.id} onClick={() => move(i)} aria-label={`Show ${slide.name}`} aria-current={i === index ? "true" : undefined}/>)}</div>
      <span className={styles.count} role="status">{index + 1} / {slides.length}</span>
    </>}
  </section>;
}
