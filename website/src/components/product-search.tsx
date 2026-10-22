"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import { searchProducts } from "@/lib/catalog/search";

export default function ProductSearch({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => query.trim() ? searchProducts(products, query) : [], [products, query]);
  return <section className="product-search" aria-label="Product search" onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
    <form action="/search" role="search" className="product-search-form"><Search size={21}/><label className="screen-reader-only" htmlFor="product-search-input">Search products, brands or categories</label><input id="product-search-input" name="q" autoFocus autoComplete="off" maxLength={160} placeholder="Search products, brands or categories…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {if(event.key === "ArrowDown"){event.preventDefault();event.currentTarget.closest("section")?.querySelector<HTMLAnchorElement>(".search-suggestion")?.focus();}}}/>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16}/></button>}<button className="search-submit" type="submit">Search <ArrowRight size={16}/></button><button type="button" aria-label="Close search" onClick={onClose}><X size={21}/></button></form>
    {!query.trim() ? <div className="search-popular"><span>Explore</span>{["CeraVe", "The Ordinary", "Moisturizer", "Sunscreen", "Hair care"].map(term => <button key={term} onClick={() => setQuery(term)}>{term}</button>)}</div> : <>
      <p className="search-match-count" role="status">{matches.length} {matches.length === 1 ? "product" : "products"} found</p>
      {matches.length ? <><ul className="search-suggestions">{matches.slice(0, 5).map(product => <li key={product.id}><Link className="search-suggestion" href={`/products/${encodeURIComponent(product.id)}`} onClick={onClose}><span className="search-thumb">{product.image ? <Image src={product.image} alt="" fill sizes="48px"/> : <ShoppingPlaceholder/>}</span><span><small>{product.brand} · {product.category}</small><strong>{product.name}</strong>{product.size && <small>{product.size}</small>}</span><span className="search-price">{product.price != null ? `৳${product.price.toLocaleString("en-US")}` : "Price coming soon"}</span></Link></li>)}</ul><Link className="search-all" href={`/search?q=${encodeURIComponent(query.trim())}`} onClick={onClose}>View all {matches.length} results <ArrowRight size={16}/></Link></> : <p className="search-no-results">Try a different spelling, a brand name, or a category such as “hair care”.</p>}
    </>}
  </section>;
}

function ShoppingPlaceholder() { return <Search size={20}/>; }
