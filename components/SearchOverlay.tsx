"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { featuredProducts } from "@/data/products";

type SearchOverlayProps = { open: boolean; onClose: () => void };

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const results = useMemo(() => featuredProducts.filter((product) => `${product.name} ${product.category} ${product.description} ${product.sku} ${product.features.join(" ")}`.toLowerCase().includes(query.toLowerCase().trim())), [query]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", closeOnEscape); };
  }, [open, onClose]);

  return <div className={`search-overlay ${open ? "open" : ""}`} aria-hidden={!open} role="dialog" aria-modal="true" aria-label="Search eyewear">
    <button className="search-close" onClick={onClose} aria-label="Close search">CLOSE <span>×</span></button>
    <div className="search-panel"><p>SEARCH THE ARCHIVE</p><label><span>⌕</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" placeholder="Search eyewear..." /></label>
      {query && <div className="search-results">{results.length ? results.map((product) => <div key={product.id}>{product.name}<span>{product.category} / {product.variants[0]?.value}</span></div>) : <div>NO OBJECTS FOUND</div>}</div>}
    </div>
  </div>;
}