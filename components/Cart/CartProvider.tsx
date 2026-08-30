"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { readCart, writeCart } from "@/lib/cart/storage";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

type CartContextValue = { items: CartItem[]; itemCount: number; subtotal: number; open: boolean; setOpen: (open: boolean) => void; addItem: (product: Product, variantId?: string) => void; updateQuantity: (productId: string, quantity: number, variantId?: string) => void; removeItem: (productId: string, variantId?: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const hydrated = useRef(false);
  useEffect(() => { const task = window.setTimeout(() => { hydrated.current = true; setItems(readCart()); }, 0); return () => window.clearTimeout(task); }, []);
  useEffect(() => { if (hydrated.current) writeCart(items); }, [items]);
  const addItem = useCallback((product: Product, variantId?: string) => setItems((current) => {
    const index = current.findIndex((item) => item.product.id === product.id && item.variantId === variantId);
    if (index < 0) return [...current, { product, quantity: 1, variantId }];
    return current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
  }), []);
  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => setItems((current) => current.flatMap((item) => item.product.id === productId && item.variantId === variantId ? (quantity > 0 ? [{ ...item, quantity: Math.min(quantity, item.product.stock) }] : []) : [item])), []);
  const removeItem = useCallback((productId: string, variantId?: string) => setItems((current) => current.filter((item) => item.product.id !== productId || item.variantId !== variantId)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, open, setOpen, addItem, updateQuantity, removeItem, clearCart, itemCount: items.reduce((total, item) => total + item.quantity, 0), subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0) }), [items, open, addItem, updateQuantity, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}