"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { 
  ArrowRight, Droplet, Guitar, ShieldCheck, Wrench, Activity, 
  CheckCircle2, Check, Award, AlertTriangle, Plus,
  MapPin, Clock
} from "lucide-react"; // <-- NUEVO: Agregamos iconos de redes sociales
import Link from "next/link";
import Image from "next/image";
import { PopupModal } from "react-calendly";

import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa6";

export default function LandingPage() {
  const allPortfolioImages = [
    "/portfolio/1.jpg", "/portfolio/2.jpg", "/portfolio/3.jpg", "/portfolio/4.jpg",
    "/portfolio/5.jpg", "/portfolio/6.jpg", "/portfolio/7.jpg", "/portfolio/8.jpg",
    "/portfolio/9.jpg", "/portfolio/10.jpg", "/portfolio/11.jpg", "/portfolio/12.jpg",
  ];

  const [carouselImages, setCarouselImages] = useState<string[]>([
    "/portfolio/1.jpg", "/portfolio/2.jpg", "/portfolio/3.jpg", "/portfolio/4.jpg"
  ]);

  // Mezclamos las imágenes SOLO cuando el componente ya cargó en el navegador
  useEffect(() => {
    const shuffled = [...allPortfolioImages]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    setCarouselImages(shuffled);
  }, []);
  const educationalImage = "/educational.jpg";

  // --- ESTADOS PARA CALENDLY ---
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRootElement(document.body);
    }
  }, []);

  const openCalendly = (eventType: string, prefillMessage?: string) => {
    let url = `https://calendly.com/emediusgw/${eventType}`;
    
    if (prefillMessage) {
      url += `?a2=${encodeURIComponent(prefillMessage)}`;
    }
    
    setCalendlyUrl(url);
    setIsCalendlyOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      
      {rootElement && (
        <PopupModal
          url={calendlyUrl}
          onModalClose={() => setIsCalendlyOpen(false)}
          open={isCalendlyOpen}
          rootElement={rootElement}
        />
      )}

      {/* Barra de Navegación */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-amber-600 dark:text-amber-500">
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-amber-600/30 shadow-sm bg-white dark:bg-zinc-900">
            <Image src="/logo.jpg" alt="Emedius Workshop Logo" fill className="object-cover" sizes="100%" />
          </div>
          <span>Emedius Workshop</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="font-medium relative z-20">Acceder</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center text-center px-6 py-32 md:py-48 overflow-hidden">
        <Image src="/hero.jpg" alt="Taller de mantenimiento de guitarras" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-50 dark:to-zinc-950 z-0"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-200 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            Agenda abierta para esta semana
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-white drop-shadow-lg">
            El tono perfecto empieza con un <span className="text-amber-500">ajuste perfecto.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl leading-relaxed drop-shadow-md">
            Mantenimiento, calibración y reparación profesional. Devuélvele la vida a tu instrumento para que soporte desde los acordes más limpios hasta los riffs más pesados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-500 text-white gap-2 text-md shadow-lg shadow-amber-900/20 border-0"
              onClick={() => openCalendly("diagnostico-inicial")}
            >
              Agendar Revisión <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Franja de Autoridad y Garantía */}
      <section className="bg-zinc-900 border-y border-zinc-800 text-zinc-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="flex flex-col items-center px-4 py-4 md:py-0">
              <Award className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Más de 12 Años</h3>
              <p className="text-zinc-400 text-sm">De experiencia continua respaldan cada ajuste y reparación que realizamos.</p>
            </div>
            <div className="flex flex-col items-center px-4 py-4 md:py-0">
              <ShieldCheck className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
              <p className="text-zinc-400 text-sm">Tu instrumento sale del taller con medidas precisas, afinación perfecta y listo para el escenario.</p>
            </div>
            <div className="flex flex-col items-center px-4 py-4 md:py-0">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Cero Riesgos</h3>
              <p className="text-zinc-400 text-sm">No dejes tu instrumento en manos equivocadas. Protege tu inversión con verdaderos profesionales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: El Portafolio */}
      <section className="py-16 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Trabajos Recientes</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-10">Un vistazo al detalle y cariño que ponemos en cada instrumento que entra al taller.</p>
          
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {carouselImages.map((imagePath, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden border-0 shadow-sm">
                      <CardContent className="relative flex aspect-square items-center justify-center p-0 bg-zinc-200 dark:bg-zinc-800">
                        <Image src={imagePath} alt={`Trabajo de luthier ${index + 1}`} fill className="object-cover transition-transform hover:scale-105 duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      {/* Sección de Paquetes de Servicio */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Paquetes de Mantenimiento</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Selecciona el nivel de cuidado que tu instrumento necesita.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            
            {/* Paquete 1: Pa'l Apuro */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col hover:border-amber-500/50 transition-colors">
              <CardHeader className="text-center pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Pa'l Apuro</CardTitle>
                <div className="text-3xl font-extrabold text-amber-600 mt-4">$250 <span className="text-base text-zinc-500 font-normal">MXN*</span></div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Octavación</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Ajuste de alma</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Ajuste de clavijeros</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Ajuste de pastillas</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Ajuste y calibración de puente</span></li>
                </ul>
              </CardContent>
              <div className="p-6 mt-auto">
                <Button className="w-full" variant="outline" onClick={() => openCalendly("recepcion", "¡Hola! Me interesa agendar la recepción para el paquete: Pa'l Apuro.")}>
                  Agendar Pa'l Apuro
                </Button>
              </div>
            </Card>

            {/* Paquete 2: Pa'l Huesero */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col hover:border-amber-500/50 transition-colors bg-white dark:bg-zinc-900">
              <CardHeader className="text-center pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Pa'l Huesero</CardTitle>
                <div className="text-3xl font-extrabold text-amber-600 mt-4">$500 <span className="text-base text-zinc-500 font-normal">MXN*</span></div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Incluye Pa'l Apuro, más:
                </div>
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Limpieza general</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Hidratación de diapasón</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Limpieza de potenciómetros</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Lubricación de cejilla</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Limpieza de trastes</span></li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span>Limpieza de instrumento</span></li>
                </ul>
              </CardContent>
              <div className="p-6 mt-auto">
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" onClick={() => openCalendly("recepcion", "¡Hola! Me interesa agendar la recepción para el paquete: Pa'l Huesero.")}>
                  Agendar Pa'l Huesero
                </Button>
              </div>
            </Card>

            {/* Paquete 3: Pa'l Rockstar (Destacado) */}
            <Card className="border-amber-500 shadow-xl shadow-amber-900/10 relative flex flex-col bg-zinc-900 text-zinc-50 overflow-visible z-10 md:scale-105">
              <div className="absolute -top-3.5 left-0 w-full flex justify-center">
                <span className="bg-amber-500 text-amber-950 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  Más Popular
                </span>
              </div>
              <CardHeader className="text-center pb-6 border-b border-zinc-800">
                <CardTitle className="text-xl font-bold text-amber-500 uppercase tracking-wide mt-2">Pa'l Rockstar</CardTitle>
                <div className="text-3xl font-extrabold text-white mt-4">$1,000 <span className="text-base text-zinc-400 font-normal">MXN*</span></div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <div className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Pa'l Apuro + Pa'l Huesero, más:
                </div>
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> <span>Pulido de trastes</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> <span>Pulido de pintura</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> <span>Limpieza profunda de todo el hardware</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> <span>Mantenimiento preventivo de electrónica</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> <span>Calibración de cejilla</span></li>
                </ul>
              </CardContent>
              <div className="p-6 mt-auto">
                <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white border-0" onClick={() => openCalendly("recepcion", "¡Hola! Quiero el tratamiento completo para mi instrumento. Agendando paquete: Pa'l Rockstar.")}>
                  Agendar Rockstar
                </Button>
              </div>
            </Card>

            {/* Paquete 4: Pa' La Leyenda (Ultimate) */}
            <Card className="border-amber-600/30 dark:border-amber-500/20 shadow-md flex flex-col bg-gradient-to-b from-zinc-50 to-amber-50/30 dark:from-zinc-950 dark:to-amber-900/10">
              <CardHeader className="text-center pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Pa' La Leyenda</CardTitle>
                <div className="text-3xl font-extrabold text-amber-600 mt-4">$2,000 <span className="text-base text-zinc-500 font-normal">MXN*</span></div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Todos los paquetes anteriores, más:
                </div>
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /> <span className="font-semibold text-zinc-900 dark:text-zinc-100">Nivelado de trastes</span></li>
                  <li className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs italic text-zinc-500">
                    Soluciona problemas severos de trasteos e imperfecciones en el diapasón para una acción de cuerdas ultra baja.
                  </li>
                </ul>
              </CardContent>
              <div className="p-6 mt-auto">
                <Button className="w-full border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white" variant="outline" onClick={() => openCalendly("recepcion", "¡Hola! Quiero el servicio definitivo para mi guitarra. Agendando paquete: Pa' La Leyenda.")}>
                  Agendar La Leyenda
                </Button>
              </div>
            </Card>

          </div>

          <div className="mt-12 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/50 inline-block px-6 py-2 rounded-full mx-auto">
            <span className="text-amber-600 font-bold">*</span> Ningún servicio incluye cuerdas.
          </div>
        </div>
      </section>

      {/* Sección Educativa */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">¿Por qué tu guitarra necesita mantenimiento preventivo?</h2>
            <div className="space-y-6 text-zinc-600 dark:text-zinc-400">
              <p>
                La madera es un material vivo que reacciona constantemente a los cambios de temperatura, humedad y a la tensión de las cuerdas. 
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex gap-3">
                  <Activity className="w-6 h-6 text-amber-600 shrink-0" />
                  <span><strong>Evita deformaciones:</strong> Un ajuste regular del alma (truss rod) previene que el mástil se curve permanentemente, salvando tu instrumento de reparaciones costosas.</span>
                </li>
                <li className="flex gap-3">
                  <Droplet className="w-6 h-6 text-amber-600 shrink-0" />
                  <span><strong>Hidratación Profunda:</strong> Utilizamos aceites y líquidos acondicionadores de primera calidad. Un diapasón reseco es propenso a agrietarse y perder trastes; la hidratación le devuelve su color natural y tacto suave.</span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                  <span><strong>Protege tu electrónica:</strong> Limpiar los potenciómetros y jacks previene ese molesto ruido (hiss o scratch) a mitad de una tocada o grabación.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
            <Image src={educationalImage} alt="Mantenimiento preventivo de guitarra" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* Sección de Ubicación y Horarios */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Información de Contacto */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Visita el Taller</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Trabajamos bajo un esquema de citas programadas para garantizar que cada instrumento que ingresa reciba la atención, el tiempo y el respeto que merece.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
                    <MapPin className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Ubicación</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                      Emedius' Guitar Workshop<br/>
                      <span className="text-sm italic">Blvd. Hermenegildo Bustos 1426, La Hacienda, 37178 León de los Aldama, Gto.</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Horarios de Atención</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                      Lunes a Viernes: 10:00 AM - 7:00 PM<br/>
                      Sábados: 10:00 AM - 2:00 PM<br/>
                      Domingos: Cerrado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* El Mapa de Google (iframe) */}
            <div className="w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14883.938522723161!2d-101.71332322137829!3d21.153009922200326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842bb9eb48b76f03%3A0xac1f5df84dac6673!2sEmedius&#39;%20Guitar%20Workshop!5e0!3m2!1ses!2smx!4v1782325635803!5m2!1ses!2smx" 
              width="100%" 
              height="100%" 
              style={{ border:0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[20%] contrast-125 opacity-90 dark:invert dark:hue-rotate-180 transition-all hover:grayscale-0 hover:opacity-100">

              </iframe>
            </div>

          </div>
        </div>
      </section>

      {/* NUEVO: SECCIÓN DE REDES SOCIALES Y CONTACTO */}
      <section className="py-16 bg-zinc-100 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Conecta con el Taller</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Síguenos en nuestras redes sociales para ver el "detrás de escena" de nuestros trabajos más recientes o envíanos un mensaje directo para resolver tus dudas.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {/* Botón WhatsApp */}
            <a href="https://wa.me/524775948211" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/10 transition-colors">
                <FaWhatsapp className="w-5 h-5" /> WhatsApp
              </Button>
            </a>

            {/* Botón Facebook */}
            <a href="https://www.facebook.com/EmediusGuitarWorkshop" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/10 transition-colors">
                <FaFacebook className="w-5 h-5" /> Facebook
              </Button>
            </a>

            {/* Botón Instagram */}
            <a href="https://www.instagram.com/emediusguitarworkshop/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-colors">
                <FaInstagram className="w-5 h-5" /> Instagram
              </Button>
            </a>

            {/* Botones futuros preparados (Descomentar cuando estén listos) */}
            
            {/*
            <a href="https://youtube.com/tu-canal" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/10 transition-colors">
                <FaYoutube className="w-5 h-5" /> YouTube
              </Button>
            </a>
            */}

            {/*
            <a href="https://tiktok.com/@tu-perfil" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <FaTiktok className="w-5 h-5" /> TikTok
              </Button>
            </a>
            */}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-zinc-500 text-sm bg-zinc-50 dark:bg-zinc-950">
        <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Luthier en León, Guanajuato, México.
        </p>
        <p>© {new Date().getFullYear()} Emedius Guitar Workshop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}