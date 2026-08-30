"use client";

import type { Product } from "@/types/product";
import { useCart } from "@/components/Cart/CartProvider";

function flyToCart(source: DOMRect) {
  const target = document.getElementById("cart-control")?.getBoundingClientRect();
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const flyer = document.createElement("div");
  flyer.className = "cart-flyer";
  flyer.style.left = `${source.left + source.width / 2}px`;
  flyer.style.top = `${source.top + source.height / 2}px`;
  document.body.appendChild(flyer);
  flyer.animate([{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 }, { transform: `translate(${target.left - source.left}px, ${target.top - source.top}px) scale(.2)`, opacity: 0 }], { duration: 540, easing: "cubic-bezier(.2,.8,.2,1)" }).finished.finally(() => flyer.remove());
}

export function AddToCartButton({ product, variantId, className = "primary-action" }: { product: Product; variantId?: string; className?: string }) {
  const { addItem, setOpen } = useCart();
  return <button className={className} data-cursor="view" onClick={(event) => { addItem(product, variantId); flyToCart(event.currentTarget.getBoundingClientRect()); setOpen(true); }}>ADD TO CART</button>;
}