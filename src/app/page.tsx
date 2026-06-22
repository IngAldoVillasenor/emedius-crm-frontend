import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { ArrowRight, Droplet, Guitar, ShieldCheck, Wrench, Activity, CheckCircle2, Check, Award, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


export default function LandingPage() {
  // Simulación de fotos del portafolio (Luego las cambiarás por las reales de Emedius)
  const allPortfolioImages = [
    "/portfolio/1.jpg", 
    "/portfolio/2.jpg", 
    "/portfolio/3.jpg", 
    "/portfolio/4.jpg",
    "/portfolio/5.jpg",
    "/portfolio/6.jpg",
    "/portfolio/7.jpg",
    "/portfolio/8.jpg",
    "/portfolio/9.jpg",
    "/portfolio/10.jpg",
    "/portfolio/11.jpg",
    "/portfolio/12.jpg",
  ];

  const randomImages = [...allPortfolioImages]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const educationalImage = "/portfolio/educational.jpg";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      
      {/* Barra de Navegación */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-amber-600 dark:text-amber-500">
          {/* Contenedor del logo redondeado con un borde sutil */}
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-amber-600/30 shadow-sm bg-white dark:bg-zinc-900">
            <Image 
              src="/logo.jpg" 
              alt="Emedius Workshop Logo" 
              fill 
              className="object-cover" 
            />
          </div>
          <span>Emedius Workshop</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="font-medium relative z-20">Acceder</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center text-center px-6 py-32 md:py-48 overflow-hidden">
        
        {/* 1. Imagen de Fondo (Optimizada y priorizada) */}
        <Image
          src="/hero.jpg"
          alt="Taller de mantenimiento de guitarras"
          fill
          priority // Le dice a Next.js que cargue esta imagen antes que cualquier otra cosa
          className="object-cover object-center"
        />
        
        {/* 2. Filtro/Overlay Oscurecedor (Gradiente de arriba hacia abajo) */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-50 dark:to-zinc-950 z-0"></div>

        {/* 3. Contenido (Con z-index para que flote sobre la imagen y textos forzados a blanco) */}
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
            <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white gap-2 text-md shadow-lg shadow-amber-900/20 border-0">
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

      {/* Sección: El Portafolio (Carrusel) */}
      <section className="py-16 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Trabajos Recientes</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-10">Un vistazo al detalle y cariño que ponemos en cada instrumento que entra al taller.</p>
          
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {randomImages.map((imagePath, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden border-0 shadow-sm">
                      {/* aspect-square mantiene las fotos en un cuadro perfecto para Instagram style */}
                      <CardContent className="relative flex aspect-square items-center justify-center p-0 bg-zinc-200 dark:bg-zinc-800">
                        <Image 
                          src={imagePath} 
                          alt={`Trabajo de luthier en guitarra ${index + 1}`}
                          fill
                          className="object-cover transition-transform hover:scale-105 duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
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

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Paquete 1: Pa'l Huesero */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg relative flex flex-col">
              <CardHeader className="text-center pb-8 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Pa'l Huesero</CardTitle>
                <CardDescription className="mt-2">El mantenimiento de rutina ideal para mantener tu sonido al 100.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex-1">
                <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Octavación y Ajuste de alma</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Ajuste de clavijeros y pastillas</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Ajuste y calibración de puente</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Ajuste de salida</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Limpieza General y del instrumento</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Hidratación de diapasón</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Cambio de cuerdas</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Limpieza de potenciómetros y trastes</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-600 shrink-0" /> Lubricación de Cejilla</li>
                </ul>
              </CardContent>
              <div className="p-6 mt-auto">
                <Button className="w-full" variant="outline">Agendar Huesero</Button>
              </div>
            </Card>

            {/* Paquete 2: Pa'l Rockstar (Destacado) */}
            <Card className="border-amber-500 shadow-xl shadow-amber-900/10 relative flex flex-col bg-zinc-900 text-zinc-50 scale-100 md:scale-105 z-10 overflow-visible mt-6 md:mt-0">
              
              {/* Badge Recomendado (Ajustado) */}
              <div className="absolute -top-3.5 left-0 w-full flex justify-center">
                <span className="bg-amber-500 text-amber-950 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  Full Service
                </span>
              </div>
              
              <CardHeader className="text-center pb-8 border-b border-zinc-800">
                <CardTitle className="text-2xl font-bold text-amber-500">Pa'l Rockstar</CardTitle>
                <CardDescription className="mt-2 text-zinc-400">Tratamiento VIP para dejar tu instrumento como recién salido de fábrica.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex-1">
                <div className="mb-6 font-medium text-amber-400 text-sm">
                  Incluye TODO lo del paquete Pa'l Huesero, más:
                </div>
                <ul className="space-y-4 text-sm text-zinc-300">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Pulido de trastes a espejo</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Pulido de pintura</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Limpieza profunda de todo el hardware</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Mantenimiento preventivo de electrónica</li>
                </ul>
              </CardContent>
              <div className="p-6 mt-auto">
                <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white border-0">Agendar Rockstar</Button>
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* Sección Educativa: Por qué el mantenimiento importa */}
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
                  <span><strong>Hidratación Profunda:</strong> En Emedius utilizamos aceites y líquidos acondicionadores de primera calidad en cada servicio. Un diapasón reseco es propenso a agrietarse y perder trastes; la hidratación le devuelve su color natural y tacto suave.</span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                  <span><strong>Protege tu electrónica:</strong> Limpiar los potenciómetros y jacks previene ese molesto ruido (hiss o scratch) a mitad de una tocada o grabación.</span>
                </li>
              </ul>
            </div>
          </div>
          {/* Imagen ilustrativa al lado del texto */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
            <Image 
              src={educationalImage} 
              alt="Mantenimiento preventivo de guitarra"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Sección: Por qué elegir Emedius (Confianza) */}
      <section className="bg-zinc-900 text-zinc-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-16">La Diferencia Emedius</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
              <CheckCircle2 className="w-10 h-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Herramienta Especializada</h3>
              <p className="text-zinc-400 text-sm">No improvisamos. Utilizamos galgas de precisión, limas diamantadas y reglas con muescas específicas para garantizar medidas exactas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
              <CheckCircle2 className="w-10 h-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Insumos Premium</h3>
              <p className="text-zinc-400 text-sm">Desde los líquidos para nutrir la madera hasta el estaño para las soldaduras, usamos marcas reconocidas a nivel mundial en cada servicio.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
              <CheckCircle2 className="w-10 h-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Seguimiento Transparente</h3>
              <p className="text-zinc-400 text-sm">Te mantenemos informado del estatus de tu instrumento y te entregamos un reporte detallado de las condiciones de entrada y salida.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-zinc-500 text-sm bg-zinc-50 dark:bg-zinc-950">
        <p>© {new Date().getFullYear()} Emedius Guitar Workshop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}