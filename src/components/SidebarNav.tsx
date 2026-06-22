"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Guitar, ClipboardList } from "lucide-react";

// Definimos las opciones de navegación en un arreglo para que sea fácil agregar más en el futuro
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Instrumentos", href: "/instrumentos", icon: Guitar },
  { name: "Órdenes de Servicio", href: "/ordenes", icon: ClipboardList },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-2 mt-4">
      {navItems.map((item) => {
        // Verificamos si la ruta actual coincide con el enlace
        // Usamos startsWith para que si en un futuro tienes /clientes/123, siga marcado "Clientes"
        const isActive = pathname.startsWith(item.href);

        return (
          <Link key={item.name} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-amber-500/15 text-amber-500 font-medium" // Estilo Activo (Sombreado Ámbar)
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100" // Estilo Inactivo
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-amber-500" : "text-zinc-400"}`} />
              {item.name}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}