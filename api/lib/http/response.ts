import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, { status: error.status });
  console.error("API request failed", error);
  return json({ error: "Ocurrió un error interno." }, { status: 500 });
}