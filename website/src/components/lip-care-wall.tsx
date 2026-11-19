"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import styles from "./lip-care-wall.module.css";

export default function LipCareWall({ cards }: { cards: ReactNode[] }) {
  const [paused, setPaused] = useState(false);
  const rows = Array.from({ length: Math.min(3, cards.length) }, (_, row) =>
    cards.filter((_, index) => index % Math.min(3, cards.length) === row));

  return (
    <section className={styles.wall} data-paused={paused} aria-label="Explore the lip care collection">
      <header className={styles.heading}>
        <div><span>YOUR DAILY DOSE OF COLOUR & CARE</span><h2>Lip care <em>to love.</em></h2></div>
        <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
          {paused ? "Play motion" : "Pause motion"}
        </button>
      </header>
      {rows.map((row, index) => (
        <div className={styles.row} key={index} tabIndex={0} aria-label={`Lip care product row ${index + 1}. Scroll sideways to browse.`}>
          <div className={styles.track} style={{ "--duration": `${Math.max(25, row.length * 9)}s` } as CSSProperties}>
            <div className={styles.group}>{row.map((card, i) => <div className={styles.tile} key={i}>{card}</div>)}</div>
            <div className={styles.group} data-copy="true">{row.map((card, i) => <div className={styles.tile} key={i}>{card}</div>)}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
