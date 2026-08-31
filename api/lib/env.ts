import "server-only";
import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());

const serverEnvSchema = z.object({
  DATABASE_URL: optionalUrl,
  AUTH_SECRET: z.preprocess((value) => value === "" ? undefined : value, z.string().min(32).optional()),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  ADMIN_ORIGIN: z.string().url().default("http://localhost:3001"),
  CORS_ORIGINS: z.string().default(""),
});

const productionEnvSchema = serverEnvSchema.superRefine((value, context) => {
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build") return;
  if (!value.DATABASE_URL) context.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL es obligatoria en producción." });
  if (!value.AUTH_SECRET) context.addIssue({ code: "custom", path: ["AUTH_SECRET"], message: "AUTH_SECRET es obligatorio en producción." });
  for (const [name, origin] of [["WEB_ORIGIN", value.WEB_ORIGIN], ["ADMIN_ORIGIN", value.ADMIN_ORIGIN]] as const) {
    if (!origin.startsWith("https://")) context.addIssue({ code: "custom", path: [name], message: `${name} debe usar HTTPS en producción.` });
  }
  const origins = value.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => !origin.startsWith("https://"))) context.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "CORS_ORIGINS debe contener únicamente orígenes HTTPS en producción." });
});
const parsedEnv = productionEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error("La configuración del servidor no es válida.");
}

export const serverEnv = parsedEnv.data;

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? serverEnv.DATABASE_URL;
  if (!url) throw new Error("La base de datos no está configurada.");
  return url;
}