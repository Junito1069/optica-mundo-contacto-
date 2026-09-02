import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const normalizeOrigin = (value?: string) => value?.trim().replace(/\/$/, "") || undefined;
const splitOrigins = (...values: Array<string | undefined>) => values
  .flatMap((value) => value?.split(",") ?? [])
  .map((origin) => normalizeOrigin(origin))
  .filter((origin): origin is string => Boolean(origin));

const allowedOrigins = new Set(splitOrigins(
  serverEnv.FRONTEND_URL,
  serverEnv.WEB_ORIGIN,
  serverEnv.ADMIN_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.WEB_ORIGIN,
  process.env.ADMIN_ORIGIN,
  process.env.BACKEND_URL,
  process.env.CORS_ORIGINS,
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]),
));

export function withCors(request: Request, response: NextResponse) {
  const origin = normalizeOrigin(request.headers.get("origin") ?? undefined);
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : undefined;

  if (!allowedOrigin) return response;

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Id");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  response.headers.append("Vary", "Origin");
  return response;
}

export function preflight(request: Request) {
  const response = new NextResponse(null, { status: 204 });
  return withCors(request, response);
}