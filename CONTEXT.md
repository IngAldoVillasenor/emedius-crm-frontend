# Contexto del Proyecto: Emedius Workshop CRM

## Arquitectura General
*   **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui. Hosteado en Vercel.
*   **Backend:** Spring Boot 3.x, Java 17+, Spring Security (Stateless JWT). Hosteado en Render.
*   **Base de Datos:** PostgreSQL hosteado en Neon.
*   **Patrones clave:** Arquitectura Multi-Tenant (Inquilinos por esquema), Migraciones estrictas con Flyway.

## Estado Actual
1.  **CORS & Seguridad:** Configurado exitosamente. Filtro `JwtAuthenticationFilter` implementado leyendo `Authorization: Bearer`.
2.  **Dominio:** Configurado con subdominio para la API (`api.emediusgw.com`).
3.  **UI/UX:** Diseño responsivo con Sidebar para escritorio y Mobile Nav (Drawer) para móviles. Favicon configurado.
4.  **Flujos:** Recién implementamos el patrón *Facade* en un endpoint `/api/service-orders/unified` que permite registrar Cliente, Instrumento, Orden de Servicio e IntakeConditions en una sola transacción SQL.

## Reglas de Desarrollo
*   **Frontend:** Usar Tailwind, mantener componentes limpios. En las llamadas al backend, siempre usar el helper `fetchFromAPI` en `src/lib/api.ts` que inyecta el `X-Tenant-ID` y el token JWT.
*   **Backend:** NUNCA modificar migraciones previas de Flyway. Si hay cambios en DB, crear un nuevo archivo `V[n]__descripcion.sql`. Mantener la seguridad JWT en cualquier endpoint nuevo.