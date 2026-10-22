"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sectionHref } from "@/lib/catalog/sections";
import { normalizeSearch, searchProducts } from "@/lib/catalog/search";
import seed from "@/lib/catalog/seed.json";
import brandLogos from "@/lib/catalog/brand-logos.json";
import CategoryMenu from "./category-menu";
import CartContents from "./cart-contents";
import Journal from "./journal";
import type { Product } from "@/lib/catalog/types";

import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, Menu, X, ChevronDown, Heart, Plus, Minus, ChevronUp, ChevronRight, ShieldCheck } from "lucide-react";

function CampaignVideo({ src, title, onShop }: { src: string; title: string; onShop: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedPlays = useRef(0);
  const stopped = useRef(false);
  function stopVideo() {
    stopped.current = true;
    videoRef.current?.pause();
  }
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reducedMotion && !stopped.current && completedPlays.current < 3) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.15 });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, []);
  return <div className="campaign-panel">
    <video ref={videoRef} muted playsInline preload="metadata" aria-label={`Authera ${title} campaign`} onEnded={event => {
      completedPlays.current += 1;
      if (completedPlays.current >= 3 || stopped.current) { event.currentTarget.pause(); return; }
      event.currentTarget.currentTime = 0;
      void event.currentTarget.play().catch(() => {});
    }}>
      <source src={src} type="video/mp4" />
    </video>
    <button className="campaign-pause-target" aria-label={`Pause ${title} video`} onClick={stopVideo}/>
    <div className="campaign-caption"><h2>{title}</h2><a href="#collection" onClick={onShop}>Shop now<span className="screen-reader-only"> — {title}</span></a></div>
  </div>;
}

function FacebookIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9h4Z" /></svg>;
}
function InstagramIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
const tabs = ["Featured products", "Face care", "Body care", "Hair care", "Lip care", "Perfume", "Wellness", "Oral care", "Accessories", "Sets"] as const;
type Tab = typeof tabs[number];

export default function Home({ products, catalogUnavailable = false, categoryPage = false, title, initialTab = "Featured products", initialBrand = "", selectedProduct, searchPage = false, blogPage = false, initialQuery = "" }: { products: Product[]; catalogUnavailable?: boolean; categoryPage?: boolean; title?: string; initialTab?: Tab; initialBrand?: string; selectedProduct?: Product; searchPage?: boolean; blogPage?: boolean; initialQuery?: string }) {
  const router = useRouter();
  const brands = Array.from(new Set([...seed.brands, ...products.map(product => product.brand)]));
  const [tab, setTab] = useState<Tab>(initialTab);
  const [brand, setBrand] = useState(initialBrand);
  const [query] = useState(initialQuery);
  const [searchSort, setSearchSort] = useState("relevance");
  const [brandQuery, setBrandQuery] = useState("");
  const brandCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (brandCloseTimer.current) clearTimeout(brandCloseTimer.current); }, []);
  const matchedProductBrands = new Set(searchProducts(products, brandQuery).map(product => product.brand));
  const visibleMenuBrands = brands.filter(name => !brandQuery.trim() || normalizeSearch(name).includes(normalizeSearch(brandQuery)) || matchedProductBrands.has(name));
  const [menuOpen, setMenuOpen] = useState(false);
  const [navigationCompact, setNavigationCompact] = useState(false);
  const [navigationScrolling, setNavigationScrolling] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let lastScrollPosition = window.scrollY;
    let scrollDistance = 0;
    let direction = 0;
    const initialFrame = requestAnimationFrame(() => setNavigationCompact(window.scrollY > 60));
    const updateNavigation = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { setNavigationScrolling(false); scrollDistance = 0; }, 340);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const position = Math.max(0, window.scrollY);
        const delta = position - lastScrollPosition;
        lastScrollPosition = position;
        const nextDirection = Math.sign(delta);
        if (nextDirection && nextDirection !== direction) { scrollDistance = 0; direction = nextDirection; }
        scrollDistance += Math.abs(delta);
        setNavigationCompact(position > 60);
        const navigation = navigationRef.current;
        const interacting = navigation?.matches(":hover") || navigation?.contains(document.activeElement);
        if (position < 120 || interacting || (direction < 0 && scrollDistance >= 12)) setNavigationScrolling(false);
        else if (direction > 0 && scrollDistance >= 24) setNavigationScrolling(true);
      });
    };
    window.addEventListener("scroll", updateNavigation, { passive: true });
    return () => { window.removeEventListener("scroll", updateNavigation); clearTimeout(scrollTimer); cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame); };
  }, []);



  const [videoNavigation, setVideoNavigation] = useState({ current: 0, previous: 0 });
  const videoPage = videoNavigation.current;
  function setVideoPage(value: number | ((page: number) => number)) {
    setVideoNavigation(previous => {
      const current = typeof value === "function" ? value(previous.current) : value;
      return current === previous.current ? previous : { current, previous: previous.current };
    });
  }
  const videoShowcaseRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const showcase = videoShowcaseRef.current;
    if (!showcase) return;
    const active = showcase.querySelector<HTMLVideoElement>(".video-position-2 video");
    if (!active) return;
    showcase.querySelectorAll("video").forEach(video => video.pause());
    active.currentTime = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        void active.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
      } else {
        showcase.querySelectorAll("video").forEach(video => video.pause());
      }
    }, { threshold: 0.5 });
    observer.observe(active);
    return () => { observer.disconnect(); active.pause(); };
  }, [videoPage]);
  const [saved, setSaved] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [productQuantity, setProductQuantity] = useState(1);
  const [modal, setModal] = useState<"bag" | Product | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modal) { dialog.showModal(); const before = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { dialog.close(); document.body.style.overflow = before; }; }
    dialog.close();
  }, [modal]);
  const searching = query.trim().toLowerCase();
  const filtered = searchProducts(products, query).filter(p => (!brand || p.brand === brand) && (tab === "Featured products" || p.category === tab));
  if (searchSort === "price-low" || searchSort === "price-high") filtered.sort((first, second) => first.price == null ? (second.price == null ? 0 : 1) : second.price == null ? -1 : searchSort === "price-low" ? first.price - second.price : second.price - first.price);
  if (searchSort === "name") filtered.sort((first, second) => first.name.localeCompare(second.name));
  const shown = !categoryPage && tab === "Featured products" && !brand && !searching ? filtered.slice(0,4) : filtered;
  const count = Object.values(cart).reduce((total, n) => total + n, 0);
  function chooseTab(value: Tab) { setMenuOpen(false); router.push(sectionHref(value)); }
  function chooseBrand(value: string) {  setMenuOpen(false); router.push(`/shop/collection${value ? `?brand=${encodeURIComponent(value)}` : ""}`); }
  function adjust(id: string, delta: number) { setCart(prev => ({...prev,[id]:Math.max(0,(prev[id] || 0) + delta)})); }
  return <>
    {catalogUnavailable && <p role="status" style={{ padding: 12, textAlign: "center" }}>Live catalog temporarily unavailable. Showing a catalog preview; prices and availability must be confirmed.</p>}
    <div ref={navigationRef} className={`site-navigation${navigationCompact ? " navigation-compact" : ""}${navigationScrolling && !menuOpen ? " navigation-scrolling" : ""}`}>
    <header className="masthead">
      <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
    </header>
    <nav className={`main-nav ${menuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
      <Link href="/shop/featured" onClick={() => setMenuOpen(false)}>FEATURED</Link>
      <CategoryMenu onNavigate={() => setMenuOpen(false)}/>
      <details className="shop-by-brands nav-brands-menu" onPointerEnter={event => {if(event.pointerType === "mouse"){if(brandCloseTimer.current)clearTimeout(brandCloseTimer.current);event.currentTarget.open = true;}}} onPointerLeave={event => {if(event.pointerType === "mouse"){const menu = event.currentTarget;if(brandCloseTimer.current)clearTimeout(brandCloseTimer.current);brandCloseTimer.current = setTimeout(() => {menu.open = false;}, 200);}}} onBlur={event => {if(!event.currentTarget.contains(event.relatedTarget))event.currentTarget.open = false;}} onKeyDown={event => {if(event.key === "Escape"){event.stopPropagation();event.currentTarget.open = false;event.currentTarget.querySelector("summary")?.focus();}}}><summary aria-label="Expand brands submenu">Brands <ChevronRight size={16}/></summary><div><label className="brand-menu-search"><span>Find a brand</span><input type="search" value={brandQuery} onChange={event => setBrandQuery(event.target.value)} placeholder="Search brands or products…" maxLength={160}/></label><Link className="brand-menu-all" href="/shop/collection" onClick={() => {setMenuOpen(false);}}>All brands</Link>{!visibleMenuBrands.length && <p className="brand-menu-empty" role="status">No matching brands or products.</p>}{visibleMenuBrands.map(b => <Link className="brand-logo-tile" key={b} href={`/shop/collection?brand=${encodeURIComponent(b)}`} aria-label={`Shop ${b}`} title={b} onClick={() => {setMenuOpen(false);}}>{(brandLogos as Record<string, string>)[b] ? <Image src={(brandLogos as Record<string, string>)[b]} alt="" width={64} height={64}/> : <span className="brand-logo-fallback" aria-hidden="true">{b.slice(0, 2).toUpperCase()}</span>}<span className="brand-logo-name">{b}</span></Link>)}</div></details>
      <Link href="/shop/lip-makeup" onClick={() => setMenuOpen(false)}>LIP & MAKEUP</Link>
      <Link href="/shop/perfume" onClick={() => setMenuOpen(false)}>PERFUME</Link>
      <Link href="/blog" aria-current={blogPage ? "page" : undefined} onClick={() => setMenuOpen(false)}>BLOG</Link>
      <div className="nav-account-actions"><Link className="header-login" href="/signin" prefetch>Log in</Link><button className="icon-button" aria-label={`Open bag, ${count} items`} aria-haspopup="dialog" aria-expanded={modal === "bag"} onClick={() => setModal("bag")}><ShoppingBag size={21}/><span className="bag-count">{count}</span></button></div>
    </nav>
    </div>
    <main>
      {!categoryPage && !blogPage && <section className="campaign-hero" aria-label="Discover Authera">
        <CampaignVideo src="/videos/authera-campaign-1.mp4" title="Skincare & Rituals" onShop={() => {setBrand(""); chooseTab("Face care");}} />
        <CampaignVideo src="/videos/authera-campaign-2.mp4" title="Beauty & Essentials" onShop={() => {setBrand(""); chooseTab("Featured products");}} />
        <div className="campaign-wordmark" aria-label="Authéra">Authéra</div>
      </section>}
      {blogPage ? <Journal standalone/> : selectedProduct ? <section className="product-page" aria-labelledby="product-title">
        <nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={sectionHref(selectedProduct.category)}>{selectedProduct.category}</Link><span>/</span><span aria-current="page">{selectedProduct.name}</span></nav>
        <div className="product-page-grid">
          <div className="product-page-photo">{selectedProduct.image ? <Image src={selectedProduct.image} alt={`${selectedProduct.brand} ${selectedProduct.name}`} fill sizes="(max-width: 700px) 90vw, 48vw" priority /> : <span>Product photo coming soon</span>}</div>
          <div className="product-page-info"><Link className="product-page-brand" href={`/shop/collection?brand=${encodeURIComponent(selectedProduct.brand)}`}>{selectedProduct.brand}</Link><h1 id="product-title">{selectedProduct.name}</h1><Link className="category-label" href={sectionHref(selectedProduct.category)}>{selectedProduct.category}</Link>
            <p className="product-price">{selectedProduct.price != null ? `৳${selectedProduct.price.toLocaleString("en-US")}` : "Price coming soon"}</p>
            <p className="product-page-size">Size: <strong>{selectedProduct.size || "Details coming soon"}</strong></p>
            <div className="product-offer"><ShoppingBag size={21}/><div><strong>Your everyday care, from {selectedProduct.brand}</strong><p>Ask us about current availability and delivery options.</p></div></div>
            <div className="product-purchase"><div className="product-quantity" role="group" aria-label="Product quantity"><button aria-label="Decrease quantity" disabled={productQuantity === 1} onClick={() => setProductQuantity(quantity => Math.max(1, quantity - 1))}><Minus size={16}/></button><output aria-live="polite" aria-label="Quantity">{productQuantity}</output><button aria-label="Increase quantity" disabled={productQuantity === 99} onClick={() => setProductQuantity(quantity => Math.min(99, quantity + 1))}><Plus size={16}/></button></div><button className="product-page-add" onClick={() => adjust(selectedProduct.id, productQuantity)}>ADD TO PREVIEW BAG <ShoppingBag size={18}/></button></div><p className="product-page-note" role="status">{cart[selectedProduct.id] ? `${cart[selectedProduct.id]} added to your preview bag. Checkout is coming soon.` : "Checkout is coming soon. Contact us to confirm availability."}</p>
            <details className="product-description-panel" open><summary>Brief description <ChevronDown size={17}/></summary><p className="product-page-description">{selectedProduct.description || "We’re preparing the full description for this product. Contact us for more information."}</p></details>
            <dl className="product-facts"><div><dt>Product ID</dt><dd>{selectedProduct.id}</dd></div><div><dt>Categories</dt><dd><Link href={sectionHref(selectedProduct.category)}>{selectedProduct.category}</Link></dd></div><div><dt>Brand</dt><dd><Link href={`/shop/collection?brand=${encodeURIComponent(selectedProduct.brand)}`}>{selectedProduct.brand}</Link></dd></div></dl>
            <a className="product-enquiry" href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Enquire on Facebook</a>
          </div>
        </div>
        <div className="product-service-strip"><div><ShieldCheck size={25}/><span><strong>Product information</strong><small>Brand, size and details in one place</small></span></div><div><ShoppingBag size={25}/><span><strong>Your preview bag</strong><small>Save your selection before checkout launches</small></span></div><a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer"><Heart size={25}/><span><strong>Need a little help?</strong><small>Contact the Authéra team</small></span></a></div>
      </section> : <section className="shop-section" id="collection" aria-labelledby="shop-title">
        <div className="shop-intro"><h1 id="shop-title">{categoryPage ? brand || title : <>FIND YOUR EVERYDAY <strong>GLOW!</strong></>}</h1><p>Discover skincare from the brands you love.<br/>A little care, a simple ritual—<strong>made for you.</strong></p></div>
        {searchPage ? <><form action="/search" role="search" className="search-page-form"><label className="screen-reader-only" htmlFor="search-page-query">Search products</label><input id="search-page-query" name="q" defaultValue={query} maxLength={160} placeholder="Search products, brands or categories…"/><button type="submit"><Search size={18}/> Search</button></form><div className="search-filters"><label>Category<select value={tab} onChange={event => setTab(event.target.value as Tab)}>{tabs.map(category => <option key={category} value={category}>{category === "Featured products" ? "All categories" : category}</option>)}</select></label><label>Brand<select value={brand} onChange={event => setBrand(event.target.value)}><option value="">All brands</option>{Array.from(new Set(products.map(product => product.brand))).sort().map(value => <option key={value}>{value}</option>)}</select></label><label>Sort by<select value={searchSort} onChange={event => setSearchSort(event.target.value)}><option value="relevance">Best match</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label><p role="status">{shown.length} {shown.length === 1 ? "product" : "products"}</p></div></> : null}
        {brand && <div className="active-filter"><span>{brand}{tab !== "Featured products" && <> <span aria-hidden="true">›</span> {tab}</>}</span><button onClick={() => setBrand("")} aria-label="Clear brand filter"><X size={14}/></button></div>}
        <div id="product-panel" aria-label={`${brand || tab} products`}>
          <div className="product-grid">{shown.map(p => <article className="product-card" key={p.id}>
            <div className="product-photo"><Link className="product-image-button" href={`/products/${encodeURIComponent(p.id)}`} aria-label={`View ${p.brand} ${p.name}${p.size ? `, ${p.size}` : ""}`}>{p.image ? <Image src={p.image} alt={`${p.brand} ${p.name}`} fill sizes="(max-width: 600px) 45vw, (max-width: 1000px) 40vw, 24vw"/> : <span className="photo-pending"><span>{p.brand}</span>Product photo coming soon</span>}</Link><button className={`save-button ${saved.includes(p.id) ? "saved" : ""}`} aria-label={`${saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`} aria-pressed={saved.includes(p.id)} onClick={() => setSaved(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev,p.id])}><Heart size={18}/></button></div>
            <span className="category-label">{p.category.toUpperCase()}</span><h2>{p.brand.toUpperCase()}</h2><Link className="product-name" href={`/products/${encodeURIComponent(p.id)}`}>{p.name}</Link>{p.size && <p className="product-size">{p.size}</p>}<p className={p.price ? "product-price" : "price-pending"}>{p.price ? `৳${p.price.toLocaleString("en-US")}` : "Price coming soon"}</p><button className="preview-button" onClick={() => adjust(p.id,1)}>{cart[p.id] ? `In preview bag (${cart[p.id]})` : "Add to preview bag"}<Plus size={14}/></button>
          </article>)}</div>
          {!shown.length && <div className="empty-state"><h2>{searchPage ? "No products match your search." : brand ? `${brand} products are coming soon.` : "No matching products."}</h2><p>{searchPage ? "Try another spelling or choose a different category or brand." : brand ? "We’re preparing the product details for this brand." : "Try another brand or product name."}</p>{searchPage ? <button onClick={() => {setBrand("");setTab("Featured products");}}>Clear category and brand filters</button> : <button onClick={() => {setBrand("");chooseTab("Featured products");}}>View featured products</button>}<Link className="search-browse-all" href="/shop/collection">Browse all products</Link></div>}
        </div>
        <p className="catalog-note">Explore our opening collection. Sizes, prices, and checkout will be available soon.</p>
      </section>}
      {!categoryPage && !blogPage && <><section className="spotlight-section" aria-labelledby="spotlight-title">
        <h2 id="spotlight-title">SKIN CARE SPOTLIGHT</h2>
        <div className="spotlight-grid">
          {[
            { brand: "The Ordinary", theme: "rose", eyebrow: "THE SERUM EDIT", title: "A LITTLE CARE. A LOVELY GLOW.", text: "Make room for your daily ritual with The Ordinary’s serums and moisturizers.", images: ["/products/barrier-serum.png", "/products/ordinary-hyaluronic.png"], names: ["Soothing & Barrier Support Serum", "Hyaluronic Acid 2% + B5"] },
            { brand: "CeraVe", theme: "blue", eyebrow: "EVERYDAY MOISTURE", title: "YOUR HYDRATION HEROES.", text: "Discover CeraVe creams and lotions for your everyday moisturizing routine.", images: ["/products/cerave-daily-lotion-cutout.png", "/products/cerave-cream-cutout.png"], names: ["Daily Moisturizing Lotion", "Moisturizing Cream"] },
            { brand: "Garnier", theme: "sun", eyebrow: "THE SUN CARE EDIT", title: "SUN CARE, IN YOUR ROUTINE.", text: "Explore Garnier Ombrelle Dry Touch sunscreens in SPF 45 and SPF 60.", images: ["/products/garnier-spf45-cutout.png", "/products/garnier-spf60-cutout.png"], names: ["Ombrelle Complete Dry Touch SPF 45", "Ombrelle Complete Dry Touch SPF 60"] },
          ].map(edit => <article className="spotlight-card" key={edit.brand}>
            <a className={`spotlight-art spotlight-${edit.theme}`} href="#collection" onClick={() => chooseBrand(edit.brand)} aria-label={`Explore ${edit.brand} products`}>
              <span className="spotlight-eyebrow">{edit.eyebrow}</span><span className="spotlight-brand">{edit.brand}</span>
              <div className="spotlight-packshots">{edit.images.map((src, i) => <div className={`spotlight-packshot packshot-${i}`} key={src}><Image src={src} alt={`${edit.brand} ${edit.names[i]}`} fill sizes="(max-width: 700px) 40vw, 18vw"/></div>)}</div>
              <span className="spotlight-art-caption">AUTHÉRA SKINCARE · THE EVERYDAY EDIT</span>
            </a>
            <h3>{edit.title}</h3><p>{edit.text}</p><a className="spotlight-shop" href="#collection" onClick={() => chooseBrand(edit.brand)}>SHOP NOW<span className="screen-reader-only"> — {edit.brand}</span></a>
          </article>)}
        </div>
      </section>
      <section className="video-section" id="videos" aria-labelledby="videos-title">
        <h2 id="videos-title">FEATURED IN VIDEOS</h2>
        <p className="video-intro">Discover the Authéra collection, one reel at a time.</p>
        <div className="video-showcase" ref={videoShowcaseRef}>
          {Array.from({length:6}, (_, index) => {
            const reels = [
              {brand:"CeraVe", title:"THE EVERYDAY CARE EDIT"},
              {brand:"Aveeno", title:"A MOMENT OF AVEENO"},
              {brand:"CeraVe", title:"CARE FOR LITTLE ONES"},
              {brand:"Garnier", title:"OMBRELLE SPF 60"},
              {brand:"Garnier", title:"OMBRELLE SPF 45"},
              {brand:"Cetaphil", title:"THE CETAPHIL EDIT"},
            ];
            const slot = (index - videoPage + 2 + reels.length) % reels.length;
            const reel = reels[index];
            const exitingLeft = slot === 5 && (index - videoNavigation.previous + 2 + reels.length) % reels.length === 0;
            return <article key={index} className={`video-card video-position-${slot} live-video-card${exitingLeft ? " video-exiting-left" : ""}`} inert={slot === 5} aria-hidden={slot === 5}>
              <video controls muted playsInline preload={slot === 2 ? "metadata" : "none"} poster={`/videos/authera-reel-${index+1}.jpg`} aria-label={`${reel.brand}: ${reel.title}`} onEnded={() => setVideoPage((index + 1) % reels.length)} onPlay={e => { if (index !== videoPage) setVideoPage(index); const current=e.currentTarget; current.closest(".video-showcase")?.querySelectorAll("video").forEach(video => {if(video !== current) video.pause();}); }}>
                <source src={`/videos/authera-reel-${index+1}.mp4`} type="video/mp4"/>
                Your browser does not support video playback. <a href={`/videos/authera-reel-${index+1}.mp4`}>Open video</a>.
              </video>
              <button className="video-product-link" onClick={() => chooseBrand(reel.brand)} aria-label={`Shop ${reel.brand}`}><span><small>{reel.brand}</small><strong>{reel.title}</strong></span><span aria-hidden="true">→</span></button>
            </article>;
          })}
        </div>
        <div className="video-carousel-controls"><button aria-label="Previous videos" onClick={() => setVideoPage(p => (p+5)%6)}>‹</button><span aria-live="polite">Reel {videoPage+1} of 6</span><button aria-label="Next videos" onClick={() => setVideoPage(p => (p+1)%6)}>›</button></div>
      </section>
      <Journal/>
      <section className="brand-section" id="brands" aria-labelledby="brands-title">
        <h2 id="brands-title">Our Brands</h2>
        <div className="brand-ticker" aria-label="Shop by brand">
          <div className="brand-ticker-track" style={{ animationDuration: `${brands.length * 3.5}s` }}>
            {[0, 1].map(copy => <div className="brand-ticker-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {brands.map((b, index) => <button className={`brand-wordmark brand-mark-${index}`} key={b} tabIndex={copy === 1 ? -1 : 0} onClick={() => chooseBrand(b)} aria-label={`Shop ${b}`}>{b}</button>)}
            </div>)}
          </div>
        </div>
      </section>
      </>}
    </main>
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-brand-column">
          <a href="#" aria-label="Authéra homepage"><Image className="footer-logo" src="/brand/authera-logo.png" alt="Authéra Skincare" width={210} height={84}/></a>
          <p className="footer-tagline">A little care. Every day.</p>
          <p className="footer-description">Explore skincare, haircare, and everyday essentials from your favorite brands.</p>
          <a className="footer-contact" href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Contact Authéra Skincare</a>
          <div className="footer-socials"><a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer" aria-label="Authéra on Facebook"><FacebookIcon/></a><a href="https://www.instagram.com/authera_skincare/" target="_blank" rel="noopener noreferrer" aria-label="Authéra on Instagram"><InstagramIcon/></a></div>
        </div>
        <div className="footer-column">
          <h2>About Us</h2>
          <details><summary>About Authéra</summary><p>Authéra Skincare brings together a selection of skincare, haircare, and everyday essentials. Explore our brands and contact us with product enquiries.</p></details>
          <a href="#brands">Our Brands</a>
          <details><summary>Store Location</summary><p>Store location details will be added soon. Contact us on Facebook for enquiries.</p></details>
          <details><summary>Delivery Information</summary><p>Delivery areas, fees, and estimated delivery times will be published before checkout launches.</p></details>
          <details><summary>Privacy Policy</summary><p>Our privacy policy is being prepared and will be published before customer accounts and checkout launch.</p></details>
          <details><summary>Terms &amp; Conditions</summary><p>Our store terms will be published before checkout launches.</p></details>
          <a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Contact Us</a>
        </div>
        <div className="footer-column">
          <h2>Account</h2>
          <Link href="/account">My Account</Link>
          <Link href="/signin" prefetch>Log in</Link>
          <Link href="/signup">Create account</Link>
          <Link href="/account/orders">Order History</Link>
          <details><summary>My Wishlist{saved.length ? ` (${saved.length})` : ""}</summary>{saved.length ? <ul className="footer-wishlist">{products.filter(p => saved.includes(p.id)).map(p => <li key={p.id}><Link href={`/products/${encodeURIComponent(p.id)}`}>{p.brand} — {p.name}{p.size ? ` · ${p.size}` : ""}</Link></li>)}</ul> : <p>Tap the heart on a product to save it here. Saved items are kept for this preview session.</p>}</details>
          <button className="footer-text-button" onClick={() => setModal("bag")}>My Preview Bag{count ? ` (${count})` : ""}</button>
        </div>
        <div className="footer-column">
          <h2>Services</h2>
          <a href="#collection">Browse Products</a>
          <details><summary>Delivery &amp; Shipping</summary><p>Shipping options and delivery times are coming soon.</p></details>
          <details><summary>Returns &amp; Exchanges</summary><p>Our returns and exchange policy will be published before checkout launches.</p></details>
          <a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Product Enquiries</a>
        </div>
      </div>
      <div className="footer-payments"><ShieldCheck size={23} strokeWidth={1.5}/><h2>Payment Methods</h2><p>Payment options will be announced when checkout launches.</p></div>
      <p className="footer-copyright">Copyright © {new Date().getFullYear()} AutheraCare. All rights reserved.</p>
      <a className="back-to-top" href="#" aria-label="Back to top"><ChevronUp size={26}/></a>
    </footer>
    <dialog ref={dialogRef} className={`shop-dialog${modal === "bag" ? " cart-drawer" : ""}`} aria-labelledby="shop-dialog-title" onCancel={() => setModal(null)} onClick={e => {if(e.target===e.currentTarget)setModal(null);}}><div className="dialog-heading"><h2 id="shop-dialog-title">{modal === "bag" ? "Shopping cart" : modal ? modal.brand : ""}</h2><button className="icon-button" aria-label="Close dialog" onClick={() => setModal(null)}><X/></button></div>{modal === "bag" ? <CartContents products={products} cart={cart} onAdjust={adjust} onClose={()=>setModal(null)}/> : modal && <div className="product-detail">{modal.image && <div className="detail-photo"><Image src={modal.image} alt={modal.name} fill sizes="400px"/></div>}<span className="category-label">{modal.category}</span><h3>{modal.name}</h3>{modal.description && <p className="product-description">{modal.description}</p>}{modal.size && <p className="product-size">{modal.size}</p>}<p className={modal.price ? "product-price" : "price-pending"}>{modal.price ? `৳${modal.price.toLocaleString("en-US")}` : "Price coming soon"}</p>{!modal.size && <p>Available sizes will be added soon.</p>}{modal.editedImage && <p className="campaign-note">Product image prepared from supplied artwork.</p>}<button className="detail-add" onClick={()=>adjust(modal.id,1)}>{cart[modal.id] ? `In preview bag (${cart[modal.id]})` : "Add to preview bag"}</button><a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Enquire on Facebook</a></div>}</dialog>
  </>;
}











