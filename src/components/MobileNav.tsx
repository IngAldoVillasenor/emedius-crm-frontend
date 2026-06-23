"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarNav from "@/components/SidebarNav";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Truco UX: Cerrar el menú automáticamente cuando el usuario toca un enlace y cambia de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      {/* Botón de Hamburguesa para Móviles */}
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <Menu className="w-6 h-6 text-zinc-800 dark:text-zinc-100" />
      </Button>

      {/* Overlay oscuro de fondo */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel Deslizable */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabecera del menú móvil */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-amber-600/30 bg-white">
              <Image src="/logo.jpg" alt="Emedius Logo" fill className="object-cover" />
            </div>
            <span className="text-zinc-50 font-bold tracking-tight text-sm">
              Emedius
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navegación (Reutilizamos tu componente) */}
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
      </div>
    </div>
  );
}