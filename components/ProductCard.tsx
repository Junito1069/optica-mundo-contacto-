import type { Product } from "@/types/product";
import Link from "next/link";
import { AddToCartButton } from "@/components/Cart/AddToCartButton";

type ProductCardProps = { product: Product; index: number };

export function ProductCard({ product, index }: ProductCardProps) {
  const visualClass = index === 0 ? "object-one" : "object-two";
  return <article className="object-card" data-product-card data-cursor="view"><div className="object-number">0{index + 1}</div><Link href={`/products/${product.slug}`} className={`object-visual ${visualClass}`} aria-label={`Ver ${product.name}`}><span /></Link><div className="object-info"><div><h3>{product.name}</h3><p>{product.category} / {product.variants[0]?.value}</p></div><strong>${product.price}</strong></div><div className="object-action"><Link href={`/products/${product.slug}`}>VER PRODUCTO <span>↗</span></Link><AddToCartButton product={product} className="card-add" /></div></article>;
}