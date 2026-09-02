import type { Product } from "@/types/product";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/Cart/AddToCartButton";

type ProductCardProps = { product: Product; index: number };

export function ProductCard({ product, index }: ProductCardProps) {
  const router = useRouter();
  const openProduct = () => router.push(`/products/${product.slug}`);
  return <article className="object-card" data-product-card data-cursor="view" role="link" tabIndex={0} onClick={(event) => { if (!(event.target as HTMLElement).closest("a, button")) openProduct(); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openProduct(); } }}><div className="object-number">{String(index + 1).padStart(2, "0")}</div><Link href={`/products/${product.slug}`} className="object-visual" aria-label={`Ver ${product.name}`}>{product.images[0] ? <img src={product.images[0]} alt="" /> : <span />}</Link><div className="object-info"><div><h3>{product.name}</h3><p>{product.category} / {product.variants[0]?.value}</p></div><strong>${product.price}</strong></div><div className="object-action"><Link href={`/products/${product.slug}`}>VER PRODUCTO <span>↗</span></Link><AddToCartButton product={product} className="card-add" /></div></article>;
}