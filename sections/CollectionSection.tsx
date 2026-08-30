"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { featuredProducts } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function CollectionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;
    const context = gsap.context(() => { gsap.fromTo("[data-product-card]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.11, ease: "power3.out", scrollTrigger: { trigger: ".object-grid", start: "top 84%", once: true } }); }, sectionRef);
    return () => context.revert();
  }, [reducedMotion]);
  return <section ref={sectionRef} className="collection-preview" id="productos" aria-labelledby="collection-title"><div className="section-kicker">[ PRODUCTOS DESTACADOS ]</div><div className="collection-heading"><h2 id="collection-title">LENTES PARA<br /><em>CADA RUTINA.</em></h2><Link href="/categorias" className="line-link" data-cursor="explore">VER CATÁLOGO <span>↘</span></Link></div><div className="object-grid">{featuredProducts.slice(0, 2).map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}</div></section>;
}