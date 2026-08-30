"use client";

import Link from "next/link";
import { CartItem } from "@/components/Cart/CartItem";
import { useCart } from "@/components/Cart/CartProvider";

export function CartDrawer() {
  const { items, open, setOpen, subtotal } = useCart();
  return <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Carrito de compra"><div className="cart-drawer-header"><div><p>TU SELECCIÓN</p><h2>Carrito</h2></div><button onClick={() => setOpen(false)} aria-label="Cerrar carrito">×</button></div><div className="cart-items">{items.length ? items.map((item) => <CartItem item={item} key={`${item.product.id}-${item.variantId ?? "default"}`} />) : <p className="cart-empty">Tu carrito está vacío.<br />Explora nuestros lentes de contacto.</p>}</div><div className="cart-summary"><div><span>SUBTOTAL</span><strong>RD$ {subtotal.toFixed(2)}</strong></div>{items.length ? <Link href="/checkout" className="primary-action">CONTINUAR CON EL PEDIDO</Link> : <button className="primary-action" disabled>CONTINUAR CON EL PEDIDO</button>}<p>Pago contra entrega.</p></div></aside>;
}