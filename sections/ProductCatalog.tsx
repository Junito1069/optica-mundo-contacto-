"use client";

import { useDeferredValue, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { featuredProducts } from "@/data/products";

type SortOption = "featured" | "price-low" | "price-high" | "name";

export function ProductCatalog() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const products = featuredProducts
    .filter((product) => `${product.name} ${product.category} ${product.description} ${product.features.join(" ")}`.toLowerCase().includes(normalizedQuery))
    .toSorted((firstProduct, secondProduct) => {
      if (sort === "price-low") return firstProduct.price - secondProduct.price;
      if (sort === "price-high") return secondProduct.price - firstProduct.price;
      if (sort === "name") return firstProduct.name.localeCompare(secondProduct.name);
      return 0;
    });

  return <section className="product-catalog" aria-labelledby="products-title">
    <div className="product-archive-label">MUNDO CONTACTO / ARCHIVO 2026</div>
    <div className="product-catalog-heading">
      <h1 id="products-title">TODOS LOS<br /><em>PRODUCTOS.</em></h1>
      <p>Encuentra lentes de contacto y cuidado visual original para cada necesidad.</p>
    </div>
    <div className="product-search-row">
      <label className="product-search">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="BUSCA POR MARCA, TIPO O TECNOLOGÍA" aria-label="Buscar en todos los productos" />
      </label>
      <label className="product-sort">ORDENAR
        <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Ordenar productos">
          <option value="featured">DESTACADOS</option>
          <option value="price-low">PRECIO: MENOR A MAYOR</option>
          <option value="price-high">PRECIO: MAYOR A MENOR</option>
          <option value="name">NOMBRE: A-Z</option>
        </select>
      </label>
    </div>
    <div className="product-results" aria-live="polite">
      <span>{String(products.length).padStart(2, "0")} ARTÍCULOS DISPONIBLES</span>
      <span>{normalizedQuery ? `BÚSQUEDA: ${deferredQuery.toUpperCase()}` : "CATÁLOGO COMPLETO"}</span>
    </div>
    {products.length ? <div className="object-grid product-grid">{products.map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}</div> : <p className="product-empty">NO ENCONTRAMOS PRODUCTOS CON ESE CRITERIO.</p>}
  </section>;
}