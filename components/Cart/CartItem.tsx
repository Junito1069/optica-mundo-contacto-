"use client";

import { useCart } from "@/components/Cart/CartProvider";
import type { CartItem as CartItemType } from "@/types/cart";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();
  return <article className="cart-item"><div className="cart-item-visual" aria-hidden="true" /><div className="cart-item-info"><p>{item.product.category}</p><h3>{item.product.name}</h3><span>${item.product.price.toFixed(2)}</span><div className="cart-item-actions"><div className="quantity-control"><button aria-label="Disminuir cantidad" onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}>−</button><b>{item.quantity}</b><button aria-label="Aumentar cantidad" onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}>+</button></div><button className="remove-item" onClick={() => removeItem(item.product.id, item.variantId)}>ELIMINAR</button></div></div></article>;
}