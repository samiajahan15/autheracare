"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import styles from "./hot-selling-marquee.module.css";

export default function HotSellingMarquee({ cards }: { cards: ReactNode[] }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.marquee} data-paused={paused}>
      <button className={styles.toggle} type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
        {paused ? "▶ Play" : "Ⅱ Pause"}
        <span className="screen-reader-only"> product movement</span>
      </button>
      <div className={styles.viewport} aria-label="Hot selling products" onPointerDown={event => { if (event.pointerType === "touch") setPaused(true); }}>
        <div className={styles.track} style={{ "--duration": `${Math.max(30, cards.length * 9)}s` } as CSSProperties}>
          {[0, 1].map(copy => (
            <div className={styles.group} key={copy} data-copy={copy === 1 || undefined}>
              {cards.map((card, index) => <div className={styles.item} key={index}>{card}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
