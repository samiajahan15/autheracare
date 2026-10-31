"use client";

import Image from "next/image";
import ProductImage from "./product-image";
import Link from "next/link";
import { Pause, Play, Sun, ShieldCheck, Umbrella } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import styles from "./winter-care-motion.module.css";
import motionImages from "@/lib/catalog/motion-images.json";

// Only verified cutouts belong on the moving track; catalog posters stay on cards.
const transparentImages = new Set(motionImages.transparentImages);
const motionOverrides: Record<string, string> = motionImages.overrides;

export default function WinterCareMotion({ products, season = "Winter" }: { products: Product[]; season?: string }) {
  const available = products.flatMap(product => {
    // Present EOS as its complete multipack, once, rather than cycling flavours.
    if (product.brand === "EOS" && product.id.endsWith("-single")) return [];
    if (!product.image) return [];
    const image = motionOverrides[product.image] || (transparentImages.has(product.image) ? product.image : undefined);
    return image ? [{ ...product, image }] : [];
  });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const signature = available.map(product => product.id).join("|");
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => { media.removeEventListener("change", update); observer.disconnect(); };
  }, []);
  const running = !paused && !reducedMotion && visible;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (running) void video.play().catch(() => { /* The poster remains if playback is unavailable. */ });
    else video.pause();
    return () => video.pause();
  }, [running, season]);
  useEffect(() => {
    if (!running || available.length < 2) return;
    const timer = window.setInterval(() => setIndex(value => value + 1), 4200);
    return () => window.clearInterval(timer);
  }, [running, available.length, signature]);
  if (!available.length) return null;
  const product = available[index % available.length];
  return <div ref={ref} className={styles.scene} data-season={season} data-running={running} data-reduced={reducedMotion}>
    {(season === "Autumn" || season === "Summer" || season === "Monsoon" || season === "Spring") && <>
      <video ref={videoRef} className={season === "Spring" ? styles.springVideo : season === "Summer" ? styles.summerVideo : season === "Monsoon" ? styles.monsoonVideo : styles.autumnVideo} muted loop playsInline preload="none" poster={`/videos/seasonal/${season === "Summer" ? "summer-poster-v2" : season === "Autumn" ? "autumn-poster-v2" : season === "Monsoon" ? "monsoon-poster-v3" : `${season.toLowerCase()}-poster`}.webp`} aria-hidden="true" tabIndex={-1}>
        {visible && !reducedMotion && <source src={`/videos/seasonal/${season === "Spring" ? "spring-garden" : season === "Summer" ? "summer-shore-v2" : season === "Monsoon" ? "monsoon-rain-v3" : "autumn-leaves-v2"}.webm`} type="video/webm"/>}
      </video>
      <div className={season === "Spring" ? styles.springVeil : season === "Summer" ? styles.summerVeil : season === "Monsoon" ? styles.monsoonVeil : styles.autumnVeil} aria-hidden="true"/>
    </>}
    <div className={styles.snow} aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-i * .7}s`, animationDuration: `${6 + i % 5}s` }}/>)}</div>
    {season === "Summer" && <>
      <div className={styles.sunlight} aria-hidden="true"/>
      <div className={styles.shoreWaves} aria-hidden="true"><i/><i/><i/></div>
      <div className={styles.breeze} aria-hidden="true"><i/><i/><i/></div>
    </>}
    <p className={styles.kicker}>{season === "Summer" ? "THE SUNSHINE & GETAWAY EDIT" : season === "Winter" ? "YOUR COLD-WEATHER ESSENTIALS" : `YOUR ${season.toUpperCase()} ESSENTIALS`}</p>
    <h3>{season === "Summer" ? "Sunshine is calling." : season === "Autumn" ? "A little care for cooler days." : `${season} is loading!`}</h3>
    {season === "Summer" && <p className={styles.summerIntro}>Sun care for beach days, slow mornings & every sunny moment.</p>}
    <div className={styles.bar} aria-hidden="true">
      <div key={`${signature}-${index}`} className={styles.fill}/>
      <div key={`product-${signature}-${index}`} className={styles.traveller}>
        <ProductImage src={product.image!} alt="" fill sizes="100px"/>
      </div>
    </div>
    <Link className={styles.caption} href={`/products/${encodeURIComponent(product.id)}`}>
      <span>{product.brand}</span><strong>{product.name}</strong><small>{product.size}</small>
    </Link>
    {season === "Summer" && <div className={styles.summerDetails}><span><ShieldCheck size={15}/>Sun protection</span><span><Sun size={15}/>Lightweight hydration</span><span><Umbrella size={15}/>Vacation essentials</span></div>}
    <button type="button" className={styles.toggle} aria-label={`${paused ? "Play" : "Pause"} ${season.toLowerCase()} product animation`} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16}/> : <Pause size={16}/>}<span>{paused ? "Play" : "Pause"}</span></button>
  </div>;
}



