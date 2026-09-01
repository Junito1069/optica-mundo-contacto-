import "server-only";
import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());

const serverEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: optionalUrl,
  AUTH_SECRET: z.preprocess((value) => value === "" ? undefined : value, z.string().min(32).optional()),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  FRONTEND_URL: optionalUrl,
  BACKEND_URL: optionalUrl,
  WEB_ORIGIN: optionalUrl,
  ADMIN_ORIGIN: optionalUrl,
  CORS_ORIGINS: z.string().default(""),
});

const productionEnvSchema = serverEnvSchema.superRefine((value, context) => {
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build") return;
  if (!value.DATABASE_URL) context.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL es obligatoria en producción." });
  if (!value.AUTH_SECRET) context.addIssue({ code: "custom", path: ["AUTH_SECRET"], message: "AUTH_SECRET es obligatorio en producción." });
  const frontendUrl = value.FRONTEND_URL ?? value.WEB_ORIGIN;
  if (!frontendUrl) context.addIssue({ code: "custom", path: ["FRONTEND_URL"], message: "FRONTEND_URL es obligatoria en producción." });
  for (const [name, origin] of [["FRONTEND_URL", frontendUrl], ["ADMIN_ORIGIN", value.ADMIN_ORIGIN], ["BACKEND_URL", value.BACKEND_URL]] as const) {
    if (origin && !origin.startsWith("https://")) context.addIssue({ code: "custom", path: [name], message: `${name} debe usar HTTPS en producción.` });
  }
  const origins = value.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => !origin.startsWith("https://"))) context.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "CORS_ORIGINS debe contener únicamente orígenes HTTPS en producción." });
});
const parsedEnv = productionEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error("La configuración del servidor no es válida.");
}

export const serverEnv = {
  ...parsedEnv.data,
  WEB_ORIGIN: parsedEnv.data.FRONTEND_URL ?? parsedEnv.data.WEB_ORIGIN ?? "http://localhost:3000",
  ADMIN_ORIGIN: parsedEnv.data.ADMIN_ORIGIN ?? "http://localhost:3001",
};

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? serverEnv.DATABASE_URL;
  if (!url) throw new Error("La base de datos no está configurada.");
  return url;
}