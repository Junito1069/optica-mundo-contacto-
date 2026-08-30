import type { Metadata } from "next";
import "./globals.css";
import "./admin.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Mundo Contacto Admin",
  description: "Panel administrativo de Mundo Contacto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
