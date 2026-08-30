import type { Product } from "@/types/product";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type ApiProduct = {
  id: string; name: string; slug: string; description: string; price: number; stock: number; sku: string; imageUrl: string | null;
  category: { name: string }; material: string | null; type: string | null; duration: string | null; boxContent: string | null;
};

function toStoreProduct(product: ApiProduct): Product {
  const features = [product.material, product.type, product.duration].filter((value): value is string => Boolean(value));
  return { id: product.id, name: product.name, slug: product.slug, description: product.description, category: product.category.name, images: product.imageUrl ? [product.imageUrl] : [], price: product.price, stock: product.stock, sku: product.sku, features, variants: product.boxContent ? [{ id: `${product.id}-presentation`, name: "Presentación", value: product.boxContent, available: product.stock > 0 }] : [] };
}

export async function fetchPublicProducts(): Promise<Product[]> {
  const response = await fetch(`${apiUrl}/api/products`, { cache: "no-store" });
  if (!response.ok) throw new Error("No fue posible cargar el catálogo.");
  const payload = await response.json() as { data: ApiProduct[] };
  return payload.data.map(toStoreProduct);
}