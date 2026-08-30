import type { CartItem } from "@/types/cart";

export const CART_STORAGE_KEY = "mundo-contacto-cart";

export function readCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) as CartItem[] : [];
  } catch { return []; }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}