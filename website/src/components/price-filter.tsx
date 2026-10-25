"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

export default function PriceFilter({ maximum, active, onApply, onReset }: { maximum: number; active: boolean; onApply: (range: [number, number]) => void; onReset: () => void }) {
  const [open, setOpen] = useState(true);
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(maximum);
  const id = useId();
  return <aside className="price-filter" aria-label="Filter products by price"><button className="price-filter-heading" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>Pricing {open ? <Minus size={19}/> : <Plus size={19}/>}</button>
    <div id={id} hidden={!open}><form onSubmit={event => {event.preventDefault();onApply([minimumPrice, maximumPrice]);}}>
      <div className="price-slider"><div className="price-slider-track"/><div className="price-slider-selection" style={{ left: `${minimumPrice / maximum * 100}%`, right: `${100 - maximumPrice / maximum * 100}%` }}/><input aria-label="Minimum price in taka" type="range" min={0} max={maximum} step={1} value={minimumPrice} onChange={event => setMinimumPrice(Math.min(Number(event.target.value), maximumPrice))} style={{ zIndex: minimumPrice >= maximum * .9 ? 4 : 2 }}/><input aria-label="Maximum price in taka" type="range" min={0} max={maximum} step={1} value={maximumPrice} onChange={event => setMaximumPrice(Math.max(Number(event.target.value), minimumPrice))}/></div>
      <div className="price-filter-values"><label>From: ৳<input aria-label="Minimum price amount" type="number" min={0} max={maximumPrice} step={1} value={minimumPrice} onChange={event => setMinimumPrice(Math.max(0, Math.min(Number(event.target.value), maximumPrice)))}/></label><label>To: ৳<input aria-label="Maximum price amount" type="number" min={minimumPrice} max={maximum} step={1} value={maximumPrice} onChange={event => setMaximumPrice(Math.max(minimumPrice, Math.min(Number(event.target.value), maximum)))}/></label></div>
      <button className="price-filter-apply" type="submit">Apply Price Filter</button>{active && <><button className="price-filter-reset" type="button" onClick={() => {setMinimumPrice(0);setMaximumPrice(maximum);onReset();}}>Reset price filter</button><p className="price-filter-note">Products with prices coming soon are hidden.</p></>}
    </form></div>
  </aside>;
}
