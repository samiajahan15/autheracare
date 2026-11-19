"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import ProductImage from "./product-image";
import ProductPrice from "./product-price";
import styles from "./routine-showcase.module.css";

type Step = { step: string; product: Product; number: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export default function RoutineShowcase({ routine }: { routine: Step[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = section.current;
      if (!node) return;
      setMobile(window.innerWidth <= 700);
      const rect = node.getBoundingClientRect();
      setProgress(clamp(-rect.top / Math.max(1, node.offsetHeight - window.innerHeight)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const preference = () => { setReducedMotion(query.matches); schedule(); };
    preference();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    query.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      query.removeEventListener("change", preference);
    };
  }, []);

  const p = reducedMotion ? 1 : progress;
  const opening = ease((p - .025) / .19);
  const lineup = ease((p - .84) / .13);
  const reveal = ease((p - .13) / .1);
  const focusPosition = (p - .28) / .54 * routine.length;
  const focused = Math.max(0, Math.min(routine.length - 1, Math.floor(focusPosition)));
  const closeups = p >= .27 && p < .85;
  const current = routine[focused];
  const tones = ["#edf4ee", "#eee9f0", "#f4dfca", "#edcbb8", "#f3d4d9"];
  const flowerScale = 1 + opening * .32 - ease((p - .24) / .12) * .72 + lineup * .3;
  const flowerY = opening * 70 + ease((p - .24) / .12) * 210;
  const flowerOpacity = 1 - ease((p - .3) / .08) + lineup;

  return (
    <section ref={section} className={styles.section} data-reduced-motion={reducedMotion || undefined}
      aria-label="Explore five steps, one routine">
      <div ref={stage} className={styles.stage}
        style={{ backgroundColor: closeups ? tones[focused % tones.length] : "#f5e9e9" }}
        onPointerMove={event => {
          if (reducedMotion || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--cursor-x", `${((event.clientX - rect.left) / rect.width - .5) * 20}px`);
          event.currentTarget.style.setProperty("--cursor-y", `${((event.clientY - rect.top) / rect.height - .5) * 28}px`);
        }}
        onPointerLeave={event => {
          event.currentTarget.style.setProperty("--cursor-x", "0px");
          event.currentTarget.style.setProperty("--cursor-y", "0px");
        }}>
        <div className={styles.flower} aria-hidden="true" style={{
          transform: `translate(-50%, -50%) translateY(${flowerY}px) scale(${flowerScale})`,
          opacity: clamp(flowerOpacity),
        }}>
          <div className={styles.heart} />
          {Array.from({ length: 24 }, (_, index) => {
            const ring = Math.floor(index / 8);
            const angle = index % 8 * 45 + ring * 22;
            return <span key={index} className={styles.petal} style={{
              "--angle": `${angle}deg`,
              "--spread": `${22 + opening * (100 - ring * 22)}px`,
              "--unfold": `${15 + opening * (65 - ring * 12)}deg`,
              "--petal-scale": 1 - ring * .15,
              zIndex: 24 - index,
            } as CSSProperties} />;
          })}
        </div>

        <header className={styles.intro} style={{ opacity: 1 - ease((p - .19) / .08), pointerEvents: "none" }}>
          <span className={styles.kicker}>THE EVERYDAY RITUAL</span>
          <h2>Complete care.<br /><em>In full bloom.</em></h2>
          <p>Five essentials. One beautiful routine.</p>
        </header>

        <header className={styles.lineupHeading} style={{ opacity: lineup }}>
          <h2>Five steps, <em>one routine.</em></h2>
          <p>Your everyday essentials, thoughtfully brought together.</p>
        </header>

        <div className={styles.products}>
          {routine.map(({ step, product, number }, index) => {
            const focus = ease(1 - Math.abs(focusPosition - (index + .5)) / .7);
            const closeupWeight = focus * (1 - lineup);
            const spread = opening * (1 - ease((p - .24) / .08));
            const x = (index - (routine.length - 1) / 2) * (100 / routine.length);
            const finalX = mobile ? (index % 3 - 1) * 30 : x;
            const finalY = mobile ? 30 + Math.floor(index / 3) * 35 : 47;
            const opacity = reducedMotion ? 1 : Math.max(reveal * (1 - ease((p - .23) / .06)), closeupWeight, lineup);
            return (
              <article className={styles.product} key={product.id} data-routine-product
                aria-hidden={opacity < .1} style={{
                  left: `${50 + x * spread * .65 + finalX * lineup + closeupWeight * 17}%`,
                  top: `${52 + (finalY - 52) * lineup}%`,
                  opacity,
                  transform: `translate(-50%, -50%) translateY(${(1 - reveal) * 110}px) scale(${.48 + closeupWeight * .9 + lineup * .14})`,
                  zIndex: Math.round(closeupWeight * 10) + 2,
                  pointerEvents: opacity > .5 ? "auto" : "none",
                } as CSSProperties}>
                <Link className={styles.productLink} href={`/products/${encodeURIComponent(product.id)}`}
                  tabIndex={opacity > .5 ? 0 : -1} aria-label={`View ${product.brand} ${product.name}`}>
                  <div className={styles.art}>
                    {product.image && <ProductImage src={product.image} alt={`${product.brand} ${product.name}`}
                      width={360} height={420} sizes="(max-width: 600px) 65vw, 30vw" draggable={false} />}
                  </div>
                  <div className={styles.productLabel} style={{ opacity: lineup }}>
                    <span>{product.brand}</span>
                    <h3>{product.name}</h3>
                    <ProductPrice product={product} />
                    <span className={styles.button}>View product ↗</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {current && <div className={styles.detail} style={{ opacity: closeups ? 1 : 0, pointerEvents: closeups ? "auto" : "none" }}>
          <div key={current.product.id} className={styles.detailContent}>
            <span className={styles.kicker}>STEP {current.number} · {current.step}</span>
            <h2>{current.product.name}</h2>
            <p>{current.product.brand}{current.product.size ? ` · ${current.product.size}` : ""}</p>
            <Link className={styles.button} href={`/products/${encodeURIComponent(current.product.id)}`}
              tabIndex={closeups ? 0 : -1}>Explore product ↗</Link>
          </div>
        </div>}

        <div className={styles.navigation} aria-label="Routine progress">
          <span>{p < .27 ? "Scroll to unfold" : lineup > .5 ? "Your complete routine" : current?.step}</span>
          <div className={styles.progress}><span style={{ transform: `scaleX(${p})` }} /></div>
        </div>
      </div>
    </section>
  );
}
