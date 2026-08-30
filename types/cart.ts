import type { Product } from "@/types/product";

export type CartItem = {
  product: Product;
  quantity: number;
  variantId?: string;
};