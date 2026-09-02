import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const normalizeOrigin = (value?: string) => value?.trim().replace(/\/$/, "") || undefined;

const allowedOrigins = new Set([
  normalizeOrigin(serverEnv.FRONTEND_URL),
  normalizeOrigin(serverEnv.WEB_ORIGIN),
  normalizeOrigin(serverEnv.ADMIN_ORIGIN),
  normalizeOrigin(process.env.FRONTEND_URL),
  normalizeOrigin(process.env.BACKEND_URL),
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]),
  ...serverEnv.CORS_ORIGINS.split(",").map((origin) => normalizeOrigin(origin)).filter((origin): origin is string => Boolean(origin)),
].filter((origin): origin is string => Boolean(origin)));

export function withCors(request: Request, response: NextResponse) {
  const origin = normalizeOrigin(request.headers.get("origin") ?? undefined);
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : normalizeOrigin(process.env.FRONTEND_URL) ?? normalizeOrigin(serverEnv.FRONTEND_URL);

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