import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // 1. Buscamos la cookie que acabamos de configurar en api.ts
  const token = request.cookies.get('crm_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Lista de rutas privadas que queremos proteger
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/clientes') || 
                           pathname.startsWith('/instrumentos') ||
                           pathname.startsWith('/ordenes');

  // 3. Regla A: Intenta entrar a zona privada SIN token -> Lo pateamos al Login
  if (isProtectedRoute && !token) {
    // request.url se pasa para mantener el dominio base (http://localhost:3000)
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Regla B: Intenta ir al Login pero YA tiene token -> Lo mandamos al Dashboard
  if (pathname === '/login' && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Si todo está bien, dejamos que la petición continúe su curso
  return NextResponse.next();
}

// 5. El Matcher le dice a Next.js en qué rutas exactas debe ejecutar este archivo
// Esto ahorra recursos para que no se ejecute al cargar el logo o el inicio público
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/clientes/:path*', 
    '/instrumentos/:path*', 
    '/ordenes/:path*', 
    '/login'
  ],
};