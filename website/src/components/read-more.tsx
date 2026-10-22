"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function ReadMore({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (expanded) content.current?.focus({ preventScroll: true });
  }, [expanded]);
  return <div className="journal-read">
    {!expanded && <button type="button" aria-expanded={false} aria-controls={id} onClick={() => setExpanded(true)}>Read more<span className="screen-reader-only"> — {title}</span></button>}
    {expanded && <div ref={content} id={id} className="journal-more-content" tabIndex={-1} role="region" aria-label={title}>{children}</div>}
  </div>;
}
