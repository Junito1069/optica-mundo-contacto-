import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: { root: rootDirectory },
  allowedDevOrigins: ["192.168.56.1"],
};

export default nextConfig;