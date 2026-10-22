"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "Skincare", section: "skincare", types: ["Cleansers", "Toners", "Serums", "Moisturizers", "Sunscreen"], queries: ["cleanser", "toner", "serum", "moisturizer", "sunscreen"] },
  { name: "Body Care", section: "body-care", types: ["Body Wash", "Lotions", "Scrubs", "Hand & Foot Care"], queries: ["wash", "lotion", "scrub", "hand foot"] },
  { name: "Hair Care", section: "hair-care", types: ["Shampoo", "Conditioner", "Hair Masks", "Hair Oils"], queries: ["shampoo", "conditioner", "mask", "oil"] },
];

export default function CategoryMenu({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  function close() { setOpen(false); setActive(null); onNavigate(); }
  return <div className="category-navigation" onPointerEnter={event => { if (event.pointerType === "mouse") setOpen(true); }} onPointerLeave={event => { if (event.pointerType === "mouse" && !event.currentTarget.contains(document.activeElement)) setOpen(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => { if (event.key === "Escape") { setOpen(false); event.currentTarget.querySelector("button")?.focus(); } }}>
    <button className="shop-toggle" aria-expanded={open} aria-controls="category-navigation-menu" onClick={() => setOpen(!open)}>SHOP BY CATEGORY <ChevronDown size={16}/></button>
    {open && <div id="category-navigation-menu" className="category-navigation-menu">
      {categories.map(category => <div className="category-navigation-row" key={category.section} onPointerEnter={event => { if (event.pointerType === "mouse") setActive(category.section); }}>
        <button aria-expanded={active === category.section} aria-controls={`category-${category.section}`} onClick={() => setActive(active === category.section ? null : category.section)}>{category.name}<ChevronRight size={16}/></button>
        {active === category.section && <div id={`category-${category.section}`} className="category-navigation-types">
          <Link href={`/shop/${category.section}`} onClick={close}>All {category.name}</Link>
          {category.types.map((type, index) => <Link key={type} href={`/shop/${category.section}?q=${encodeURIComponent(category.queries[index])}`} onClick={close}>{type}</Link>)}
        </div>}
      </div>)}
      <Link href="/shop/collection" onPointerEnter={() => setActive(null)} onClick={close}>View All Products</Link>
    </div>}
  </div>;
}
