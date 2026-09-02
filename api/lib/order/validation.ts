import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().uuid("Producto inválido."),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a cero."),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1, "El carrito debe contener al menos un producto."),
  customerName: z.string().trim().min(2, "El nombre es obligatorio."),
  customerEmail: z.string().trim().email("Ingresa un email válido."),
  customerPhone: z.string().trim().min(7, "Ingresa un teléfono válido."),
  deliveryAddress: z.string().trim().min(5, "La dirección de entrega es obligatoria."),
  deliveryCity: z.string().trim().min(2, "La ciudad es obligatoria."),
  deliverySector: z.string().trim().min(2, "El sector es obligatorio."),
  deliveryReference: z.string().trim().min(2, "Indica una referencia de entrega."),
  deliveryAddress2: z.string().trim().max(250).optional().nullable().transform((value) => value || null),
  deliveryPostalCode: z.string().trim().max(20).optional().nullable().transform((value) => value || null),
  deliveryNotes: z.string().trim().max(1000).optional().nullable().transform((value) => value || null),
  paymentMethod: z.string().trim().default("PAGO CONTRA ENTREGA"),
}).strict();
