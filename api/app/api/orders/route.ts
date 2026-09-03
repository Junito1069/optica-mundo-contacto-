import { ApiError, json } from "@/lib/http/response";
import { getPrisma } from "@/lib/db/prisma";
import { withCors, preflight } from "@/lib/http/cors";
import { orderCreateSchema } from "@/lib/order/validation";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return withCors(request, json({ error: "Tu sesión no es válida. Inicia sesión nuevamente." }, { status: 401 }));

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      throw new ApiError(400, "El cuerpo de la petición debe ser JSON válido.");
    }
    console.log("Datos recibidos en el servidor:", rawBody);

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody) || !Array.isArray((rawBody as { items?: unknown }).items) || !(rawBody as { items: unknown[] }).items.length) {
      throw new ApiError(400, "El carrito debe ser un arreglo con al menos un producto.");
    }

    const body = rawBody as Record<string, unknown>;
    const normalizedBody = {
      ...body,
      items: (body.items as Array<Record<string, unknown>>).map((item) => ({
        ...item,
        quantity: typeof item.quantity === "string" ? Number.parseInt(item.quantity, 10) : item.quantity,
      })),
    };
    const parsed = orderCreateSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.length ? issue.path.join(".") : "(root)",
        message: issue.message,
      }));
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.", details);
    }

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliverySector,
      deliveryReference,
      deliveryAddress2,
      deliveryPostalCode,
      deliveryNotes,
      paymentMethod,
    } = parsed.data;

    if (customerName !== user.name || customerEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new ApiError(422, "Los datos de la cuenta no coinciden con la sesión activa.");
    }

    const productIds = items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new ApiError(422, "El carrito contiene productos repetidos. Actualízalo e inténtalo nuevamente.");
    }
    const products = await getPrisma().product.findMany({ where: { id: { in: productIds }, status: "PUBLISHED" } });

    if (products.length !== items.length) {
      throw new ApiError(422, "Algunos productos no están disponibles o fueron modificados.");
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const orderItems = items.map((item) => {
      const product = productById.get(item.productId)!;
      if (product.stock < item.quantity) throw new ApiError(422, `No hay suficiente stock para ${product.name}.`);
      const unitPrice = Number(product.price);
      const total = unitPrice * item.quantity;
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        total,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const shippingTotal = 0;
    const discountTotal = 0;
    const total = subtotal + shippingTotal - discountTotal;
    // attempt transaction with retries for unique orderNumber collision
    const prisma = getPrisma();
    let order = null;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        order = await prisma.$transaction(async (tx) => {
          const count = await tx.order.count();
          const next = count + 1;
          const orderNumber = `MC-${String(next).padStart(6, "0")}`;

          const customer = await tx.customerUser.findUnique({ where: { email: user.email.toLowerCase() } });
          const createdOrder = await tx.order.create({
            include: { items: true },
            data: {
              orderNumber,
              customerId: customer?.id,
              customerEmail: user.email.toLowerCase(),
              customerName: user.name,
              customerPhone,
              deliveryAddress,
              deliveryCity,
              deliverySector,
              deliveryReference,
              deliveryAddress2,
              deliveryPostalCode,
              deliveryNotes,
              paymentMethod,
              subtotal,
              discountTotal,
              shippingTotal,
              total,
              currency: "DOP",
              items: { create: orderItems },
            },
          });

          for (const item of items) {
            const updated = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (updated.count !== 1) {
              throw new ApiError(422, "No hay suficiente stock para alguno de los productos seleccionados.");
            }
          }

          return createdOrder;
        });
        break; // success
      } catch (err) {
        // if unique constraint conflict on orderNumber, retry
        const code = err && typeof err === "object" && "code" in err && typeof err.code === "string" ? err.code : undefined;
        if (code === "P2002" && attempt < maxAttempts - 1) {
          // retry
          continue;
        }
        throw err;
      }
    }

    if (!order) {
      throw new ApiError(500, "No fue posible crear el pedido.");
    }

    const responseItems = order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    }));
    return withCors(request, json({ success: true, data: { id: order.id, orderNumber: order.orderNumber, total: Number(order.total), items: responseItems } }, { status: 201 }));
  } catch (error) {
    console.error("Error en POST /orders:", error);
    if (error instanceof ApiError) {
      return withCors(request, json({ success: false, message: error.message, error: error.message, ...(error.details && { details: error.details }) }, { status: 400 }));
    }
    const message = error instanceof Error ? error.message : "Error interno al procesar la orden";
    return withCors(request, json({ success: false, message: "Error interno al procesar la orden", error: message }, { status: 500 }));
  }
}

export async function PUT(request: Request) {
  return withCors(request, json({ success: false, error: "El endpoint de órdenes no admite PUT. Usa POST para crear una orden." }, { status: 405, headers: { Allow: "POST, OPTIONS" } }));
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
