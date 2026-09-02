const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#071a33"/><circle cx="32" cy="32" r="18" fill="none" stroke="#20b486" stroke-width="6"/><circle cx="32" cy="32" r="6" fill="#20b486"/></svg>`;

export function GET() {
  return new Response(faviconSvg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}