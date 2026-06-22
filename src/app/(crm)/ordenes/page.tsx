"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList, Plus, Loader2, Clock, CheckCircle2, Wrench, Search, Archive } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";
import OrderDetailModal from "@/components/OrderDetailModal";

interface Instrument {
  id: string;
  brand: string;
  model: string;
  customerName?: string;
}

interface ServiceOrder {
  id: string;
  serviceType: string;
  status: string;
  notes: string;
  instrumentBrand?: string;
  instrumentModel?: string;
  customerName?: string;
  entryDate?: any;
}

export default function OrdenesPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDelivered, setShowDelivered] = useState(false);

  // Estados del formulario principal
  const [instrumentId, setInstrumentId] = useState("");
  const [serviceType, setServiceType] = useState("Pa'l Huesero");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("RECIBIDO");
  
  // Estados para IntakeConditionDTO
  const [stringGauge, setStringGauge] = useState("");
  const [action1stFret, setAction1stFret] = useState("");
  const [action12thFret, setAction12thFret] = useState("");
  const [paintCondition, setPaintCondition] = useState("");
  const [fretboardStatus, setFretboardStatus] = useState("");
  const [hardwareStatus, setHardwareStatus] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estados para el Modal de Detalle
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatOrderDate = (dateVal: any) => {
    if (!dateVal) return "Sin fecha";
    let parsedDate: Date = Array.isArray(dateVal) 
      ? new Date(dateVal[0], dateVal[1] - 1, dateVal[2]) 
      : new Date(dateVal);
    if (isNaN(parsedDate.getTime())) return "Sin fecha";
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = parsedDate.toLocaleString('es-MX', { month: 'short' }).replace('.', '');
    return `${day}/${month}/${parsedDate.getFullYear()}`;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, instrumentsData] = await Promise.all([
        fetchFromAPI("/service-orders").catch(() => []), 
        fetchFromAPI("/instruments").catch(() => [])
      ]);
      
      const sortedOrders = ordersData.sort((a: any, b: any) => {
        const dateA = new Date(Array.isArray(a.entryDate) ? a.entryDate.join('-') : a.entryDate).getTime();
        const dateB = new Date(Array.isArray(b.entryDate) ? b.entryDate.join('-') : b.entryDate).getTime();
        return dateB - dateA;
      });

      setOrders(sortedOrders);
      setInstruments(instrumentsData);
      
      if (instrumentsData.length > 0 && !instrumentId) {
        setInstrumentId(instrumentsData[0].id);
      }
    } catch (err: any) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      setError("");
      await fetchFromAPI(`/service-orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el estatus.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openOrderDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrumentId) {
      setError("Debes seleccionar un instrumento.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await fetchFromAPI("/service-orders", {
        method: "POST",
        body: JSON.stringify({ 
          instrumentId, serviceType, notes, status,
          intakeCondition: { stringGauge, action1stFret, action12thFret, paintCondition, fretboardStatus, hardwareStatus }
        }),
      });

      setNotes(""); setServiceType("Pa'l Huesero"); setStatus("RECIBIDO");
      setStringGauge(""); setAction1stFret(""); setAction12thFret("");
      setPaintCondition(""); setFretboardStatus(""); setHardwareStatus("");
      
      setShowForm(false);
      loadData(); 
    } catch (err: any) {
      setError(err.message || "Error al crear la orden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClasses = "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300";

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case "RECIBIDO": return { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: <ClipboardList className="w-4 h-4 mr-1" />, label: "Recibido" };
      case "EN_PROCESO": return { color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: <Wrench className="w-4 h-4 mr-1" />, label: "En Proceso" };
      case "LISTO": return { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4 mr-1" />, label: "Listo" };
      case "ENTREGADO": return { color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", icon: <Archive className="w-4 h-4 mr-1" />, label: "Entregado" };
      default: return { color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", icon: <Clock className="w-4 h-4 mr-1" />, label: status };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!showDelivered && order.status.toUpperCase() === "ENTREGADO") {
      return false;
    }

    const term = searchTerm.toLowerCase();
    const orderId = order.id.split('-')[0].toLowerCase();
    const instrumentInfo = `${order.instrumentBrand} ${order.instrumentModel}`.toLowerCase();
    const customerInfo = (order.customerName || "").toLowerCase();

    return (
      orderId.includes(term) ||
      instrumentInfo.includes(term) ||
      customerInfo.includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Controles Superiores */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-amber-500" />
            Órdenes de Servicio
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Controla el flujo de trabajo de cada instrumento en el taller.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar folio, cliente o guitarra..."
              className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowDelivered(!showDelivered)}
            className="w-full sm:w-auto border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
          >
            <Archive className="w-4 h-4 mr-2" />
            {showDelivered ? "Ocultar Entregadas" : "Ver Entregadas"}
          </Button>

          <Button onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            {showForm ? "Cancelar" : "Nueva Orden"}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Formulario de Creación (Limpiado y corregido) */}
      {showForm && (
        <Card className="border-amber-500/30 shadow-md max-w-3xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Generar Orden de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrumento a Reparar</Label>
                  <select id="instrument" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)} className={selectClasses} required>
                    <option value="" disabled>Selecciona un instrumento...</option>
                    {instruments.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.brand} {inst.model} {inst.customerName ? `(Dueño: ${inst.customerName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Paquete de Servicio</Label>
                    <select 
                      id="serviceType" 
                      value={serviceType} 
                      onChange={(e) => setServiceType(e.target.value)} 
                      className={selectClasses}
                    >
                      <option value="Pa'l Huesero">Pa'l Huesero</option>
                      <option value="Pa'l Rockstar">Pa'l Rockstar (Full Service)</option>
                      <option value="Ajuste Personalizado">Ajuste Personalizado</option>
                      <option value="Solo Electrónica">Solo Electrónica</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Label className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Condiciones de Ingreso al Taller</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="stringGauge" className="text-xs">Calibre de Cuerdas</Label><Input id="stringGauge" value={stringGauge} onChange={(e) => setStringGauge(e.target.value)} placeholder="Ej. 10-46" required /></div>
                  <div className="space-y-2"><Label htmlFor="action1stFret" className="text-xs">Acción 1er Traste</Label><Input id="action1stFret" value={action1stFret} onChange={(e) => setAction1stFret(e.target.value)} placeholder="Ej. 0.5mm" required /></div>
                  <div className="space-y-2"><Label htmlFor="action12thFret" className="text-xs">Acción 12vo Traste</Label><Input id="action12thFret" value={action12thFret} onChange={(e) => setAction12thFret(e.target.value)} placeholder="Ej. 1.5mm" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="paintCondition" className="text-xs">Estado Pintura</Label><Input id="paintCondition" value={paintCondition} onChange={(e) => setPaintCondition(e.target.value)} placeholder="Ej. Raspones" required /></div>
                  <div className="space-y-2"><Label htmlFor="fretboardStatus" className="text-xs">Estado Diapasón</Label><Input id="fretboardStatus" value={fretboardStatus} onChange={(e) => setFretboardStatus(e.target.value)} placeholder="Ej. Reseco" required /></div>
                  <div className="space-y-2"><Label htmlFor="hardwareStatus" className="text-xs">Estado Hardware</Label><Input id="hardwareStatus" value={hardwareStatus} onChange={(e) => setHardwareStatus(e.target.value)} placeholder="Ej. Óxido" required /></div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Label htmlFor="notes">Instrucciones Especiales</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Afinar en Drop D" />
              </div>

              <Button type="submit" disabled={isSubmitting || instruments.length === 0} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-4">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Orden de Servicio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grid de Renderizado de Tarjetas */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 text-zinc-400">
          No hay órdenes de servicio en el sistema.
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 text-zinc-400">
          {showDelivered 
            ? `No se encontraron resultados para "${searchTerm}".` 
            : "No hay órdenes activas. (Revisa el historial de entregadas)."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const statusDisplay = getStatusDisplay(order.status);
            const isDelivered = order.status.toUpperCase() === "ENTREGADO";

            return (
              <Card
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => openOrderDetails(order)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openOrderDetails(order);
                  }
                }}
                className={`border-zinc-200 shadow-sm flex flex-col transition-colors cursor-pointer ${isDelivered ? 'opacity-70 bg-zinc-50' : 'hover:border-amber-500/50'} `}
              >
                <CardHeader className="pb-3 border-b border-zinc-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-zinc-400">#{order.id.split('-')[0]}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center ${statusDisplay.color}`}>
                      {statusDisplay.icon} {statusDisplay.label}
                    </span>
                  </div>
                  <CardTitle className={`text-lg font-bold ${isDelivered ? 'text-zinc-600' : 'text-zinc-900'}`}>{order.instrumentBrand} {order.instrumentModel}</CardTitle>
                  <div className="text-sm font-medium text-zinc-500">Dueño: {order.customerName || "No especificado"}</div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="text-xs text-zinc-400 uppercase font-semibold mb-1">Servicio</div>
                    <div className={`font-medium ${isDelivered ? 'text-zinc-600' : 'text-amber-600'}`}>{order.serviceType}</div>
                  </div>
                  {order.notes && (
                    <div className="mb-4 text-sm text-zinc-600 bg-zinc-100/50 p-2 rounded border border-zinc-100">
                      <span className="font-semibold text-zinc-700">Notas:</span> {order.notes}
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100">
                    <div className="flex items-center text-xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {formatOrderDate(order.entryDate)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {updatingId === order.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
                      <select 
                        value={order.status}
                        onClick={(e) => e.stopPropagation()} // Detiene la propagación del clic hacia la tarjeta
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs bg-zinc-50 border border-zinc-200 rounded px-2 py-1 cursor-pointer hover:bg-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-zinc-700 disabled:opacity-50"
                      >
                        <option value="RECIBIDO">Mover a: Recibido</option>
                        <option value="EN_PROCESO">Mover a: En Proceso</option>
                        <option value="LISTO">Mover a: Listo</option>
                        <option value="ENTREGADO">Mover a: Entregado</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal maestro inyectado de forma segura en la raíz del componente */}
      <OrderDetailModal 
        order={selectedOrder} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpdateSuccess={(updatedOrder) => {
          setSelectedOrder(updatedOrder);
          loadData();
        }} 
      />
    </div>
  );
}