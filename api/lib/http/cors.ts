import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const allowedOrigins = new Set([
  serverEnv.FRONTEND_URL,
  serverEnv.WEB_ORIGIN,
  serverEnv.ADMIN_ORIGIN,
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]),
  ...serverEnv.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
].filter((origin): origin is string => Boolean(origin)));

export function withCors(request: Request, response: NextResponse) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) return response;

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Request-Id");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.append("Vary", "Origin");
  return response;
}

export function preflight(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}