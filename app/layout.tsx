import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./commerce.css";
import "./categories.css";
import "./hero-layout.css";
import "./responsive-layout.css";
import "./theme.css";
import { Providers } from "@/components/Providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Mundo Contacto | Lentes de contacto originales",
  description: "Lentes de contacto, asesoría profesional y cuidado visual en Mundo Contacto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className={`${manrope.variable} ${dmMono.variable}`}><body><Providers>{children}</Providers></body></html>;
}