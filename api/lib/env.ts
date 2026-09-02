import "server-only";
import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());
const optionalOriginList = z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional());

const serverEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: optionalUrl,
  AUTH_SECRET: z.preprocess((value) => value === "" ? undefined : value, z.string().min(32).optional()),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  FRONTEND_URL: optionalOriginList,
  BACKEND_URL: optionalUrl,
  WEB_ORIGIN: optionalOriginList,
  ADMIN_ORIGIN: optionalOriginList,
  CORS_ORIGINS: z.string().default(""),
});

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_PHASE === "phase-development-server" || process.env.NODE_ENV === "production" && process.env.CI === "true";

const productionEnvSchema = serverEnvSchema.superRefine((value, context) => {
  if (process.env.NODE_ENV !== "production" || isBuildPhase) return;
  if (!value.DATABASE_URL) context.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL es obligatoria en producción." });
  if (!value.AUTH_SECRET) context.addIssue({ code: "custom", path: ["AUTH_SECRET"], message: "AUTH_SECRET es obligatorio en producción." });
  const frontendUrl = value.FRONTEND_URL ?? value.WEB_ORIGIN;
  if (!frontendUrl) context.addIssue({ code: "custom", path: ["FRONTEND_URL"], message: "FRONTEND_URL es obligatoria en producción." });
  for (const [name, origins] of [["FRONTEND_URL", value.FRONTEND_URL], ["WEB_ORIGIN", value.WEB_ORIGIN], ["ADMIN_ORIGIN", value.ADMIN_ORIGIN], ["BACKEND_URL", value.BACKEND_URL]] as const) {
    if (origins && origins.split(",").some((origin) => !origin.trim().startsWith("https://"))) {
      context.addIssue({ code: "custom", path: [name], message: `${name} debe contener únicamente URLs HTTPS.` });
    }
  }
  const origins = value.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => !origin.startsWith("https://"))) context.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "CORS_ORIGINS debe contener únicamente orígenes HTTPS en producción." });
});

const parsedEnv = productionEnvSchema.safeParse(process.env);
const safeEnv = parsedEnv.success ? parsedEnv.data : {
  PORT: 3002,
  DATABASE_URL: undefined,
  AUTH_SECRET: undefined,
  CLOUDINARY_CLOUD_NAME: undefined,
  CLOUDINARY_API_KEY: undefined,
  CLOUDINARY_API_SECRET: undefined,
  FRONTEND_URL: undefined,
  BACKEND_URL: undefined,
  WEB_ORIGIN: "http://localhost:3000",
  ADMIN_ORIGIN: "http://localhost:3001",
  CORS_ORIGINS: "",
};

export const serverEnv = {
  ...safeEnv,
  WEB_ORIGIN: safeEnv.FRONTEND_URL ?? safeEnv.WEB_ORIGIN ?? "http://localhost:3000",
  ADMIN_ORIGIN: safeEnv.ADMIN_ORIGIN ?? "http://localhost:3001",
};

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? serverEnv.DATABASE_URL;
  if (!url) throw new Error("La base de datos no está configurada.");
  return url;
}