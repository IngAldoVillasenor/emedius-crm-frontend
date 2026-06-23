// src/lib/api.ts

// 1. Primero decidimos el dominio base (Render o Localhost)
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 2. Luego le agregamos el sufijo /api
const API_BASE_URL = `${baseURL}/api`;

// Utilidades para manejar el Token en el navegador (Local Storage)
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('crm_token', token);
    // Agregamos la cookie para que el Middleware de Next.js pueda leerla
    document.cookie = `crm_token=${token}; path=/; max-age=86400; SameSite=Strict`;
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('crm_token');
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('crm_token');
    // Destruimos la cookie asignándole una fecha del pasado
    document.cookie = "crm_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  
  headers.append('Content-Type', 'application/json');
  headers.append('X-Tenant-ID', 'emelius_gw'); // Nuestro inquilino actual

  // Si tenemos un token guardado, lo inyectamos
  const token = getToken();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // --- AQUÍ ESTÁ LA MAGIA DEL INTERCEPTOR ---
  if (!response.ok) {
    // Si el token expiró o el backend se reinició (401 o 403)
    if (response.status === 401 || response.status === 403) {
      removeToken(); // Destruimos localStorage y la cookie
      
      // Redirigimos al login solo si estamos en el cliente (navegador)
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
      
      throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
    }

    // Manejo de otros errores (400, 404, 500...)
    let errorMessage = `Error en la API: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Si no es JSON, usamos el texto por defecto
    }
    throw new Error(errorMessage);
  }

  // Parseo de respuesta exitosa
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return response.text();
  }
}