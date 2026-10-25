"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { skinTypes, type SkinType } from "@/lib/catalog/skin-types";

export default function SkinTypeFilter({ selected, onChange }: { selected: SkinType[]; onChange: (values: SkinType[]) => void }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return <aside className="price-filter skin-type-filter" aria-label="Filter by skin type"><button className="price-filter-heading" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>Skin Type {open ? <Minus size={19}/> : <Plus size={19}/>}</button><div id={id} hidden={!open}><fieldset><legend className="screen-reader-only">Skin types</legend>{skinTypes.map(type => <label key={type}><input type="checkbox" checked={selected.includes(type)} onChange={event => onChange(event.target.checked ? [...selected, type] : selected.filter(value => value !== type))}/><span>{type}</span></label>)}</fieldset>{selected.length > 0 && <><button className="price-filter-reset" onClick={() => onChange([])}>Clear skin types</button><p className="price-filter-note">Products without matching skin-type information are hidden.</p></>}</div></aside>;
}
