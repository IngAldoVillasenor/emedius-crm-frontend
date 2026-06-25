"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ClipboardList, Plus, Loader2, Clock, CheckCircle2, 
  Wrench, Search, Archive, User, Guitar, Activity, X, Save, AlertTriangle, Hourglass 
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";
import OrderDetailModal from "@/components/OrderDetailModal";

interface Customer {
  id: string;
  name: string;
}

interface Instrument {
  id: string;
  brand: string;
  model: string;
  serialNumber?: string;
  customerId?: string;
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

const INITIAL_FORM_DATA = {
  existingCustomerId: "",
  newCustomerName: "",
  newCustomerPhone: "",
  newCustomerEmail: "",

  existingInstrumentId: "",
  newInstrumentBrand: "",
  newInstrumentModel: "",
  newInstrumentSerialNumber: "", // <-- NUEVO: Número de serie
  newInstrumentType: "Guitarra Eléctrica",

  serviceType: "Pa'l Huesero",
  initialNotes: "",

  stringGauge: "",
  action1stFret: "",
  action12thFret: "",
  paintCondition: "",
  fretboardStatus: "",
  hardwareStatus: ""
};

export default function OrdenesPage() {
  // --- ESTADOS DE LA VISTA PRINCIPAL ---
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allInstruments, setAllInstruments] = useState<Instrument[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDelivered, setShowDelivered] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // --- ESTADOS DEL FORMULARIO UNIFICADO ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isNewInstrument, setIsNewInstrument] = useState(false);
  const [showNewCustomType, setShowNewCustomType] = useState(false); // <-- NUEVO: Estado para "Otros"
  const [filteredInstruments, setFilteredInstruments] = useState<Instrument[]>([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // --- ESTADOS DEL MODAL ---
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Utilidades
  const selectClasses = "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300";

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
      const [ordersData, instrumentsData, customersData] = await Promise.all([
        fetchFromAPI("/service-orders").catch(() => []), 
        fetchFromAPI("/instruments").catch(() => []),
        fetchFromAPI("/customers").catch(() => [])
      ]);
      
      const sortedOrders = ordersData.sort((a: any, b: any) => {
        const dateA = new Date(Array.isArray(a.entryDate) ? a.entryDate.join('-') : a.entryDate).getTime();
        const dateB = new Date(Array.isArray(b.entryDate) ? b.entryDate.join('-') : b.entryDate).getTime();
        return dateB - dateA;
      });

      setOrders(sortedOrders);
      setAllInstruments(instrumentsData);
      setCustomers(customersData);
    } catch (err: any) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.existingCustomerId) {
      const filtered = allInstruments.filter(
        (inst) => inst.customerId === formData.existingCustomerId
      );
      setFilteredInstruments(filtered);
      setFormData(prev => ({ ...prev, existingInstrumentId: "" }));
    } else {
      setFilteredInstruments([]);
    }
  }, [formData.existingCustomerId, allInstruments]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === "REQUIERE_APROBACION" || newStatus === "APROBADO_POR_CLIENTE") {
      return;
    }

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

  const handleCreateUnifiedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const finalPayload = { ...formData };
    
    // Limpieza de payload según la selección
    if (isNewCustomer) {
      finalPayload.existingCustomerId = "";
    } else {
      finalPayload.newCustomerName = "";
      finalPayload.newCustomerPhone = "";
      finalPayload.newCustomerEmail = "";
    }

    if (isNewInstrument) {
      finalPayload.existingInstrumentId = "";
    } else {
      finalPayload.newInstrumentBrand = "";
      finalPayload.newInstrumentModel = "";
      finalPayload.newInstrumentType = "";
      finalPayload.newInstrumentSerialNumber = ""; // <-- Limpiamos número de serie también
    }

    try {
      await fetchFromAPI("/service-orders/unified", {
        method: "POST",
        body: JSON.stringify(finalPayload),
      });

      // Resetear estados
      setFormData(INITIAL_FORM_DATA);
      setIsNewCustomer(false);
      setIsNewInstrument(false);
      setShowNewCustomType(false);
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Error al crear la orden unificada.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case "RECIBIDO": return { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: <ClipboardList className="w-4 h-4 mr-1" />, label: "Recibido" };
      case "EN_PROCESO": return { color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: <Wrench className="w-4 h-4 mr-1" />, label: "En Proceso" };
      case "LISTO": return { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4 mr-1" />, label: "Listo" };
      case "ENTREGADO": return { color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", icon: <Archive className="w-4 h-4 mr-1" />, label: "Entregado" };
      case "EN_ESPERA": return { color: "text-amber-600 bg-amber-500/10 border-amber-500/20", icon: <Hourglass className="w-4 h-4 mr-1" />, label: "En espera" };
      case "REQUIERE_APROBACION": return { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: <AlertTriangle className="w-4 h-4 mr-1" />, label: "Requiere aprobación" };
      case "APROBADO_POR_CLIENTE": return { color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4 mr-1" />, label: "Aprobado por cliente" };
      default: return { color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", icon: <Clock className="w-4 h-4 mr-1" />, label: status };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!showDelivered && order.status.toUpperCase() === "ENTREGADO") return false;
    const term = searchTerm.toLowerCase();
    return (
      order.id.split('-')[0].toLowerCase().includes(term) ||
      `${order.instrumentBrand} ${order.instrumentModel}`.toLowerCase().includes(term) ||
      (order.customerName || "").toLowerCase().includes(term)
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
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar Registro" : "Nueva Orden"}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* FORMULARIO UNIFICADO DE CREACIÓN */}
      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Alta de Servicio Expreso</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Registra cliente, instrumento e historial en una sola transacción.</p>
          </div>

          <form onSubmit={handleCreateUnifiedOrder} className="space-y-8">
            
            {/* BLOQUE 1: CLIENTE */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <User className="w-5 h-5 text-amber-500" /> Datos del Cliente
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const isNowNew = !isNewCustomer;
                    setIsNewCustomer(isNowNew);
                    if (isNowNew) {
                      setIsNewInstrument(true);
                      setFormData(prev => ({ ...prev, existingCustomerId: "", existingInstrumentId: "" }));
                    }
                  }}
                >
                  {isNewCustomer ? "Seleccionar Existente" : "Registrar Nuevo"}
                </Button>
              </div>
              
              {isNewCustomer ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input value={formData.newCustomerName} onChange={e => setFormData({...formData, newCustomerName: e.target.value})} placeholder="Ej. Juan Pérez" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono WhatsApp</Label>
                    <Input value={formData.newCustomerPhone} onChange={e => setFormData({...formData, newCustomerPhone: e.target.value})} placeholder="Ej. 4771234567" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo Electrónico (Opcional)</Label>
                    <Input type="email" value={formData.newCustomerEmail} onChange={e => setFormData({...formData, newCustomerEmail: e.target.value})} placeholder="juan@correo.com" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-w-md">
                  <Label>Buscar Cliente Registrado</Label>
                  <select className={selectClasses} value={formData.existingCustomerId} onChange={e => setFormData({...formData, existingCustomerId: e.target.value})} required>
                    <option value="" disabled>Selecciona un cliente de la lista...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* BLOQUE 2: INSTRUMENTO */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <Guitar className="w-5 h-5 text-amber-500" /> Especificaciones del Instrumento
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  disabled={isNewCustomer || (!isNewCustomer && !formData.existingCustomerId)} 
                  onClick={() => setIsNewInstrument(!isNewInstrument)}
                >
                  {isNewInstrument ? "Seleccionar Existente" : "Registrar Nuevo"}
                </Button>
              </div>

              {!isNewCustomer && !formData.existingCustomerId ? (
                <p className="text-sm text-zinc-400 italic">Por favor, selecciona o crea un cliente primero.</p>
              ) : isNewInstrument ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input value={formData.newInstrumentBrand} onChange={e => setFormData({...formData, newInstrumentBrand: e.target.value})} placeholder="Ej. Fender" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input value={formData.newInstrumentModel} onChange={e => setFormData({...formData, newInstrumentModel: e.target.value})} placeholder="Ej. Stratocaster" required />
                  </div>
                  
                  {/* NUEVO: NÚMERO DE SERIE */}
                  <div className="space-y-2">
                    <Label>Número de Serie (Opcional)</Label>
                    <Input value={formData.newInstrumentSerialNumber} onChange={e => setFormData({...formData, newInstrumentSerialNumber: e.target.value})} placeholder="Ej. US19283746" />
                  </div>

                  {/* NUEVO: LÓGICA DE CATEGORÍA CON "OTROS" */}
                  <div className="space-y-2">
                    <Label>Tipo / Categoría</Label>
                    <select
                      className={selectClasses}
                      value={showNewCustomType ? "Otros" : formData.newInstrumentType}
                      onChange={(e) => {
                        if (e.target.value === "Otros") {
                          setShowNewCustomType(true);
                          setFormData({ ...formData, newInstrumentType: "" }); 
                        } else {
                          setShowNewCustomType(false);
                          setFormData({ ...formData, newInstrumentType: e.target.value });
                        }
                      }}
                    >
                      <option value="Guitarra Eléctrica">Guitarra Eléctrica</option>
                      <option value="Guitarra Acústica">Guitarra Acústica</option>
                      <option value="Bajo Eléctrico">Bajo Eléctrico</option>
                      <option value="Otros">Otros (Especificar)...</option>
                    </select>

                    {showNewCustomType && (
                      <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                        <Input
                          value={formData.newInstrumentType}
                          onChange={(e) => setFormData({...formData, newInstrumentType: e.target.value})}
                          placeholder="Ej. Ukulele, Cello, Amplificador..."
                          required={showNewCustomType}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-w-md">
                  <Label>Instrumentos asociados al cliente</Label>
                  <select className={selectClasses} value={formData.existingInstrumentId} onChange={e => setFormData({...formData, existingInstrumentId: e.target.value})} required>
                    <option value="" disabled>Selecciona un instrumento...</option>
                    {filteredInstruments.map(i => <option key={i.id} value={i.id}>{i.brand} - {i.model}</option>)}
                    {filteredInstruments.length === 0 && <option value="" disabled>No tiene instrumentos. Usa el botón de registrar nuevo.</option>}
                  </select>
                </div>
              )}
            </div>

            {/* BLOQUE 3: DETALLES Y CONDICIONES */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Activity className="w-5 h-5 text-amber-500" /> Detalles del Trabajo y Recepción
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Servicio a Realizar</Label>
                  <select className={selectClasses} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
                    <option value="Pa'l Apuro">Pa'l Apuro (Ajuste Básico)</option>
                    <option value="Pa'l Huesero">Pa'l Huesero (Mantenimiento Estándar)</option>
                    <option value="Pa'l Rockstar">Pa'l Rockstar (Servicio Completo)</option>
                    <option value="Pa' La Leyenda">Pa' La Leyenda (Ultimate + Nivelado)</option>
                    <option value="Electrónica / Reparación">Reparación / Electrónica (Específico)</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Instrucciones o Síntomas Iniciales</Label>
                  <Input value={formData.initialNotes} onChange={e => setFormData({...formData, initialNotes: e.target.value})} placeholder="Ej. Afinar en Drop D, potenciómetro de volumen hace ruido" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <div className="space-y-2"><Label className="text-xs">Calibre de Cuerdas</Label><Input value={formData.stringGauge} onChange={e => setFormData({...formData, stringGauge: e.target.value})} placeholder="Ej. 10-46" /></div>
                <div className="space-y-2"><Label className="text-xs">Acción 1er Traste</Label><Input value={formData.action1stFret} onChange={e => setFormData({...formData, action1stFret: e.target.value})} placeholder="Ej. 0.5mm" /></div>
                <div className="space-y-2"><Label className="text-xs">Acción 12vo Traste</Label><Input value={formData.action12thFret} onChange={e => setFormData({...formData, action12thFret: e.target.value})} placeholder="Ej. 1.5mm" /></div>
                
                <div className="space-y-2"><Label className="text-xs">Estado Pintura</Label><Input value={formData.paintCondition} onChange={e => setFormData({...formData, paintCondition: e.target.value})} placeholder="Ej. Raspones traseros" /></div>
                <div className="space-y-2"><Label className="text-xs">Estado Diapasón</Label><Input value={formData.fretboardStatus} onChange={e => setFormData({...formData, fretboardStatus: e.target.value})} placeholder="Ej. Reseco" /></div>
                <div className="space-y-2"><Label className="text-xs">Estado Hardware</Label><Input value={formData.hardwareStatus} onChange={e => setFormData({...formData, hardwareStatus: e.target.value})} placeholder="Ej. Óxido leve" /></div>
              </div>
            </div>

            {/* BOTONES DE ENVÍO */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Registrar Orden Completa
              </Button>
            </div>
          </form>
        </div>
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
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id || order.status === "REQUIERE_APROBACION" }
                        className="text-xs bg-zinc-50 border border-zinc-200 rounded px-2 py-1 cursor-pointer hover:bg-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-zinc-700 disabled:opacity-50"
                      >
                        <option value="RECIBIDO">Mover a: Recibido</option>
                        <option value="EN_PROCESO">Mover a: En Proceso</option>
                        <option value="EN_ESPERA">Mover a: En espera</option>
                        <option value="LISTO">Mover a: Listo</option>
                        <option value="ENTREGADO">Mover a: Entregado</option>
                        <option value="REQUIERE_APROBACION" disabled>Esperando aprobación</option>
                        <option value="APROBADO_POR_CLIENTE" disabled>Mover a: Aprobado por cliente</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal maestro */}
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