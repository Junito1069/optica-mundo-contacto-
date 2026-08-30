export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  stock: number;
  sku: string;
  features: string[];
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  name: string;
  value: string;
  available: boolean;
};