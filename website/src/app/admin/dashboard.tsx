"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Package, Boxes, Tags, ArrowUpRight, Search, Plus, X, Upload, LogOut, RefreshCw, Pencil, Check, AlertCircle, ChevronLeft, ChevronRight, ImageIcon, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

type Product = { id: string; name: string; brand: string; category: string; image: string | null; size: string | null; price: number | null; stock: number | null; description: string | null; active: boolean; edited_image: boolean; position: number };
type Section = "Overview" | "Products" | "Inventory" | "Brands";
const categories = ["Face care", "Body care", "Hair care", "Lip care", "Accessories", "Sets", "Perfume", "Wellness", "Oral care"];
const money = (v: number | null) => v === null ? "Not set" : `৳${Number(v).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
const clean = (p: Product): Product => ({ id:p.id, name:p.name, brand:p.brand, category:p.category, image:p.image, size:p.size, price:p.price===null?null:Number(p.price), stock:p.stock, description:p.description, active:p.active, edited_image:p.edited_image, position:p.position });

export default function Dashboard({ email }: { email: string }) {
  const router = useRouter();
  const [section,setSection] = useState<Section>("Overview");
  const [products,setProducts] = useState<Product[]>([]);
  const [brands,setBrands] = useState<string[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [query,setQuery] = useState("");
  const [brand,setBrand] = useState("");
  const [status,setStatus] = useState("");
  const [page,setPage] = useState(0);
  const [draft,setDraft] = useState<Product|null>(null);
  const [creating,setCreating] = useState(false);
  const [saving,setSaving] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [editorError,setEditorError] = useState("");
  const [newBrand,setNewBrand] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const editing = draft !== null;

  async function reload() {
    setError("");
    const response = await fetch("/api/admin/products",{cache:"no-store"});
    if (response.status===401) {router.replace("/signin");return;}
    if (response.status===403) {router.replace("/account");return;}
    const data = await response.json();
    if (!response.ok) throw new Error(data.error??"Could not load the catalog.");
    setProducts(data.products.map(clean));setBrands(data.brands);
  }
  useEffect(()=>{
    let active=true;
    void fetch("/api/admin/products",{cache:"no-store"}).then(async response=>{
      if(response.status===401){router.replace("/signin");return;}
      if(response.status===403){router.replace("/account");return;}
      const data=await response.json();
      if(!response.ok)throw new Error(data.error??"Could not load the catalog.");
      if(active){setProducts(data.products.map(clean));setBrands(data.brands);}
    }).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[router]);
  useEffect(()=>{
    if(!editing)return;
    const el=dialog.current;el?.showModal();
    const old=document.body.style.overflow;document.body.style.overflow="hidden";
    return()=>{el?.close();document.body.style.overflow=old;};
  },[editing]);
  function navigate(value:Section){setSection(value);setQuery("");setBrand("");setStatus("");setPage(0);}
  function open(p?:Product){setCreating(!p);setEditorError("");setNotice("");setDraft(p?clean(p):{id:"",name:"",brand:brands[0]??"",category:"Face care",image:null,size:null,price:null,stock:null,description:null,active:false,edited_image:false,position:products.length});}
  async function save(event:FormEvent){
    event.preventDefault();if(!draft)return;setSaving(true);setEditorError("");
    try{
      const response=await fetch("/api/admin/products",{method:creating?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});
      const data=await response.json();if(!response.ok)throw new Error(data.error??"Unable to save product.");
      setProducts(previous=>[...previous.filter(p=>p.id!==data.product.id),clean(data.product)].sort((a,b)=>a.position-b.position||a.id.localeCompare(b.id)));
      setDraft(null);setNotice(`${draft.name} ${creating?"created":"updated"}.`);
    }catch(e){setEditorError(e instanceof Error?e.message:"Save failed.");}finally{setSaving(false);}
  }
  async function upload(file?:File){
    if(!file||!draft)return;setEditorError("");
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5242880){setEditorError("Choose a JPG, PNG, or WebP file up to 5 MB.");return;}
    setUploading(true);
    try{const client=createClient();const path=`${crypto.randomUUID()}.${file.type==="image/jpeg"?"jpg":file.type.split("/")[1]}`;
      const {error}=await client.storage.from("product-images").upload(path,file);if(error)throw error;
      const {data}=client.storage.from("product-images").getPublicUrl(path);setDraft(p=>p?{...p,image:data.publicUrl}:p);
    }catch{setEditorError("Image upload failed. Please try again.");}finally{setUploading(false);}
  }
  async function addBrand(event:FormEvent){
    event.preventDefault();setSaving(true);setError("");
    try{const response=await fetch("/api/admin/brands",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newBrand.trim()})});
      const data=await response.json();if(!response.ok)throw new Error(data.error);setBrands(p=>[...p,data.brand.name]);setNewBrand("");setNotice("Brand added.");
    }catch(e){setError(e instanceof Error?e.message:"Could not add brand.");}finally{setSaving(false);}
  }
  async function logout(){const {error}=await createClient().auth.signOut();if(error){setError("Could not sign out. Please try again.");return;}router.replace("/signin");router.refresh();}
  const published=products.filter(p=>p.active).length;
  const missingPrice=products.filter(p=>p.price===null).length;
  const missingStock=products.filter(p=>p.stock===null).length;
  const missingPhotos=products.filter(p=>!p.image?.trim()).length;
  const lowStock=products.filter(p=>p.stock!==null&&p.stock<=5).length;
  const filtered=products.filter(p=>(!query||`${p.name} ${p.brand} ${p.id}`.toLowerCase().includes(query.toLowerCase()))&&(!brand||p.brand===brand)&&(!status||(status==="published"?p.active:status==="hidden"?!p.active:status==="price"?p.price===null:status==="unknown"?p.stock===null:status==="photo"?!p.image?.trim():p.stock!==null&&p.stock<=5)));
  const pages=Math.max(1,Math.ceil(filtered.length/12));const safePage=Math.min(page,pages-1);
  const shown=section==="Overview"?products.slice(0,5):filtered.slice(safePage*12,safePage*12+12);

  return <div className={styles.shell}>
    <aside className={styles.sidebar}><Link href="/" className={styles.logo}><Image src="/brand/authera-logo.png" alt="Authéra Skincare" width={170} height={68} priority/><span>STORE ADMINISTRATION</span></Link><p className={styles.navLabel}>WORKSPACE</p><nav aria-label="Admin navigation">{([{name:"Overview",icon:LayoutDashboard},{name:"Products",icon:Package},{name:"Inventory",icon:Boxes},{name:"Brands",icon:Tags}] as const).map(({name,icon:Icon})=><button key={name} aria-current={section===name?"page":undefined} onClick={()=>navigate(name)}><Icon size={18}/>{name}{name==="Products"&&<span>{products.length}</span>}</button>)}<Link className={styles.ordersNav} href="/admin/orders"><Package size={18}/>Orders</Link></nav><div className={styles.sidebarBottom}><Link href="/" target="_blank" rel="noopener noreferrer">Visit site <ArrowUpRight size={16}/></Link><button onClick={logout}><LogOut size={16}/> Log out</button></div></aside>
    <div className={styles.workspace}><header className={styles.topbar}><span><Store size={16}/> AutheraCare <span className={styles.separator}>/</span> {section}</span><div className={styles.identity}><Link className={styles.visitSite} href="/" target="_blank" rel="noopener noreferrer">Visit site <ArrowUpRight size={16}/></Link><span className={styles.avatar}>{email.slice(0,1).toUpperCase()}</span><span><strong>Store administrator</strong><small>{email}</small></span><button className={styles.mobileLogout} aria-label="Log out" onClick={logout}><LogOut size={17}/></button></div></header>
    <main className={styles.main}><div className={styles.heading}><div><p className={styles.eyebrow}>YOUR STORE, AT A GLANCE</p><h1>{section==="Overview"?"Welcome back.":section}</h1><p>{section==="Overview"?"A little overview of your everyday business.":section==="Products"?"Keep your collection beautiful and up to date.":section==="Inventory"?"Set stock levels and keep availability accurate.":"The names behind your collection."}</p></div><div className={styles.actions}><Link className={styles.secondary} href="/admin/orders">Orders</Link><button className={styles.secondary} disabled={loading} onClick={async()=>{setLoading(true);try{await reload();}catch(e){setError(e instanceof Error?e.message:"Refresh failed.");}finally{setLoading(false);}}}><RefreshCw size={16}/> Refresh</button><button className={styles.primary} disabled={loading||!brands.length} onClick={()=>open()}><Plus size={17}/> Add product</button></div></div>
    {notice&&<div className={styles.notice} role="status"><Check size={17}/>{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice("")}><X size={16}/></button></div>}{error&&<div className={styles.error} role="alert"><AlertCircle size={17}/>{error}</div>}
    <div className={styles.stats}>{[{label:"Total products",value:products.length,detail:`Across ${brands.length} brands`,icon:Package},{label:"Published",value:published,detail:`${products.length-published} hidden from storefront`,icon:Store},{label:"Prices to confirm",value:missingPrice,detail:"Products without a price",icon:Tags},{label:"Stock to confirm",value:missingStock,detail:`${lowStock} with 5 or fewer units`,icon:Boxes},{label:"Photos to upload",value:missingPhotos,detail:"Products without a photo",icon:ImageIcon}].map(({label,value,detail,icon:Icon})=>{const content=<><div><span>{label}</span><Icon size={18}/></div><strong>{loading?"—":value}</strong><small>{detail}</small></>;return <button type="button" className={`${styles.stat} ${styles.statLink}`} key={label} disabled={loading} onClick={()=>{navigate(label==="Stock to confirm"?"Inventory":"Products");setStatus(label==="Published"?"hidden":label==="Prices to confirm"?"price":label==="Stock to confirm"?"unknown":label==="Photos to upload"?"photo":"");requestAnimationFrame(()=>document.getElementById("admin-product-list")?.scrollIntoView({block:"start"}));}}>{content}</button>;})}</div>
    {section==="Overview"&&<div className={styles.overview}><section className={styles.attention}><span className={styles.eyebrow}>NEXT STEPS</span><h2>Make your collection ready.</h2><p>Confirm your product details before taking orders.</p><button onClick={()=>{navigate("Products");setStatus("price");}}><span>Confirm product prices</span><strong>{missingPrice}<ArrowUpRight size={16}/></strong></button><button onClick={()=>{navigate("Inventory");setStatus("unknown");}}><span>Update stock quantities</span><strong>{missingStock}<ArrowUpRight size={16}/></strong></button><p className={styles.muted}>Checkout and order processing haven’t launched yet.</p></section><section className={styles.brandSummary}><Tags size={26}/><h2>A collection of trusted names.</h2><p>{brands.length} brands in your catalog, ready to grow.</p><div>{brands.slice(0,5).map(b=><span key={b}>{b}</span>)}</div><button onClick={()=>navigate("Brands")}>Manage brands <ArrowUpRight size={16}/></button></section></div>}
    {section==="Brands"?<section className={styles.card}><div className={styles.cardHeading}><h2>Your brands <span>{brands.length}</span></h2></div><form className={styles.brandForm} onSubmit={addBrand}><label htmlFor="brand-name">Add a brand</label><input id="brand-name" value={newBrand} maxLength={100} required placeholder="Brand name" onChange={e=>setNewBrand(e.target.value)}/><button className={styles.primary} disabled={saving||loading}>Add brand</button></form><div className={styles.brandGrid}>{brands.map(b=><button key={b} onClick={()=>{navigate("Products");setBrand(b);}}><span>{b}</span><small>{products.filter(p=>p.brand===b).length} products</small><ArrowUpRight size={16}/></button>)}</div></section>:<section id="admin-product-list" className={styles.card}><div className={styles.cardHeading}><div><h2>{section==="Overview"?"Your collection":section==="Inventory"?"Stock overview":"All products"} <span>{section==="Overview"?products.length:filtered.length}</span></h2><p>{section==="Overview"?"A look at the products in your storefront.":"Select a product to manage its details."}</p></div>{section==="Overview"&&<button className={styles.textButton} onClick={()=>navigate("Products")}>View all products <ArrowUpRight size={16}/></button>}</div>
    {section!=="Overview"&&<div className={styles.filters}><label className={styles.search}><Search size={17}/><input aria-label="Search products" placeholder="Search products, brands or IDs…" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></label><select aria-label="Filter by brand" value={brand} onChange={e=>{setBrand(e.target.value);setPage(0);}}><option value="">All brands</option>{brands.map(b=><option key={b}>{b}</option>)}</select><select aria-label="Filter by status" value={status} onChange={e=>{setStatus(e.target.value);setPage(0);}}><option value="">All statuses</option><option value="published">Published</option><option value="hidden">Hidden</option><option value="price">Price not set</option><option value="unknown">Stock unconfirmed</option><option value="photo">Photo not uploaded</option><option value="low">Low / out of stock</option></select></div>}
    <div className={styles.tableWrap}><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead><tbody>{shown.map(p=><tr key={p.id}><td><button className={styles.productCell} onClick={()=>open(p)}><span className={styles.thumb}>{p.image?<Image src={p.image} alt="" width={44} height={52}/>:<ImageIcon size={22}/>}</span><span><strong>{p.name}</strong><small>{p.brand}{p.size?` · ${p.size}`:""}</small></span></button></td><td>{p.category}</td><td className={p.price===null?styles.unset:undefined}>{money(p.price)}</td><td><span className={p.stock===null?styles.unset:p.stock<=5?styles.low:undefined}>{p.stock===null?"Unconfirmed":p.stock===0?"Out of stock":`${p.stock} units`}</span></td><td><span className={p.active?styles.published:styles.hidden}><i/>{p.active?"Published":"Hidden"}</span></td><td><button className={styles.edit} aria-label={`Edit ${p.name}`} onClick={()=>open(p)}><Pencil size={16}/></button></td></tr>)}</tbody></table></div>{loading&&<p className={styles.empty} role="status">Loading your catalog…</p>}{!loading&&!shown.length&&<div className={styles.empty}><Package size={30}/><h3>No products found</h3><p>Try a different search or add a new product.</p></div>}{section!=="Overview"&&<div className={styles.pagination}><span>{filtered.length?safePage*12+1:0}–{Math.min((safePage+1)*12,filtered.length)} of {filtered.length} products</span><div><button aria-label="Previous page" disabled={safePage===0} onClick={()=>setPage(safePage-1)}><ChevronLeft size={16}/></button><span>Page {safePage+1} of {pages}</span><button aria-label="Next page" disabled={safePage+1>=pages} onClick={()=>setPage(safePage+1)}><ChevronRight size={16}/></button></div></div>}</section>}
    <div className={styles.footer}>Authéra Store Administration <span>Made for your everyday business.</span></div></main></div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="editor-title" onCancel={e=>{if(saving||uploading)e.preventDefault();else setDraft(null);}}>{draft&&<form onSubmit={save}><div className={styles.dialogHeader}><div><p className={styles.eyebrow}>YOUR COLLECTION</p><h2 id="editor-title">{creating?"Add a product":"Edit product"}</h2></div><button type="button" aria-label="Close editor" disabled={saving||uploading} onClick={()=>setDraft(null)}><X size={22}/></button></div><div className={styles.editorBody}>
    {editorError&&<p className={styles.error} role="alert">{editorError}</p>}<div className={styles.imageEditor}><div className={styles.preview}>{draft.image?<Image src={draft.image} alt="Product preview" width={100} height={120}/>:<ImageIcon size={36}/>}</div><div><strong>Product image</strong><p>JPG, PNG or WebP · up to 5 MB</p><label className={styles.upload}><Upload size={15}/>{uploading?"Uploading…":"Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading||saving} onChange={e=>void upload(e.target.files?.[0])}/></label>{draft.image&&<button type="button" className={styles.textButton} disabled={saving||uploading} onClick={()=>setDraft({...draft,image:null})}>Remove image</button>}</div></div>
    <label className={styles.field}>Product name<input value={draft.name} required maxLength={200} onChange={e=>setDraft({...draft,name:e.target.value,...(creating?{id:e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100)}:{})})}/></label><label className={styles.field}>Product ID<input value={draft.id} readOnly={!creating} required maxLength={100} pattern="[a-z0-9][a-z0-9-]*" onChange={e=>setDraft({...draft,id:e.target.value})}/><small>Unique lowercase ID. Use letters, numbers and hyphens.</small></label><div className={styles.fieldGrid}><label className={styles.field}>Brand<select required value={draft.brand} onChange={e=>setDraft({...draft,brand:e.target.value})}>{brands.map(b=><option key={b}>{b}</option>)}</select></label><label className={styles.field}>Category<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div><label className={styles.field}>Size<input placeholder="e.g. 30 mL" value={draft.size??""} maxLength={150} onChange={e=>setDraft({...draft,size:e.target.value||null})}/></label><div className={styles.fieldGrid}><label className={styles.field}>Price (BDT)<input type="number" min="0" max="9999999999.99" step="0.01" placeholder="Not confirmed" value={draft.price??""} onChange={e=>setDraft({...draft,price:e.target.value===""?null:Number(e.target.value)})}/></label><label className={styles.field}>Stock quantity<input type="number" min="0" max="2147483647" step="1" placeholder="Not confirmed" value={draft.stock??""} onChange={e=>setDraft({...draft,stock:e.target.value===""?null:Number(e.target.value)})}/></label></div><label className={styles.field}>Description<textarea rows={4} maxLength={10000} value={draft.description??""} onChange={e=>setDraft({...draft,description:e.target.value||null})}/></label><label className={styles.field}>Display order<input type="number" min="0" max="2147483647" step="1" required value={draft.position} onChange={e=>setDraft({...draft,position:Number(e.target.value)})}/></label><label className={styles.publishControl}><input type="checkbox" checked={draft.active} onChange={e=>setDraft({...draft,active:e.target.checked})}/><span><strong>Publish to storefront</strong><small>Hidden products are visible only to administrators.</small></span></label></div><div className={styles.dialogFooter}><button type="button" className={styles.secondary} disabled={saving||uploading} onClick={()=>setDraft(null)}>Cancel</button><button className={styles.primary} disabled={saving||uploading}>{saving?"Saving…":creating?"Create product":"Save changes"}</button></div></form>}</dialog>
  </div>;
}
