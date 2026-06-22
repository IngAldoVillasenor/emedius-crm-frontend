"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { removeToken } from "@/lib/api";

export default function LogoutButton() {

  const handleLogout = () => {
    // 1. Destruimos el token del LocalStorage y la Cookie
    removeToken();
    
    // 2. Redirigimos al usuario a la pantalla de Login
    window.location.replace("/login");
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-2 transition-colors"
    >
      <LogOut className="w-5 h-5 mr-3" />
      Cerrar Sesión
    </Button>
  );
}