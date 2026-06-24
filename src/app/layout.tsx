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
  title: "Reparación y Calibración de Guitarras en León, Gto | Emedius Workshop",
  description: "Taller especializado en mantenimiento, calibración (setup), electrónica y reparación de guitarras eléctricas, acústicas y bajos en León, Guanajuato. Más de 12 años de experiencia.",
  keywords: [
    "reparación de guitarras León Gto", 
    "calibración de guitarras León", 
    "luthier León Guanajuato", 
    "mantenimiento de bajos León", 
    "taller de guitarras León",
    "ajuste de alma guitarra",
    "Emedius Guitar Workshop"
  ],
  openGraph: {
    title: "Emedius Guitar Workshop | Luthier en León, Gto",
    description: "Devuélvele la vida a tu instrumento. Mantenimiento y reparación profesional de guitarras y bajos en León, Guanajuato.",
    url: "https://emediusgw.com",
    siteName: "Emedius Guitar Workshop",
    locale: "es_MX",
    type: "website",
  },
  alternates: {
    canonical: "https://emediusgw.com",
  }
};

export default function RootLayout({
  
  children,
  
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Emedius' Guitar Workshop",
    "image": "https://emediusgw.com/hero.jpg",
    "description": "Taller especializado en mantenimiento, calibración y reparación de guitarras y bajos.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "León",
      "addressRegion": "Guanajuato",
      "addressCountry": "MX"
    },
    "telephone": "+524775948211",
    "url": "https://emediusgw.com",
    "priceRange": "$$"
  };

  return (
    <html lang="es" className="antialiased scroll-smooth">
      {/* Al aplicar la clase aquí, TODA la app hereda esta tipografía */}
      <body className={montserrat.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}