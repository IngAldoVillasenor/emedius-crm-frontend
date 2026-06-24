import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Analytics } from '@vercel/analytics/next';

// Importamos y configuramos la tipografía
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'], // Traemos los grosores necesarios
});

export const metadata: Metadata = {
  title: "Emedius Guitar Workshop",
  description: "Mantenimiento, calibración y reparación profesional de instrumentos musicales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased scroll-smooth">
      {/* Al aplicar la clase aquí, TODA la app hereda esta tipografía */}
      <body className={montserrat.className}>
        {children}
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}