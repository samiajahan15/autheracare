"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, Menu, X, ChevronDown, Heart, Plus, Minus, ChevronUp, ShieldCheck } from "lucide-react";

function FacebookIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9h4Z" /></svg>;
}
function InstagramIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
const brands = [
  "CeraVe", "Cetaphil", "L’Oréal Paris", "The Ordinary",
  "MONDAY Haircare", "Bath & Body Works", "Neutrogena", "La Roche-Posay",
  "NIVEA", "Simple", "Olay", "Garnier", "Aveeno", "Native",
  "Voltarol", "Thinkbaby", "Blue Lizard", "EOS", "Nutiva", "Fixodent Plus",
  "Salonpas", "PanOxyl", "Bondi Sands", "RUB·A535", "StriVectin",
  "Thinkkids", "Oral-B", "Sun Bum", "Kalaya",
  "Kirkland", "Robax", "Nature’s Bounty",
  "Jamieson", "Webber Naturals", "Q-tips", "G.U.M", "TUMS", "Eucerin", "Dr. Althea", "numbuzin",
];
type Product = { id: string; brand: string; name: string; category: "Face care" | "Body care" | "Hair care" | "Lip care" | "Accessories" | "Sets" | "Perfume" | "Wellness" | "Oral care"; image?: string; editedImage?: boolean; size?: string; price?: number; description?: string };
const products: Product[] = [
  { id: "salicylic", brand: "The Ordinary", name: "Salicylic Acid 2% Anhydrous Solution", category: "Face care", image: "/products/salicylic-acid.png" },
  { id: "lotion", brand: "The Ordinary", name: "Natural Moisturizing Factors + Inulin Body Lotion", category: "Body care", image: "/products/body-lotion.png" },
  { id: "barrier", brand: "The Ordinary", name: "Soothing & Barrier Support Serum", category: "Face care", image: "/products/barrier-serum.png" },
  { id: "azelaic", brand: "The Ordinary", name: "Azelaic Acid Suspension 10%", category: "Face care", image: "/products/azelaic-acid.png", size: "30 mL" },
  { id: "ordinary-pha", brand: "The Ordinary", name: "PHA 5% Exfoliating Lip Serum", category: "Lip care", image: "/products/ordinary-pha-lip.png" },
  { id: "ordinary-nmf", brand: "The Ordinary", name: "Natural Moisturizing Factors + HA", category: "Face care", image: "/products/ordinary-nmf.png", size: "30 mL" },
  { id: "ordinary-hyaluronic", brand: "The Ordinary", name: "Hyaluronic Acid 2% + B5", category: "Face care", image: "/products/ordinary-hyaluronic.png", size: "30 mL" },
  { id: "ordinary-eye-peptide", brand: "The Ordinary", name: "Multi-Peptide Eye Serum", category: "Face care", image: "/products/ordinary-eye-peptide.png", size: "15 mL" },
  { id: "ordinary-niacinamide-30", brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", category: "Face care", image: "/products/ordinary-niacinamide.png", size: "30 mL / 60 mL" },
  { id: "ordinary-rice-60", brand: "The Ordinary", name: "Rice Lipids + Ectoin Microemulsion", category: "Face care", image: "/products/ordinary-rice.png", size: "60 mL / 120 mL" },
  { id: "ordinary-bottle", brand: "The Ordinary", name: "Daily Hydration Bottle", category: "Accessories", image: "/products/ordinary-bottle.png", size: "500 mL" },
  { id: "ordinary-mini-set", brand: "The Ordinary", name: "The Mini Icons Set", category: "Sets", image: "/products/ordinary-mini-set.png", size: "1 set" },
  { id: "eye", brand: "CeraVe", name: "Eye Repair Cream", category: "Face care" },
  { id: "cerave", brand: "CeraVe", name: "Moisturizing Cream", category: "Face care", image: "/products/cerave-cream-cutout.png", editedImage: true },
  { id: "cerave-daily-lotion", brand: "CeraVe", name: "Daily Moisturizing Lotion", category: "Body care", image: "/products/cerave-daily-lotion-cutout.png", editedImage: true },
  { id: "cerave-healing-ointment", brand: "CeraVe", name: "Healing Ointment", category: "Body care", image: "/products/cerave-ointment-cutout.png", editedImage: true },
  { id: "cerave-baby-wash", brand: "CeraVe", name: "Baby Wash & Shampoo", category: "Body care", image: "/products/cerave-baby-wash-cutout.png", editedImage: true },
  { id: "cerave-baby-lotion", brand: "CeraVe", name: "Baby Moisturizing Lotion", category: "Body care", image: "/products/cerave-baby-lotion-cutout.png", editedImage: true },
  { id: "cerave-shampoo", brand: "CeraVe", name: "Anti-Dandruff Hydrating Shampoo", category: "Hair care", image: "/products/cerave-shampoo-cutout.png", editedImage: true, size: "355 mL", price: 2600 },
  { id: "cerave-conditioner", brand: "CeraVe", name: "Anti-Dandruff Hydrating Conditioner", category: "Hair care", image: "/products/cerave-conditioner-cutout.png", editedImage: true, size: "266 mL", price: 2300 },
  { id: "cerave-vitamin-c", brand: "CeraVe", name: "Skin Renewing Vitamin C Serum", category: "Face care", image: "/products/cerave-vitamin-c-cutout.png", editedImage: true, size: "30 mL" },
  { id: "garnier-spf45", brand: "Garnier", name: "Ombrelle Complete Dry Touch Sunscreen SPF 45", category: "Face care", image: "/products/garnier-spf45-cutout.png", editedImage: true, size: "90 mL" },
  { id: "garnier-spf60", brand: "Garnier", name: "Ombrelle Complete Dry Touch Sunscreen SPF 60", category: "Face care", image: "/products/garnier-spf60-cutout.png", editedImage: true, size: "200 mL" },
  { id: "garnier-shampoo", brand: "Garnier", name: "Fructis Hair Filler + Vitamin Cg Strength Repair Shampoo", category: "Hair care", image: "/products/garnier-shampoo-cutout.png", editedImage: true, size: "300 mL" },
  { id: "garnier-conditioner", brand: "Garnier", name: "Fructis Hair Filler + Hyaluronic Moisture Repair Conditioner", category: "Hair care", image: "/products/garnier-conditioner-cutout.png", editedImage: true, size: "300 mL" },
  { id: "garnier-serum", brand: "Garnier", name: "Fructis Hair Filler + Hyaluronic Moisture Repair Serum", category: "Hair care", image: "/products/garnier-serum-cutout.png", editedImage: true, size: "111 mL" },
  { id: "aveeno", brand: "Aveeno", name: "Daily Moisturizing Body Wash & Soothing Shower Essentials", category: "Body care" },
  { id: "native", brand: "Native", name: "Coconut & Vanilla Deodorant", category: "Body care", image: "/products/native-coconut-vanilla.png", editedImage: true, size: "75 g" },
  { id: "gloss", brand: "Bath & Body Works", name: "Disney Princess Lip Gloss Collections", category: "Lip care" },
  { id: "bbw-pearberry", brand: "Bath & Body Works", name: "Pearberry Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-pearberry.png", editedImage: true, size: "236 mL" },
  { id: "bbw-vanilla-cafe", brand: "Bath & Body Works", name: "Vanilla Café Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-vanilla-cafe.png", editedImage: true, size: "236 mL" },
  { id: "bbw-belle", brand: "Bath & Body Works", name: "Disney Princess Belle Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-belle.jpg", size: "236 mL" },
  { id: "bbw-pina-colada-swirl", brand: "Bath & Body Works", name: "Piña Colada Swirl Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-pina-colada-swirl.png", editedImage: true, size: "236 mL" },
  { id: "bbw-secret-wonderland", brand: "Bath & Body Works", name: "Secret Wonderland Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-secret-wonderland.png", editedImage: true, size: "236 mL" },
  { id: "bbw-peach-blossom-nectar", brand: "Bath & Body Works", name: "Peach Blossom & Nectar Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-peach-blossom-nectar.png", editedImage: true, size: "236 mL" },
  { id: "bbw-waikiki-beach-coconut", brand: "Bath & Body Works", name: "Waikiki Beach Coconut Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-waikiki-beach-coconut.png", editedImage: true, size: "236 mL" },
  { id: "bbw-neapolitan-ice-cream", brand: "Bath & Body Works", name: "Neapolitan Ice Cream Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-neapolitan-ice-cream.png", editedImage: true, size: "236 mL" },
  { id: "bbw-viva-brazil", brand: "Bath & Body Works", name: "Viva Brazil Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-viva-brazil.png", editedImage: true, size: "236 mL" },
  { id: "bbw-fruity-musk", brand: "Bath & Body Works", name: "Fruity Musk Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-fruity-musk.png", editedImage: true, size: "236 mL" },
  { id: "bbw-butterfly", brand: "Bath & Body Works", name: "Butterfly Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-butterfly.png", editedImage: true, size: "236 mL" },
  { id: "bbw-sweetheart-cherry", brand: "Bath & Body Works", name: "Sweetheart Cherry Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-sweetheart-cherry.png", editedImage: true, size: "236 mL" },
  { id: "bbw-vanilla-ease", brand: "Bath & Body Works", name: "Vanilla Ease Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-vanilla-ease.png", editedImage: true, size: "236 mL" },
  { id: "bbw-warm-musk", brand: "Bath & Body Works", name: "Warm Musk Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-warm-musk.png", editedImage: true, size: "236 mL" },
  { id: "bbw-hello-happiness", brand: "Bath & Body Works", name: "Hello Happiness Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-hello-happiness.png", editedImage: true, size: "236 mL" },
  { id: "bbw-dreaming-of-rio", brand: "Bath & Body Works", name: "Dreaming of Rio Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-dreaming-of-rio.png", editedImage: true, size: "236 mL" },
  { id: "bbw-viva-vanilla", brand: "Bath & Body Works", name: "Viva Vanilla Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-viva-vanilla.png", editedImage: true, size: "236 mL" },
  { id: "bbw-rose", brand: "Bath & Body Works", name: "Rose Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-rose.png", editedImage: true, size: "236 mL" },
  { id: "bbw-country-chic", brand: "Bath & Body Works", name: "Country Chic Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-country-chic.png", editedImage: true, size: "236 mL" },
  { id: "bbw-salted-shorelines", brand: "Bath & Body Works", name: "Salted Shorelines Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-salted-shorelines.png", editedImage: true, size: "236 mL" },
  { id: "bbw-cashmere-glow", brand: "Bath & Body Works", name: "Cashmere Glow Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-cashmere-glow.png", editedImage: true, size: "236 mL" },
  { id: "bbw-cactus-blossom", brand: "Bath & Body Works", name: "Cactus Blossom Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-cactus-blossom.png", editedImage: true, size: "236 mL" },
  { id: "bbw-meet-me-in-miami", brand: "Bath & Body Works", name: "Meet Me in Miami Fine Fragrance Mist", category: "Perfume", image: "/products/perfume-meet-me-in-miami.png", editedImage: true, size: "236 mL" },
  { id: "eos-spritz-lip-balm", brand: "EOS", name: "Spritz Shea Natural Smooth Lip Balm 9-Pack", category: "Lip care", image: "/products/eos-spritz-lip-balm.png", editedImage: true, size: "9 × 4 g", description: "A nine-piece lip balm set with five flavors shown on the packaging: Tangerine Spritz, Strawberry Limoncello, Raspberry Rosé, Vanilla Bean, and Pistachio Gelato." },
  { id: "nutiva-mct-oil", brand: "Nutiva", name: "Organic MCT Oil", category: "Wellness", image: "/products/nutiva-mct-oil.png", editedImage: true, size: "1.18 L", description: "Coconut-derived organic MCT oil. Bottle size: 1.18 L. Refer to the product packaging for ingredients and directions." },
  { id: "fixodent-plus-scope", brand: "Fixodent Plus", name: "Scope Denture Adhesive Cream", category: "Oral care", image: "/products/fixodent-plus-scope.png", editedImage: true, description: "Denture adhesive cream with Scope branding, as shown on the supplied packaging. Refer to the product label for directions." },
  { id: "salonpas-patches", brand: "Salonpas", name: "Pain Relieving Patch", category: "Wellness", image: "/products/salonpas-patches.png", editedImage: true, size: "140 patches · 7.2 × 4.6 cm each", description: "Topical patch pack, as shown on the supplied packaging. Refer to the product label for directions and warnings." },
  { id: "native-toasted-vanilla-honey", brand: "Native", name: "Toasted Vanilla & Honey Deodorant", category: "Body care", image: "/products/native-toasted-vanilla-honey.png", editedImage: true, size: "75 g" },
  { id: "native-vanilla-sandalwood", brand: "Native", name: "Vanilla & Sandalwood Deodorant", category: "Body care", image: "/products/native-vanilla-sandalwood.png", editedImage: true, size: "75 g" },
  { id: "native-vanilla-variety", brand: "Native", name: "Vanilla Variety Deodorant 3-Pack", category: "Body care", image: "/products/native-vanilla-variety.png", editedImage: true, size: "3 × 75 g", description: "Three-deodorant set containing Toasted Vanilla & Honey, Coconut & Vanilla, and Vanilla & Sandalwood. Total net weight: 225 g." },
  { id: "panoxyl-balancing-moisturizer", brand: "PanOxyl", name: "Balancing Renewal Moisturizer", category: "Face care", image: "/products/panoxyl-balancing-moisturizer.png", editedImage: true, size: "85 g", description: "Facial moisturizer, as shown on the supplied packaging. Refer to the product label for ingredients and directions." },
  { id: "neutrogena-retinol-cream", brand: "Neutrogena", name: "Rapid Wrinkle Repair Retinol Regenerating Cream – Fragrance Free", category: "Face care", image: "/products/neutrogena-retinol-cream.png", editedImage: true, size: "2 × 48 mL", description: "Fragrance-free retinol regenerating cream twin pack, containing two 48 mL jars, as shown on the supplied packaging. Refer to the product label for ingredients, directions, and warnings." },
];
const tabs = ["Featured products", "Face care", "Body care", "Hair care", "Lip care", "Perfume", "Wellness", "Oral care", "Accessories", "Sets"] as const;
type Tab = typeof tabs[number];

export default function Home() {
  const [tab, setTab] = useState<Tab>("Featured products");
  const [brand, setBrand] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [brandPage, setBrandPage] = useState(0);
  const [videoPage, setVideoPage] = useState(0);
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
  const brandPageCount = Math.ceil(brands.length / 4);
  const [saved, setSaved] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [modal, setModal] = useState<"bag" | Product | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modal) { dialog.showModal(); const before = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { dialog.close(); document.body.style.overflow = before; }; }
    dialog.close();
  }, [modal]);
  const searching = query.trim().toLowerCase();
  const filtered = products.filter(p => (!brand || p.brand === brand) && (tab === "Featured products" || p.category === tab) && (!searching || `${p.brand} ${p.name}`.toLowerCase().includes(searching)));
  const shown = tab === "Featured products" && !brand && !searching ? filtered.slice(0,4) : filtered;
  const count = Object.values(cart).reduce((total, n) => total + n, 0);
  function chooseTab(value: Tab) { setTab(value); setQuery(""); setMenuOpen(false); }
  function chooseBrand(value: string) { setBrand(value); setTab("Featured products"); setQuery(""); setBrandsOpen(false); setMenuOpen(false); document.getElementById("collection")?.scrollIntoView({behavior:"smooth"}); }
  function adjust(id: string, delta: number) { setCart(prev => ({...prev,[id]:Math.max(0,(prev[id] || 0) + delta)})); }
  return <>
    <header className="masthead">
      <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      <a className="logo" href="#" aria-label="Authéra homepage"><Image src="/brand/authera-logo.png" alt="Authéra Skincare" width={1983} height={793} priority/></a>
      <span className="header-note">Your favorite brands. Your everyday care.</span>
      <div className="header-actions"><button className="icon-button" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search size={21}/></button><button className="icon-button" aria-label={`Open bag, ${count} items`} onClick={() => setModal("bag")}><ShoppingBag size={21}/><span className="bag-count">{count}</span></button></div>
    </header>
    <nav className={`main-nav ${menuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
      <a href="#collection" onClick={() => chooseTab("Featured products")}>FEATURED</a>
      <a href="#collection" onClick={() => chooseTab("Face care")}>SKINCARE</a>
      <details className="nav-dropdown"><summary>SHOP BY <ChevronDown size={16}/></summary><div className="nav-menu">{tabs.map(t => <a key={t} href="#collection" onClick={e => {chooseTab(t); e.currentTarget.closest("details")?.removeAttribute("open");}}>{t}</a>)}</div></details>
      <div className="nav-brands"><button onClick={() => setBrandsOpen(!brandsOpen)} aria-expanded={brandsOpen} aria-controls="brand-menu">BRANDS <ChevronDown size={16}/></button>{brandsOpen && <div id="brand-menu" className="nav-menu brand-menu"><button onClick={() => chooseBrand("")}>All brands</button>{brands.map(b => <button key={b} onClick={() => chooseBrand(b)}>{b}</button>)}</div>}</div>
      <a href="#collection" onClick={() => chooseTab("Body care")}>BODY CARE</a>
      <a href="#collection" onClick={() => chooseTab("Hair care")}>HAIR CARE</a><a href="#collection" onClick={() => chooseTab("Lip care")}>LIP & MAKEUP</a>
      <a href="#collection" onClick={() => chooseTab("Perfume")}>PERFUME</a>
      <a href="#brands" onClick={() => setMenuOpen(false)}>OUR COLLECTION</a>
    </nav>
    {searchOpen && <div className="search-panel"><label htmlFor="search">Search the collection</label><input id="search" autoFocus placeholder="Search a brand or product…" value={query} onChange={e => {setQuery(e.target.value);setTab("Featured products");setBrand("");}}/><a href="#collection">View results</a><button className="icon-button" aria-label="Close search" onClick={() => {setSearchOpen(false);setQuery("");}}><X size={19}/></button></div>}
    <main>
      <section className="shop-section" id="collection" aria-labelledby="shop-title">
        <div className="shop-intro"><h1 id="shop-title">FIND YOUR EVERYDAY <strong>GLOW!</strong></h1><p>Discover skincare from the brands you love.<br/>A little care, a simple ritual—<strong>made for you.</strong></p></div>
        <div className="shopping-tabs" role="tablist" aria-label="Shop by category">{tabs.map(t => <button id={`tab-${t.replaceAll(" ","-")}`} key={t} role="tab" aria-selected={tab === t} aria-controls="product-panel" tabIndex={tab === t ? 0 : -1} className={tab === t ? "active" : ""} onClick={() => chooseTab(t)} onKeyDown={e => {const index=tabs.indexOf(t); const next=e.key==="ArrowRight" ? (index+1)%tabs.length : e.key==="ArrowLeft" ? (index-1+tabs.length)%tabs.length : e.key==="Home" ? 0 : e.key==="End" ? tabs.length-1 : -1;if(next>=0){e.preventDefault();chooseTab(tabs[next]);document.getElementById(`tab-${tabs[next].replaceAll(" ","-")}`)?.focus();}}}>SHOP {t === "Featured products" ? "THE EDIT" : t.toUpperCase()}</button>)}</div>
        {brand && <div className="active-filter"><span>{brand}{tab !== "Featured products" && <> <span aria-hidden="true">›</span> {tab}</>}</span><button onClick={() => setBrand("")} aria-label="Clear brand filter"><X size={14}/></button></div>}
        <div role="tabpanel" id="product-panel" aria-labelledby={`tab-${tab.replaceAll(" ","-")}`}>
          <div className="product-grid">{shown.map(p => <article className="product-card" key={p.id}>
            <div className="product-photo"><button className="product-image-button" onClick={() => setModal(p)} aria-label={`View ${p.brand} ${p.name}${p.size ? `, ${p.size}` : ""}`}>{p.image ? <Image src={p.image} alt={`${p.brand} ${p.name}`} fill sizes="(max-width: 600px) 45vw, (max-width: 1000px) 40vw, 24vw"/> : <span className="photo-pending"><span>{p.brand}</span>Product photo coming soon</span>}</button><button className={`save-button ${saved.includes(p.id) ? "saved" : ""}`} aria-label={`${saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`} aria-pressed={saved.includes(p.id)} onClick={() => setSaved(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev,p.id])}><Heart size={18}/></button></div>
            <span className="category-label">{p.category.toUpperCase()}</span><h2>{p.brand.toUpperCase()}</h2><button className="product-name" onClick={() => setModal(p)}>{p.name}</button>{p.size && <p className="product-size">{p.size}</p>}<p className={p.price ? "product-price" : "price-pending"}>{p.price ? `৳${p.price.toLocaleString("en-US")}` : "Price coming soon"}</p><button className="preview-button" onClick={() => adjust(p.id,1)}>{cart[p.id] ? `In preview bag (${cart[p.id]})` : "Add to preview bag"}<Plus size={14}/></button>
          </article>)}</div>
          {!shown.length && <div className="empty-state"><h2>{brand ? `${brand} products are coming soon.` : "No matching products."}</h2><p>{brand ? "We’re preparing the product details for this brand." : "Try another brand or product name."}</p><button onClick={() => {setBrand("");chooseTab("Featured products");}}>View featured products</button></div>}
        </div>
        <p className="catalog-note">Explore our opening collection. Sizes, prices, and checkout will be available soon.</p>
      </section>
      <section className="spotlight-section" aria-labelledby="spotlight-title">
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
            return <article key={index} className={`video-card video-position-${slot} live-video-card`} inert={slot === 5} aria-hidden={slot === 5}>
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
      <section className="journal-section" id="journal" aria-labelledby="journal-title">
        <header className="journal-heading"><span>THE AUTHÉRA JOURNAL</span><h2 id="journal-title">A little care, a little reading.</h2><p lang="bn">আপনার পছন্দের পণ্য নিয়ে কিছু কথা</p></header>
        <div className="journal-grid">
          {[
            { id: "daily-moisture", brand: "CeraVe", image: "/products/cerave-cream-cutout.png", theme: "blue", tag: "DAILY CARE", title: "প্রতিদিনের যত্নে ময়েশ্চারাইজার", excerpt: "CeraVe Moisturizing Cream ও Daily Moisturizing Lotion—আপনার কালেকশনের দুটি পরিচিত নাম।", body: ["দৈনন্দিন স্কিনকেয়ারের জন্য ময়েশ্চারাইজার খুঁজছেন? Authéra-তে CeraVe Moisturizing Cream ও Daily Moisturizing Lotion দুটিই আমাদের পণ্যের তালিকায় রয়েছে।", "ক্রিম ও লোশনের টেক্সচার আলাদা হতে পারে। নিজের পছন্দ, প্যাকেটের তথ্য ও ব্যবহারের নির্দেশনা দেখে বেছে নিন। সাইজ, দাম বা পণ্যের বিস্তারিত জানতে আমাদের সঙ্গে যোগাযোগ করতে পারেন।"] },
            { id: "ordinary-hydration", brand: "The Ordinary", image: "/products/ordinary-hyaluronic.png", theme: "lavender", tag: "THE SERUM EDIT", title: "আপনার সিরাম শেলফে The Ordinary", excerpt: "Hyaluronic Acid 2% + B5—সহজ একটি রুটিনের জন্য পণ্যটি চিনে নিন।", body: ["The Ordinary Hyaluronic Acid 2% + B5 আমাদের কালেকশনে ৩০ mL সাইজে তালিকাভুক্ত রয়েছে। সিরাম বেছে নেওয়ার সময় নামের পাশাপাশি সম্পূর্ণ পণ্যের তথ্যও দেখে নিন।", "একসঙ্গে অনেক নতুন পণ্য যোগ করার বদলে নিজের বর্তমান রুটিনটি বুঝে নিন। ব্যবহারের পরিমাণ ও নিয়মের জন্য পণ্যের লেবেল অনুসরণ করুন। নিচের লিংকে The Ordinary-এর অন্যান্য পণ্যও দেখতে পারবেন।"] },
            { id: "simple-routine", brand: "The Ordinary", image: "/products/ordinary-nmf.png", theme: "sand", tag: "ROUTINE NOTES", title: "ছোট রুটিন, নিজের জন্য একটু সময়", excerpt: "Natural Moisturizing Factors + HA দিয়ে আপনার ময়েশ্চারাইজার কালেকশনটি দেখুন।", body: ["স্কিনকেয়ারের তাক বড় হতেই হবে, এমন কোনো কথা নেই। নিজের পছন্দ ও দৈনন্দিন অভ্যাসের সঙ্গে মানানসই কিছু পণ্য দিয়েই রুটিন সাজাতে পারেন।", "আমাদের তালিকায় The Ordinary Natural Moisturizing Factors + HA রয়েছে ৩০ mL সাইজে। এটি ফেস ময়েশ্চারাইজার; একই ব্র্যান্ডের Natural Moisturizing Factors + Inulin Body Lotion একটি আলাদা পণ্য। কেনার আগে পুরো নাম ও সাইজ মিলিয়ে নিন।"] },
            { id: "sun-care-edit", brand: "Garnier", image: "/products/garnier-spf60-cutout.png", theme: "sun", tag: "SUN CARE EDIT", title: "সান কেয়ার কালেকশনে Garnier", excerpt: "Ombrelle Complete Dry Touch—SPF 45 ও SPF 60 ভ্যারিয়েন্ট দেখুন।", body: ["আমাদের Garnier কালেকশনে Ombrelle Complete Dry Touch SPF 45 রয়েছে ৯০ mL এবং SPF 60 রয়েছে ২০০ mL সাইজে। একই লাইনের হলেও ভ্যারিয়েন্ট ও সাইজ আলাদা।", "পণ্য বেছে নেওয়ার সময় SPF, সাইজ এবং প্যাকেটের নির্দেশনা ভালোভাবে পড়ুন। ব্যবহারের নিয়ম পণ্যের লেবেলে দেওয়া থাকে। ভ্যারিয়েন্টের বর্তমান দাম ও বিস্তারিত জানতে Authéra-তে যোগাযোগ করুন।"] },
          ].map(post => <article className="journal-card" key={post.id}>
            <div className={`journal-art spotlight-${post.theme}`}><span>{post.tag}</span><div className="journal-packshot"><Image src={post.image} alt={`${post.brand} featured product`} fill sizes="(max-width: 600px) 80vw, (max-width: 1000px) 40vw, 22vw"/></div><small>{post.brand}</small></div>
            <h3 lang="bn">{post.title}</h3><p className="journal-excerpt" lang="bn">{post.excerpt}</p>
            <details className="journal-read"><summary><span className="journal-read-label">READ MORE</span><span className="journal-close-label">READ LESS</span><span className="screen-reader-only"> — {post.title}</span></summary><div className="journal-article" lang="bn">{post.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<a href="#collection" onClick={() => chooseBrand(post.brand)}>{post.brand} পণ্য দেখুন →</a></div></details>
          </article>)}
        </div>
      </section>
      <section className="brand-section" id="brands" aria-labelledby="brands-title" aria-roledescription="carousel">
        <h2 id="brands-title">Our Brands</h2>
        <div className="brand-carousel" onKeyDown={e => {if(e.key === "ArrowRight") {e.preventDefault();setBrandPage(p => (p + 1) % brandPageCount);} else if(e.key === "ArrowLeft") {e.preventDefault();setBrandPage(p => (p - 1 + brandPageCount) % brandPageCount);}}}>
          <button className="brand-arrow" aria-label="Previous brands" onClick={() => setBrandPage(p => (p - 1 + brandPageCount) % brandPageCount)}>‹</button>
          <div className="brand-wordmarks" id="brand-slide" role="group" aria-roledescription="slide" aria-label={`Brand group ${brandPage + 1} of ${brandPageCount}`}>
            {brands.slice(brandPage * 4, brandPage * 4 + 4).map(b => <button className={`brand-wordmark brand-mark-${brands.indexOf(b)}`} key={b} onClick={() => chooseBrand(b)} aria-label={`Shop ${b}`}>{b}</button>)}
          </div>
          <button className="brand-arrow" aria-label="Next brands" onClick={() => setBrandPage(p => (p + 1) % brandPageCount)}>›</button>
        </div>
        <div className="brand-dots" aria-label="Brand groups">{Array.from({length:brandPageCount},(_,i) => <button key={i} aria-label={`Show brand group ${i + 1}: ${brands.slice(i*4,i*4+4).join(", ")}`} aria-current={brandPage === i ? "true" : undefined} aria-controls="brand-slide" className={brandPage === i ? "active" : ""} onClick={() => setBrandPage(i)}/>)}</div>
        <span className="screen-reader-only" aria-live="polite">Showing brand group {brandPage + 1} of {brandPageCount}: {brands.slice(brandPage*4,brandPage*4+4).join(", ")}</span>
      </section>
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
          <details><summary>My Account</summary><p>Customer accounts are coming soon.</p></details>
          <details><summary>Order History</summary><p>Order history will be available when accounts and checkout launch.</p></details>
          <details><summary>My Wishlist{saved.length ? ` (${saved.length})` : ""}</summary>{saved.length ? <ul className="footer-wishlist">{products.filter(p => saved.includes(p.id)).map(p => <li key={p.id}><button onClick={() => setModal(p)}>{p.brand} — {p.name}{p.size ? ` · ${p.size}` : ""}</button></li>)}</ul> : <p>Tap the heart on a product to save it here. Saved items are kept for this preview session.</p>}</details>
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
    <dialog ref={dialogRef} className="shop-dialog" onCancel={() => setModal(null)} onClick={e => {if(e.target===e.currentTarget)setModal(null);}}><div className="dialog-heading"><h2>{modal === "bag" ? "Your preview bag" : modal ? modal.brand : ""}</h2><button className="icon-button" aria-label="Close dialog" onClick={() => setModal(null)}><X/></button></div>{modal === "bag" ? <><p className="dialog-note">These items are saved for preview. Checkout is coming soon.</p>{!count ? <p className="empty-bag">Your bag is empty. Explore the collection to get started.</p> : products.filter(p=>cart[p.id]>0).map(p=><div className="bag-item" key={p.id}><div><strong>{p.brand}</strong><p>{p.name}{p.size ? ` · ${p.size}` : ""}</p></div><div className="quantity"><button aria-label={`Remove one ${p.name}`} onClick={()=>adjust(p.id,-1)}><Minus size={14}/></button><span>{cart[p.id]}</span><button aria-label={`Add one ${p.name}`} onClick={()=>adjust(p.id,1)}><Plus size={14}/></button></div></div>)}</> : modal && <div className="product-detail">{modal.image && <div className="detail-photo"><Image src={modal.image} alt={modal.name} fill sizes="400px"/></div>}<span className="category-label">{modal.category}</span><h3>{modal.name}</h3>{modal.description && <p className="product-description">{modal.description}</p>}{modal.size && <p className="product-size">{modal.size}</p>}<p className={modal.price ? "product-price" : "price-pending"}>{modal.price ? `৳${modal.price.toLocaleString("en-US")}` : "Price coming soon"}</p>{!modal.size && <p>Available sizes will be added soon.</p>}{modal.editedImage && <p className="campaign-note">Product image prepared from supplied artwork.</p>}<button className="detail-add" onClick={()=>adjust(modal.id,1)}>{cart[modal.id] ? `In preview bag (${cart[modal.id]})` : "Add to preview bag"}</button><a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Enquire on Facebook</a></div>}</dialog>
  </>;
}











