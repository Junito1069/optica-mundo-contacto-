import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().nullable().transform((value) => value || null);
const requiredMoney = z.coerce.number().finite().nonnegative().max(9999999.99);
const imageUrl = z.string().trim().min(1, "Adjunta una imagen del producto.").refine((value) => {
  if (/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value)) return Buffer.byteLength(value.split(",", 2)[1] ?? "", "base64") <= 5 * 1024 * 1024;
  return /^https?:\/\/[^\s]+$/i.test(value);
}, "La imagen debe ser JPG, PNG o WEBP y no superar 5 MB.");

export const categorySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe usar minúsculas, números y guiones."),
  description: optionalText,
  imageUrl: z.string().trim().min(1, "Adjunta una imagen del producto.").refine((value) => /^(data:image\/(png|webp|svg\+xml);base64,|https?:\/\/.*\.(png|webp|svg)(\?.*)?$)/i.test(value), "La imagen debe ser PNG, WebP o SVG."),
  published: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe usar minúsculas, números y guiones."),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres.").max(4000),
  categoryId: z.string().uuid("Selecciona una categoría válida."),
  price: requiredMoney,
  compareAtPrice: requiredMoney.optional().nullable(),
  sku: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  stock: z.coerce.number().int().nonnegative(),
  minimumStock: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  imageUrl: imageUrl.optional().nullable().transform((value) => value || null),
  brand: optionalText,
  type: optionalText,
  duration: optionalText,
  material: optionalText,
  boxContent: optionalText,
  baseCurve: optionalText,
  diameter: optionalText,
  power: optionalText,
  cylinder: optionalText,
  axis: optionalText,
  addition: optionalText,
}).superRefine((value, context) => {
  if (value.compareAtPrice !== null && value.compareAtPrice !== undefined && value.compareAtPrice < value.price) context.addIssue({ code: "custom", path: ["compareAtPrice"], message: "El precio anterior no puede ser menor al precio actual." });
});

export const inventoryMovementSchema = z.object({
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().refine((value) => value !== 0, "La cantidad no puede ser cero."),
  reason: z.string().trim().min(3, "Indica un motivo.").max(500),
});