import { Button } from "@/components/ui/button";
import { 
  Guitar, 
  LayoutDashboard,
  Settings, 
  Users, 
  Wrench, 
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";
import SidebarNav from "@/components/SidebarNav";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950">
      
      {/* Sidebar (Barra Lateral) */}
      <aside className="w-64 bg-zinc-900 text-zinc-300 flex flex-col hidden md:flex">
        {/* Logo del CRM */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 bg-zinc-950 gap-3">
          <div className="relative w-8 h-8 overflow-hidden rounded-full border border-amber-600/30 bg-white">
            <Image 
              src="/logo.jpg" 
              alt="Emedius Logo" 
              fill 
              className="object-cover" 
            />
          </div>
          <span className="text-zinc-50 font-bold tracking-tight text-sm">
            Emedius Workshop
          </span>
        </div>

        {/* Menú de Navegación */}
        {/* Aquí iba tu lista estática de Links, ahora usamos el componente dinámico */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>

        {/* Opciones Inferiores */}
        <div className="p-4 border-t border-zinc-800">
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Settings className="w-5 h-5 mr-3" />
            Configuración
          </Button>
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido Principal (Lo que cambia) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior Móvil / Perfil */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Panel de Control
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Taller Principal</span>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
          </div>
        </header>

        {/* Aquí se inyectan las páginas (dashboard, clientes, etc) */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>

    </div>
  );
}