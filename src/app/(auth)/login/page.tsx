"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchFromAPI, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // --- NUEVO: Limpiamos cualquier rastro de tokens fantasmas ---
    // (Ajusta esto si usas cookies o sessionStorage en lugar de localStorage)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token'); 
      sessionStorage.removeItem('token');
    }

    try {
      // 1. Llamamos a tu endpoint en Spring Boot (ahora irá limpio, sin headers basura)
      const response = await fetchFromAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // 2. Guardamos el token mágico
      setToken(response.token);

      // 3. ¡Redirigimos al CRM!
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Revisa tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
      
      <Link href="/" className="absolute top-6 left-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 overflow-hidden rounded-full border-2 border-amber-500/30 shadow-lg mb-4 bg-white">
            <Image src="/logo.jpg" alt="Emedius Workshop" fill className="object-cover" sizes="80px" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Bienvenido de nuevo
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Ingresa tus credenciales para acceder al CRM
          </p>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl">
          <CardContent className="pt-6">
            {/* Si hay error, lo mostramos en rojito */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taller@emelius.com" 
                  className="bg-zinc-50 dark:bg-zinc-900/50"
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900/50"
                  required 
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Ingresar al Panel"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}