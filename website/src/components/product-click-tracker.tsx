"use client";

import { useEffect } from "react";

export default function ProductClickTracker() {
  useEffect(() => {
    const sent = new Set<string>();
    let pending = Promise.resolve();
    const track = (event: MouseEvent) => {
      if (!event.isTrusted || (event.type === "auxclick" && event.button !== 1)) return;
      const target = event.target instanceof Element ? event.target.closest("a[href], [data-product-click]") : null;
      let id = target?.getAttribute("data-product-click");
      if (!id && target instanceof HTMLAnchorElement) {
        const url = new URL(target.href);
        if (url.origin !== location.origin) return;
        const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);
        if (match) { try { id = decodeURIComponent(match[1]); } catch { return; } }
      }
      if (!id || sent.has(id)) return;
      sent.add(id);
      const productId = id;
      pending = pending.then(async () => {
        try {
          const response = await fetch("/api/products/popularity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }), keepalive: true });
          if (!response.ok) sent.delete(productId);
        } catch { sent.delete(productId); }
      });
    };
    document.addEventListener("click", track, true);
    document.addEventListener("auxclick", track, true);
    return () => { document.removeEventListener("click", track, true); document.removeEventListener("auxclick", track, true); };
  }, []);
  return null;
}
