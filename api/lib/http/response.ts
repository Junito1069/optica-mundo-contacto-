import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown[]) {
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
  if (error instanceof ApiError) {
    const payload: { success: false; error: string; message: string; details?: unknown[] } = { success: false, error: error.message, message: error.message };
    if (error.details && error.details.length > 0) payload.details = error.details;
    return json(payload, { status: error.status });
  }

  if (isDatabaseConnectionError(error)) {
    return json({ success: false, error: "No se pudo conectar a la base de datos. Inténtalo nuevamente en unos segundos.", message: "No se pudo conectar a la base de datos. Inténtalo nuevamente en unos segundos.", code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }

  if (error instanceof Error && error.message === "La base de datos no está configurada.") {
    return json({ success: false, error: "El servidor no tiene configurada la base de datos.", message: "El servidor no tiene configurada la base de datos.", code: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  console.error("API request failed", error);
  return json({ success: false, error: "Ocurrió un error interno.", message: "Ocurrió un error interno." }, { status: 500 });
}