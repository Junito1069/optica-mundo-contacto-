const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const localDevFallbackApiUrl = "http://localhost:3002";

if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("Falta NEXT_PUBLIC_API_URL. Configúralo en Railway para este frontend.");
}

export const apiUrl = (configuredApiUrl ?? localDevFallbackApiUrl).replace(/\/$/, "");