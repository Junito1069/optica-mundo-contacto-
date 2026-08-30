"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchPublicProducts } from "@/lib/catalog";
import type { Product } from "@/types/product";

export function CategoryCatalog() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const categories = ["Todos", ...Array.from(new Set(catalogue.map((product) => product.category)))];
  useEffect(() => { void fetchPublicProducts().then(setCatalogue).catch(() => setError("NO PUDIMOS CARGAR EL CATÁLOGO.")); }, []);
  const products = activeCategory === "Todos"
    ? catalogue
    : catalogue.filter((product) => product.category === activeCategory);

  return <section className="category-catalog" id="catalogo" aria-labelledby="catalog-title">
    <div className="category-heading">
      <div>
        <p className="section-kicker">[ CATÁLOGO POR CATEGORÍA ]</p>
        <h1 id="catalog-title">ENCUENTRA TU<br /><em>MEJOR OPCIÓN.</em></h1>
      </div>
      <p>Elige según tu rutina, frecuencia de uso y el cuidado que necesita tu visión.</p>
    </div>
    <div className="category-toolbar" aria-label="Filtrar productos por categoría">
      <div className="category-filters">
        {categories.map((category) => <button className={category === activeCategory ? "active" : undefined} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
      </div>
    </div>
    <div className="category-results" aria-live="polite">
      <span>{String(products.length).padStart(2, "0")} PRODUCTOS</span>
      <span>{activeCategory === "Todos" ? "TODAS LAS CATEGORÍAS" : activeCategory.toUpperCase()}</span>
    </div>
    <div className="object-grid category-grid">
      {products.map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}
    </div>
    {error && <p className="product-empty" role="alert">{error}</p>}
  </section>;
}