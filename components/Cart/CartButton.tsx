"use client";

import { useCart } from "@/components/Cart/CartProvider";

export function CartButton() {
  const { itemCount, setOpen } = useCart();
  return <button id="cart-control" className="cart-control" data-cursor="view" aria-label={`Carrito, ${itemCount} productos`} onClick={() => setOpen(true)}>CARRITO <span>{itemCount}</span></button>;
}