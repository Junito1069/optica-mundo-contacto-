import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCartButton } from "@/components/Cart/AddToCartButton";
import { apiUrl } from "@/lib/api-url";
import type { Product } from "@/types/product";

type ApiProduct = Omit<Product, "category" | "images" | "features" | "variants"> & { imageUrl: string | null; category: { name: string }; material: string | null; type: string | null; duration: string | null; boxContent: string | null };

async function getProduct(slug: string) {
  const response = await fetch(`${apiUrl}/api/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No fue posible cargar el producto.");
  const payload = await response.json() as { data: ApiProduct };
  const product = payload.data;
  return { ...product, category: product.category.name, images: product.imageUrl ? [product.imageUrl] : [], features: [product.material, product.type, product.duration].filter((value): value is string => Boolean(value)), variants: product.boxContent ? [{ id: `${product.id}-presentation`, name: "Presentación", value: product.boxContent, available: product.stock > 0 }] : [] };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  return <main className="product-detail"><Link href="/productos" className="line-link">← VOLVER AL CATÁLOGO</Link><div className="product-detail-grid"><div className="product-detail-visual">{product.images[0] && <img src={product.images[0]} alt={product.name} />}</div><section><p className="section-kicker">{product.category}</p><h1>{product.name}</h1><p className="product-detail-description">{product.description}</p><strong className="product-detail-price">${product.price}</strong><p className="product-detail-stock">{product.stock > 0 ? "DISPONIBLE" : "AGOTADO"}</p><AddToCartButton product={product} className="primary-action" /></section></div></main>;
}