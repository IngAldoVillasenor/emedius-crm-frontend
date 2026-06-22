"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Phone, Mail, Calendar, Loader2, Search, AlertCircle, CheckCircle2, Edit2, Save, X } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  createdAt?: any;
}

interface ServiceOrder {
  id: string;
  status: string;
  serviceType: string;
  instrumentBrand?: string;
  instrumentModel?: string;
  customerName?: string;
}

const formatCustomerDate = (dateVal: any) => {
  if (!dateVal) return "Fecha no registrada";
  let parsedDate: Date = Array.isArray(dateVal) 
    ? new Date(dateVal[0], dateVal[1] - 1, dateVal[2]) 
    : new Date(dateVal);
  if (isNaN(parsedDate.getTime())) return "Fecha no registrada";
  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = parsedDate.toLocaleString('es-MX', { month: 'short' }).replace('.', ''); 
  return `${day}/${month}/${parsedDate.getFullYear()}`;
};

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados Formulario Creación
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estados Modal y Edición
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estado temporal para los datos mientras se editan
  const [editData, setEditData] = useState({ name: "", email: "", whatsappNumber: "" });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [custData, ordData] = await Promise.all([
        fetchFromAPI("/customers").catch(() => []),
        fetchFromAPI("/service-orders").catch(() => [])
      ]);
      setCustomers(custData);
      setOrders(ordData);
    } catch (err: any) {
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await fetchFromAPI("/customers", {
        method: "POST",
        body: JSON.stringify({ name, email, whatsappNumber }),
      });
      setName(""); setEmail(""); setWhatsappNumber("");
      setShowForm(false);
      loadData(); 
    } catch (err: any) {
      setError(err.message || "Error al crear el cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // NUEVO: Función para guardar cambios del cliente
  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    setIsUpdating(true);
    try {
      const updatedCustomer = await fetchFromAPI(`/customers/${selectedCustomer.id}`, {
        method: "PUT",
        body: JSON.stringify(editData),
      });
      
      // Actualizamos el estado local para reflejar los cambios de inmediato
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
      await loadData(); // Recargamos el grid de fondo
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al actualizar el cliente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    const term = searchTerm.toLowerCase();
    return (
      cust.name.toLowerCase().includes(term) ||
      cust.email.toLowerCase().includes(term) ||
      cust.whatsappNumber.includes(term)
    );
  });

  const getActiveOrdersForCustomer = (customer: Customer) => {
    return orders.filter(
      (o) => o.customerName === customer.name && o.status.toUpperCase() !== "ENTREGADO"
    );
  };

  const openCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Pre-llenamos los inputs por si le da a editar
    setEditData({ name: customer.name, email: customer.email, whatsappNumber: customer.whatsappNumber });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-amber-500" />
            Directorio de Clientes
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gestiona los datos de contacto de los músicos del taller.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="pl-9 bg-white border-zinc-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full sm:w-auto">
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancelar" : "Nuevo Cliente"}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <Card className="border-amber-500/30 shadow-md max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader><CardTitle className="text-lg">Registrar Cliente</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="space-y-2"><Label>Nombre Completo</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. James Hetfield" required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Correo Electrónico</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="james@metallica.com" required /></div>
                <div className="space-y-2"><Label>WhatsApp</Label><Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="4771234567" required /></div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cliente"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 text-zinc-400">
          {searchTerm ? `No se encontraron clientes para "${searchTerm}".` : "No hay clientes registrados aún. ¡Registra el primero!"}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => {
            const activeOrders = getActiveOrdersForCustomer(customer);
            return (
              <Card key={customer.id} className="cursor-pointer border-zinc-200 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all" onClick={() => openCustomerDetails(customer)}>
                <CardHeader className="pb-3 border-b border-zinc-100">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-zinc-900">{customer.name}</CardTitle>
                    {activeOrders.length > 0 && <span className="flex h-3 w-3 rounded-full bg-amber-500" title="Órdenes activas" />}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5 text-sm text-zinc-600">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-400" /><span className="truncate">{customer.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-400" /><span>{customer.whatsappNumber}</span></div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALLE Y EDICIÓN DEL CLIENTE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-start pr-6">
              <DialogTitle className="text-xl flex items-center gap-2 text-zinc-900">
                <Users className="w-5 h-5 text-amber-500" /> 
                {isEditing ? "Editar Cliente" : selectedCustomer?.name}
              </DialogTitle>
              {!isEditing && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-amber-600" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {!isEditing && (
              <DialogDescription>
                {selectedCustomer?.email} | {selectedCustomer?.whatsappNumber}
              </DialogDescription>
            )}
          </DialogHeader>

          {isEditing ? (
            // VISTA DE EDICIÓN
            <div className="space-y-4 py-2 mt-2 border-t border-zinc-100">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Correo Electrónico</Label>
                <Input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Número de WhatsApp</Label>
                <Input value={editData.whatsappNumber} onChange={(e) => setEditData({...editData, whatsappNumber: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleUpdateCustomer} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          ) : (
            // VISTA DE DETALLE (Órdenes Activas)
            <div className="mt-2 border-t border-zinc-100 pt-4">
              <h4 className="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wider">Órdenes Activas</h4>
              {selectedCustomer && getActiveOrdersForCustomer(selectedCustomer).length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {getActiveOrdersForCustomer(selectedCustomer).map(order => (
                    <div key={order.id} className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500">Folio: #{order.id.split('-')[0]}</span>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">{order.status}</Badge>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{order.instrumentBrand} {order.instrumentModel}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">Servicio: {order.serviceType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Sin órdenes pendientes</p>
                    <p className="text-xs text-emerald-700">Este cliente no tiene instrumentos actualmente en el taller.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}