import type { Product } from "@/types/product";

export const featuredProducts: Product[] = [];

export const getProductBySlug = (slug: string) => featuredProducts.find((product) => product.slug === slug);