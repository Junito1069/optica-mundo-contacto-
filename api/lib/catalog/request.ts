import { ApiError } from "@/lib/http/response";

const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const productFields = ["name", "slug", "description", "categoryId", "price", "compareAtPrice", "sku", "stock", "minimumStock", "status", "featured", "imageUrl", "brand", "type", "duration", "material", "boxContent", "baseCurve", "diameter", "power", "cylinder", "axis", "addition"];
const numericFields = new Set(["price", "compareAtPrice", "stock", "minimumStock"]);

function parseBoolean(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ApiError(400, "El campo featured debe ser booleano.");
}

function fileToDataUrl(file: File) {
  if (!allowedImageTypes.has(file.type)) throw new ApiError(400, "La imagen debe ser JPG, PNG o WEBP.");
  if (file.size > maxImageBytes) throw new ApiError(400, "La imagen no puede superar 5 MB.");
  return file.arrayBuffer().then((buffer) => `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`);
}

export async function readProductBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      const body: Record<string, unknown> = {};
      for (const field of productFields) {
        const value = form.get(field);
        if (typeof value === "string" && value.length > 0) {
          body[field] = field === "featured" ? parseBoolean(value) : numericFields.has(field) ? Number.parseFloat(value) : value;
        }
      }
      const file = form.get("file") ?? form.get("image");
      if (file instanceof File && file.size > 0) body.imageUrl = await fileToDataUrl(file);
      return body;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "No se pudo procesar el formulario o la imagen del producto.");
    }
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError(400, "El cuerpo de la petición debe ser un objeto JSON.");
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "El cuerpo de la petición debe ser JSON válido.");
  }
}