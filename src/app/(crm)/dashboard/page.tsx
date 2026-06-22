"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Wrench, CheckCircle2, Loader2, Music } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface ServiceOrder {
  id: string;
  serviceType: string;
  status: string;
  instrumentBrand?: string;
  instrumentModel?: string;
  customerName?: string;
  entryDate?: any;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Traemos todas las órdenes de servicio
        const data = await fetchFromAPI("/service-orders");
        
        // Asumimos que el backend las devuelve, o las ordenamos aquí para tener las más recientes primero
        const sortedData = data.sort((a: any, b: any) => {
          const dateA = new Date(Array.isArray(a.entryDate) ? a.entryDate.join('-') : a.entryDate).getTime();
          const dateB = new Date(Array.isArray(b.entryDate) ? b.entryDate.join('-') : b.entryDate).getTime();
          return dateB - dateA;
        });

        setOrders(sortedData);
      } catch (error) {
        console.error("Error cargando el dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Filtramos para que solo cuente las que NO están entregadas
  const activeOrders = orders.filter(o => o.status.toUpperCase() !== "ENTREGADO").length;
  const receivedOrders = orders.filter(o => o.status.toUpperCase() === "RECIBIDO").length;
  const inProcessOrders = orders.filter(o => o.status.toUpperCase() === "EN_PROCESO").length;
  const readyOrders = orders.filter(o => o.status.toUpperCase() === "LISTO").length;

  // 2. Extraer solo las últimas 5 órdenes para la tabla
  // Filtramos para excluir las entregadas y luego tomamos las 5 más recientes
  const recentOrders = orders
    .filter(order => order.status.toUpperCase() !== "ENTREGADO")
    .slice(0, 5);

  const formatOrderDate = (dateVal: any) => {
    if (!dateVal) return "---";
    let parsedDate: Date = Array.isArray(dateVal) 
      ? new Date(dateVal[0], dateVal[1] - 1, dateVal[2]) 
      : new Date(dateVal);
    if (isNaN(parsedDate.getTime())) return "---";
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = parsedDate.toLocaleString('es-MX', { month: 'short' }).replace('.', '');
    return `${day}/${month}/${parsedDate.getFullYear()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "RECIBIDO": return <span className="px-2.5 py-1 rounded-full border bg-blue-500/10 border-blue-500/20 text-blue-600 text-xs font-medium">Recibido</span>;
      case "EN_PROCESO": return <span className="px-2.5 py-1 rounded-full border bg-orange-500/10 border-orange-500/20 text-orange-600 text-xs font-medium">En Proceso</span>;
      case "LISTO": return <span className="px-2.5 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 text-xs font-medium">Listo</span>;
      default: return <span className="px-2.5 py-1 rounded-full border bg-zinc-500/10 border-zinc-500/20 text-zinc-600 text-xs font-medium">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          Hola, Emedius 👋
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Aquí está el resumen de tu taller al día de hoy.
        </p>
      </div>

      {/* Tarjetas de Resumen (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Órdenes Activas</CardTitle>
            <Activity className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeOrders}</div>
            <p className="text-xs text-zinc-400 mt-1">En el taller</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Instrumentos Recibidos</CardTitle>
            <Music className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{receivedOrders}</div>
            <p className="text-xs text-zinc-400 mt-1">Esperando revisión</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">En Proceso</CardTitle>
            <Wrench className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProcessOrders}</div>
            <p className="text-xs text-zinc-400 mt-1">En la mesa de trabajo</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Listos para Entrega</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{readyOrders}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Notificación pendiente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Órdenes Recientes */}
      <Card className="shadow-sm border-zinc-200">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-800">Órdenes de Servicio Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              Aún no hay órdenes registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Folio</th>
                    <th className="px-4 py-3 font-medium">Instrumento</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Servicio</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                        #{order.id.split('-')[0]}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {order.instrumentBrand} {order.instrumentModel}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {order.customerName || "---"}
                      </td>
                      <td className="px-4 py-3 text-amber-600 font-medium">
                        {order.serviceType}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {formatOrderDate(order.entryDate)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}