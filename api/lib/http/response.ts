import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const isDatabaseConnectionError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  return ["P1001", "P1002", "P1017", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(code)
    || message.includes("can't reach database server")
    || message.includes("database") && message.includes("connection")
    || message.includes("prisma client request error") && message.includes("connect")
    || message.includes("connection terminated unexpectedly");
};

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, { status: error.status });

  if (isDatabaseConnectionError(error)) {
    return json({ error: "No se pudo conectar a la base de datos. Inténtalo nuevamente en unos segundos.", code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }

  console.error("API request failed", error);
  return json({ error: "Ocurrió un error interno." }, { status: 500 });
}