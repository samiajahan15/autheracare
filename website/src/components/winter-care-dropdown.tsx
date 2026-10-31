"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function WinterCareDropdown({ value, categories, onChange, season = "Winter" }: { value: string; categories: string[]; onChange: (value: string) => void; season?: string }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = [{ value: "", label: `All ${season.toLowerCase()} care` }, ...categories.map(category => ({ value: category, label: category }))];
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  function select(index: number) {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  return <div ref={root} className={`winter-care-filter winter-dropdown${open ? " is-open" : ""}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <span id={`${id}-label`}>Shop by care type</span>
    <button ref={trigger} type="button" className="winter-dropdown-trigger" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} aria-labelledby={`${id}-label ${id}-value`} aria-activedescendant={open ? `${id}-option-${active}` : undefined} onClick={() => { setActive(selected); setOpen(!open); }} onKeyDown={event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) { setOpen(true); setActive(selected); }
        else setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault(); setOpen(true); setActive(event.key === "Home" ? 0 : options.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); if (open) select(active); else { setActive(selected); setOpen(true); }
      } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      else if (event.key === "Tab") setOpen(false);
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const match = options.findIndex(option => option.label.toLowerCase().startsWith(event.key.toLowerCase()));
        if (match >= 0) { event.preventDefault(); setActive(match); setOpen(true); }
      }
    }}><span id={`${id}-value`}>{options[selected].label}</span><ChevronDown size={17} aria-hidden="true"/></button>
    <div className="winter-dropdown-menu" inert={!open} aria-hidden={!open}>
      <div id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`}>
        {options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={value === option.value} className={`winter-dropdown-option${active === index ? " is-active" : ""}`} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => select(index)}><span>{option.label}</span>{value === option.value && <Check size={16} aria-hidden="true"/>}</div>)}
      </div>
    </div>
  </div>;
}
