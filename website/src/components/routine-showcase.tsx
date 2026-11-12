import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import ProductImage from "./product-image";

type Step = { step: string; product: Product; number: number };

export default function RoutineShowcase({ routine }: { routine: Step[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [playingSequence, setPlayingSequence] = useState(false);

  useEffect(() => {
    if (active !== 0) video.current?.pause();
  }, [active]);

  useEffect(() => {
    if (!playingSequence || active === 0 || active >= routine.length) return;
    const timer = window.setTimeout(() => goTo(active + 1), 4500);
    return () => window.clearTimeout(timer);
  }, [active, playingSequence, routine.length]);

  function selectScene(index: number) {
    setPlayingSequence(false);
    goTo(index);
  }
  function goTo(index: number) {
    const node = track.current;
    if (!node) return;
    const target = Math.max(0, Math.min(node.children.length - 1, index));
    node.scrollTo({
      left: target * node.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const distance = event.clientX - gesture.x;
    if (!gesture.moved && Math.abs(distance) < 8) return;
    const node = event.currentTarget;
    if (!gesture.moved) {
      gesture.moved = true;
      node.setPointerCapture(event.pointerId);
      node.dataset.dragging = "true";
    }
    node.scrollLeft = gesture.left - distance;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    drag.current = null;
    if (!gesture?.moved) return;
    const node = event.currentTarget;
    const distance = event.clientX - gesture.x;
    const start = Math.round(gesture.left / node.clientWidth);
    const target = Math.abs(distance) > 40 && Math.abs(distance) < node.clientWidth / 2
      ? start - Math.sign(distance)
      : Math.round(node.scrollLeft / node.clientWidth);
    suppressClick.current = true;
    delete node.dataset.dragging;
    selectScene(target);
  }

  return <section className="routine-showcase" aria-label="Explore the daily routine">
    <div className="routine-track" ref={track} tabIndex={0} aria-label="Routine scenes. Use the left and right arrow keys to browse."
      onScroll={event => {
        const node = event.currentTarget;
        if (node.clientWidth) setActive(Math.round(node.scrollLeft / node.clientWidth));
      }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        selectScene(active + (event.key === "ArrowRight" ? 1 : -1));
      }}
      onWheel={() => setPlayingSequence(false)}
      onPointerDown={event => {
        setPlayingSequence(false);
        startDrag(event);
      }} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
      onPointerLeave={event => { if (!drag.current?.moved) endDrag(event); }}
      onClickCapture={event => {
        if (event.detail && suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      }}>
      <article className="routine-scene routine-scene-intro">
        <p className="routine-video-title">Five steps One routine</p>
        <video ref={video} className="routine-video" width={1280} height={720} controls autoPlay muted playsInline preload="metadata"
          onEnded={() => {
            setPlayingSequence(true);
            goTo(1);
          }}
          aria-label="Daily essentials video" onPointerDown={event => event.stopPropagation()}>
          <source src="/daily-essentials.mp4" type="video/mp4"/>
        </video>
      </article>
      {routine.map(({ step, product, number }) => <article className="routine-scene" data-step={number} key={product.id}>
        <div className="routine-scene-copy">
          <span className="section-kicker">STEP {number} · {step}</span>
          <h3>{product.name}</h3>
          <p>{product.brand}{product.size ? ` · ${product.size}` : ""}</p>
          <Link href={`/products/${encodeURIComponent(product.id)}`}>View product <ChevronRight size={16}/></Link>
        </div>
        <div className="routine-scene-art">
          {product.image && <ProductImage src={product.image} alt={`${product.brand} ${product.name}`} width={460} height={460} draggable={false}/>}
        </div>
      </article>)}
    </div>
    <div className="routine-controls">
      <button type="button" aria-label="Previous scene" disabled={active === 0} onClick={() => selectScene(active - 1)}><ChevronLeft size={19}/></button>
      <div className="routine-steps" aria-label="Choose a routine scene">
        {["Overview", ...routine.map(({ step }) => step)].map((label, index) => <button type="button" key={label} aria-label={label} aria-current={index === active ? "step" : undefined} onClick={() => selectScene(index)}>{index || "Start"}</button>)}
      </div>
      <button type="button" aria-label="Next scene" disabled={active === routine.length} onClick={() => selectScene(active + 1)}><ChevronRight size={19}/></button>
    </div>
  </section>;
}
