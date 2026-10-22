"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import { searchProducts } from "@/lib/catalog/search";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products", { signal: controller.signal }).then(response => response.json()).then(catalog => {
      if (!Array.isArray(catalog.products)) throw new Error("Catalog unavailable");
      setProducts(catalog.products);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  const matches = useMemo(() => query.trim() && products ? searchProducts(products, query) : [], [products, query]);
  const showResults = open && Boolean(query.trim());
  return <div className="header-search-container" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => {
    if (event.key === "Escape") { inputRef.current?.focus(); setOpen(false); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const links = Array.from(resultsRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
      if (!links.length) return;
      event.preventDefault();
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (event.key === "ArrowUp" && index <= 0) inputRef.current?.focus();
      else links[Math.min(links.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))]?.focus();
    }
  }}>
  <form action="/search" role="search" aria-label="Search products" className="header-product-search" onSubmit={() => setOpen(false)}>
    <input ref={inputRef} type="search" role="combobox" aria-haspopup="listbox" name="q" aria-label="Search for products" aria-expanded={showResults} aria-controls="header-product-results" aria-autocomplete="list" autoComplete="off" placeholder="Search for products…" maxLength={160} required value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }}/>
    <button type="submit" aria-label="Submit product search"><Search size={20}/></button>
  </form>
  {showResults && <div id="header-product-results" className="header-live-results" ref={resultsRef}>
    <p className="header-results-status" role="status">{failed ? "Suggestions unavailable. Press Enter to search." : products == null ? "Loading products…" : matches.length ? `${matches.length} products found` : "No products found. Try a different name or brand."}</p>
    {matches.length > 0 && <><ul>{matches.slice(0, 6).map(product => <li key={product.id}><Link href={`/products/${encodeURIComponent(product.id)}`} onClick={() => setOpen(false)}><span><small>{product.brand}</small><strong>{product.name}</strong></span>{product.price != null && <span className="header-result-price">৳{product.price.toLocaleString("en-US")}</span>}</Link></li>)}</ul><Link className="header-view-results" href={`/search?q=${encodeURIComponent(query.trim())}`} onClick={() => setOpen(false)}>View all results</Link></>}
  </div>}
  </div>;
}
