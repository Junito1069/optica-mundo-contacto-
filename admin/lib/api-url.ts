const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const localDevFallbackApiUrl = "http://localhost:3002";
const productionFallbackApiUrl = "https://optica-mundo-contacto-bakend2-production-d0cb.up.railway.app";

export const apiUrl = (configuredApiUrl ?? (process.env.NODE_ENV === "production" ? productionFallbackApiUrl : localDevFallbackApiUrl)).replace(/\/$/, "");