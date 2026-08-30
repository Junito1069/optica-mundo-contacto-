import type { Category, Product } from "@/generated/prisma/client";

export function serializeCategory(category: Category) {
  return { ...category, createdAt: category.createdAt.toISOString(), updatedAt: category.updatedAt.toISOString() };
}

export function serializeProduct(product: Product & { category: Category }) {
  return {
    id: product.id, name: product.name, slug: product.slug, description: product.description, categoryId: product.categoryId,
    category: serializeCategory(product.category), price: Number(product.price), compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
    sku: product.sku, stock: product.stock, minimumStock: product.minimumStock, status: product.status, featured: product.featured, imageUrl: product.imageUrl,
    brand: product.brand, type: product.type, duration: product.duration, material: product.material, boxContent: product.boxContent,
    baseCurve: product.baseCurve, diameter: product.diameter, power: product.power, cylinder: product.cylinder, axis: product.axis, addition: product.addition,
    createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString(),
  };
}