import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const legacyProducts = [
  { name: "Acuvue Oasys", slug: "acuvue-oasys", description: "Lentes diarios de silicona hidrogel para una visión cómoda y nítida durante todo el día.", category: "Lentes diarios", price: 32, stock: 18, sku: "MC-AO-06", brand: "Acuvue", type: "Lentes de contacto", duration: "Diario", material: "Silicona hidrogel", boxContent: "Caja x 6", featured: true },
  { name: "Biofinity", slug: "biofinity", description: "Lentes mensuales con alta permeabilidad al oxígeno y sensación de hidratación constante.", category: "Lentes mensuales", price: 38, stock: 12, sku: "MC-BF-06", brand: "CooperVision", type: "Lentes de contacto", duration: "Mensual", material: "Aquaform", boxContent: "Caja x 3", featured: true },
  { name: "Air Optix plus HydraGlyde", slug: "air-optix-plus-hydraglyde", description: "Una superficie ultrasuave que ayuda a mantener los depósitos alejados de la lente.", category: "Lentes de contacto", price: 35, stock: 7, sku: "MC-AO-HG", brand: "Alcon", type: "Lentes de contacto", duration: "Mensual", material: "Silicona hidrogel", boxContent: "Caja x 3", featured: false },
  { name: "Precision1 Daily", slug: "precision1-daily", description: "Lentes diarios con tecnología de humedad para una experiencia fresca desde la mañana hasta la noche.", category: "Lentes diarios", price: 29, stock: 25, sku: "MC-P1-30", brand: "Alcon", type: "Lentes de contacto", duration: "Diario", material: "SMARTSURFACE", boxContent: "Caja x 30", featured: false },
  { name: "FreshLook ColorBlends", slug: "freshlook-colorblends", description: "Lentes de color desechables con opciones con y sin graduación en tonos naturales.", category: "Lentes de color", price: 27, stock: 15, sku: "MC-FL-CB", brand: "Alcon", type: "Lentes de color", duration: "Mensual", boxContent: "Caja x 2", featured: false },
  { name: "Renu Fresh", slug: "renu-solution", description: "Solución multipropósito para limpiar, enjuagar y conservar lentes blandos.", category: "Accesorios", price: 11, stock: 20, sku: "MC-RF-355", brand: "Bausch + Lomb", type: "Cuidado visual", boxContent: "355 ml", featured: false },
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Define DATABASE_URL antes de importar productos.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

async function main() {
  for (const item of legacyProducts) {
    const category = await prisma.category.upsert({ where: { slug: slugify(item.category) }, create: { name: item.category, slug: slugify(item.category), published: true }, update: { published: true } });
    const { category: legacyCategory, ...productData } = item;
    void legacyCategory;
    await prisma.product.upsert({ where: { sku: item.sku }, create: { ...productData, categoryId: category.id, status: "PUBLISHED", minimumStock: 3 }, update: { ...productData, categoryId: category.id, status: "PUBLISHED", minimumStock: 3 } });
  }
  console.log(`Importados ${legacyProducts.length} productos y sus categorías.`);
}

main().finally(() => prisma.$disconnect());