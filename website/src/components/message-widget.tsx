"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Minus, Send, Copy, Check } from "lucide-react";
import styles from "./message-widget.module.css";

const messengerUrl = "https://m.me/Authera.Skincare";

export default function MessageWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  if (pathname.startsWith("/admin")) return null;
  async function copyMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    try { await navigator.clipboard.writeText(message.trim()); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); setCopied(false); input.current?.focus(); input.current?.select(); }
  }
  function close() { setOpen(false); trigger.current?.focus(); }
  return <aside className={styles.widget} aria-label="Contact Authéra">
    {open && <div ref={panel} className={styles.panel} id="authera-message-panel" role="dialog" aria-labelledby="authera-message-title" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
      <header className={styles.heading}><div><span className={styles.brand}>AUTHÉRA CARE</span><h2 id="authera-message-title">Hi there!</h2><p>How can we help?</p></div><button type="button" aria-label="Minimize messaging" onClick={close}><Minus size={20}/></button></header>
      <div className={styles.content}><p className={styles.intro}>Questions about a product or your order? Message the Authéra team.</p>
        <form onSubmit={copyMessage}><label htmlFor="authera-message">Your message</label><div className={styles.composer}><textarea id="authera-message" ref={input} value={message} required maxLength={2000} rows={3} placeholder="Write your message…" onChange={event => { setMessage(event.target.value); setCopied(false); setCopyError(false); }}/><button type="submit" aria-label="Copy message for Messenger" title="Copy message"><Copy size={17}/></button></div></form>
        <p className={styles.help} role="status">{copied ? <><Check size={14}/>Message copied. Open Messenger and paste it to send.</> : copyError ? "Select and copy your message, then paste it into Messenger." : "Copy your message, then continue in Messenger to send it."}</p>
        <a className={styles.messenger} href={messengerUrl} target="_blank" rel="noopener noreferrer"><Send size={16}/>Continue in Messenger</a>
        <div className={styles.social}><span>Find us on</span><a href="https://www.facebook.com/Authera.Skincare" target="_blank" rel="noopener noreferrer">Facebook</a></div>
      </div>
    </div>}
    <button ref={trigger} type="button" className={styles.launcher} aria-label={open ? "Close messaging" : "Message Authéra"} aria-expanded={open} aria-controls="authera-message-panel" onClick={() => setOpen(value => !value)}><MessageCircle size={25}/>{!open && <span className={styles.tooltip}>Message us</span>}</button>
  </aside>;
}
