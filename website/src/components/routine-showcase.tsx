import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import ProductImage from "./product-image";
import ProductPrice from "./product-price";

type Step = { step: string; product: Product; number: number };

export default function RoutineShowcase({ routine }: { routine: Step[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [active, setActive] = useState(0);
  const [closeUp, setCloseUp] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [replay, setReplay] = useState(0);
  const featured = routine[closeUp]?.product;

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const finished = closeUp === routine.length - 1;
  useEffect(() => {
    if (!visible || active !== 0 || paused || finished || !routine.length) return;
    const timer = window.setTimeout(() => setCloseUp(closeUp + 1), closeUp < 0 ? 1250 : 3700);
    return () => window.clearTimeout(timer);
  }, [active, closeUp, finished, paused, replay, routine.length, visible]);

  function goTo(index: number) {
    const node = track.current;
    if (!node) return;
    const target = Math.max(0, Math.min(routine.length, index));
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
    goTo(target);
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
        goTo(active + (event.key === "ArrowRight" ? 1 : -1));
      }}
      onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
      onPointerLeave={event => { if (!drag.current?.moved) endDrag(event); }}
      onClickCapture={event => {
        if (event.detail && suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      }}>
      <article className="routine-scene routine-scene-intro">
        <div className="routine-scene-copy">
          <span className="section-kicker">THE EVERYDAY EDIT</span>
          <h3>A complete routine, in bloom</h3>
          <p>Five essentials for your everyday routine.</p>
          <button type="button" onClick={() => goTo(1)}>Explore the routine <ChevronRight size={16}/></button>
          {featured && <div className="routine-reveal-details" key={featured.id}>
            <span className="section-kicker">STEP {closeUp + 1} · {routine[closeUp].step}</span>
            <h4><Link href={`/products/${encodeURIComponent(featured.id)}`}>{featured.name}</Link></h4>
            <p>{featured.brand}{featured.size ? ` · ${featured.size}` : ""}</p>
            <ProductPrice product={featured}/>
          </div>}
        </div>
        <div className="routine-closeup">
          <div className="routine-scene-art routine-flower-reveal">
            <div className="routine-flower" data-blooming={visible && active === 0} key={replay} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ rotate: `${index * 30}deg` }}/>)}
            </div>
            {featured?.image && <ProductImage key={featured.id} src={featured.image} alt={`${featured.brand} ${featured.name}`} width={460} height={460} draggable={false}/>}
          </div>
          <div className="routine-steps" aria-label="Close-up controls">
            <button type="button" disabled={closeUp <= 0} onClick={() => { setPaused(true); setCloseUp(index => index - 1); }} aria-label="Previous product close-up"><ChevronLeft size={16}/></button>
            <button type="button" onClick={() => {
              if (finished) { setCloseUp(-1); setPaused(false); setReplay(value => value + 1); }
              else setPaused(value => !value);
            }}>{finished ? "Replay" : paused ? "Resume" : "Pause"}</button>
            <button type="button" disabled={finished} onClick={() => { setPaused(true); setCloseUp(index => index + 1); }} aria-label="Next product close-up"><ChevronRight size={16}/></button>
          </div>
        </div>
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
      <button type="button" aria-label="Previous scene" disabled={active === 0} onClick={() => goTo(active - 1)}><ChevronLeft size={19}/></button>
      <div className="routine-steps" aria-label="Choose a routine scene">
        {["Overview", ...routine.map(({ step }) => step)].map((label, index) => <button type="button" key={label} aria-label={label} aria-current={index === active ? "step" : undefined} onClick={() => goTo(index)}>{index || "Start"}</button>)}
      </div>
      <button type="button" aria-label="Next scene" disabled={active === routine.length} onClick={() => goTo(active + 1)}><ChevronRight size={19}/></button>
      <a href="#daily-routine-products">Shop the lineup</a>
    </div>
  </section>;
}
