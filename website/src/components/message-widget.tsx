"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { MessagesSquare, MessageCircle, Minus, Send, Check } from "lucide-react";
import styles from "./message-widget.module.css";

const messengerUrl = "https://m.me/Authera.Skincare";
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

function MessengerIcon() {
  return <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><defs><linearGradient id="messenger-gradient" x2="0" y2="1"><stop stopColor="#ff6685"/><stop offset=".5" stopColor="#a442ff"/><stop offset="1" stopColor="#287bff"/></linearGradient></defs><path fill="url(#messenger-gradient)" d="M16 2C8.3 2 2 7.8 2 15c0 4.1 2 7.8 5.2 10.2V30l4.7-2.6c1.3.4 2.7.6 4.1.6 7.7 0 14-5.8 14-13S23.7 2 16 2Z"/><path fill="white" d="m7 20 7.3-7.8 4.4 3.3L25 11l-7.1 7.8-4.5-3.3Z"/></svg>;
}

export default function MessageWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
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
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message.trim() || "Hi Authéra! I have a question about your products.")}` : null;
  async function prepareMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    if (whatsappUrl) { window.open(whatsappUrl, "_blank", "noopener,noreferrer"); return; }
    try { await navigator.clipboard.writeText(message.trim()); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); setCopied(false); input.current?.focus(); input.current?.select(); }
  }
  function close() { setOpen(false); trigger.current?.focus(); }
  return <aside className={styles.widget} aria-label="Contact Authéra">
    {open && <div ref={panel} className={styles.panel} id="authera-message-panel" role="dialog" aria-labelledby="authera-message-title" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
      <header className={styles.heading}><div><h2 id="authera-message-title">Hi there! <span aria-hidden="true">👋</span></h2><p>How can we help you today?</p></div><button type="button" aria-label="Minimize messaging" onClick={close}><Minus size={20}/></button></header>
      <div className={styles.content}>
        <form onSubmit={prepareMessage}><label className={styles.srOnly} htmlFor="authera-message">Your message</label><div className={styles.composer}><input id="authera-message" ref={input} value={message} required maxLength={2000} placeholder="Ask anything…" aria-describedby="authera-message-help" onChange={event => { setMessage(event.target.value); setCopied(false); setCopyError(false); }}/><button type="submit" aria-label={whatsappUrl ? "Continue in WhatsApp with your message" : "Copy message for Messenger"} title={whatsappUrl ? "Continue in WhatsApp" : "Copy message for Messenger"}><Send size={19}/></button></div></form>
        <p className={styles.help} id="authera-message-help" role="status">{copied ? <><Check size={14}/>Copied! Open Messenger and paste to send.</> : copyError ? "Copy your message, then paste it into Messenger." : whatsappUrl ? "Continue in WhatsApp to send your message." : "Copy your message above, then paste it into Messenger."}</p>
        <p className={styles.socialLabel}>Chat on Social</p>
        <div className={styles.social}>
          <a className={styles.messenger} href={messengerUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on Messenger" title="Messenger"><MessengerIcon/></a>
          {whatsappUrl && <a className={styles.whatsapp} href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="WhatsApp"><MessageCircle size={25}/></a>}
        </div>
      </div>
    </div>}
    <button ref={trigger} type="button" className={styles.launcher} aria-label={open ? "Close messaging" : "Message Authéra"} aria-expanded={open} aria-controls={open ? "authera-message-panel" : undefined} onClick={() => setOpen(value => !value)}><MessagesSquare size={27}/>{!open && <span className={styles.tooltip}>Chat with us</span>}</button>
  </aside>;
}
