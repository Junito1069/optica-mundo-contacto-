export const dynamic = "force-static";

export function GET() {
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#050505"/><circle cx="32" cy="32" r="20" fill="none" stroke="#c8e54b" stroke-width="5"/><circle cx="32" cy="32" r="7" fill="#c8e54b"/></svg>`;

  return new Response(favicon, {
    headers: {
      "Cache-Control": "public, max-age=86400, immutable",
      "Content-Type": "image/svg+xml",
    },
  });
}
