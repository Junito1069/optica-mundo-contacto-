const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL es obligatoria en producción.");
}

export const apiUrl = (configuredApiUrl ?? "http://localhost:3002").replace(/\/$/, "");