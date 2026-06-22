"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Guitar, Search, Loader2, Plus, AlertCircle, CheckCircle2, Edit2, Save, X } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Instrument {
  id: string;
  brand: string;
  model: string;
  type?: string; 
  customerName?: string;
}

interface ServiceOrder {
  id: string;
  status: string;
  serviceType: string;
  instrumentBrand?: string;
  instrumentModel?: string;
  customerName?: string;
}

export default function InstrumentosPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);

  const [editData, setEditData] = useState({ brand: "", model: "", type: "" });

  const selectClasses = "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [instData, ordData] = await Promise.all([
          fetchFromAPI("/instruments").catch(() => []),
          fetchFromAPI("/service-orders").catch(() => [])
        ]);
        setInstruments(instData);
        setOrders(ordData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdateInstrument = async () => {
    if (!selectedInstrument) return;
    setIsUpdating(true);
    try {
      const updatedInstrument = await fetchFromAPI(`/instruments/${selectedInstrument.id}`, {
        method: "PUT",
        body: JSON.stringify(editData),
      });

      setSelectedInstrument(updatedInstrument);
      setIsEditing(false);
      
      const instData = await fetchFromAPI("/instruments").catch(() => []);
      setInstruments(instData);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al actualizar el instrumento.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredInstruments = instruments.filter((inst) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${inst.brand} ${inst.model}`.toLowerCase();
    const customer = (inst.customerName || "").toLowerCase();
    return fullName.includes(term) || customer.includes(term);
  });

  const getActiveOrdersForInstrument = (instrument: Instrument) => {
    return orders.filter(
      (o) => 
        o.instrumentBrand === instrument.brand && 
        o.instrumentModel === instrument.model &&
        o.customerName === instrument.customerName &&
        o.status.toUpperCase() !== "ENTREGADO"
    );
  };

  const openInstrumentDetails = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    
    // CORRECCIÓN: Usamos los valores exactos de la BD
    const typeVal = instrument.type || "Guitarra Eléctrica";
    const isCustom = !["Guitarra Eléctrica", "Guitarra Acústica", "Bajo Eléctrico"].includes(typeVal);
    
    setShowCustomType(isCustom);
    setEditData({ brand: instrument.brand, model: instrument.model, type: typeVal });
    
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Guitar className="w-8 h-8 text-amber-500" />
            Instrumentos
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Catálogo de guitarras y bajos registrados.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar marca, modelo o dueño..."
              className="pl-9 bg-white border-zinc-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Nuevo Instrumento
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : filteredInstruments.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 text-zinc-400">
          No se encontraron instrumentos.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInstruments.map((inst) => {
            const activeOrders = getActiveOrdersForInstrument(inst);
            return (
              <Card 
                key={inst.id} 
                className="cursor-pointer hover:border-amber-500/50 hover:shadow-md transition-all border-zinc-200"
                onClick={() => openInstrumentDetails(inst)}
              >
                <CardHeader className="pb-3 border-b border-zinc-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-zinc-900">{inst.brand}</CardTitle>
                      {inst.type && <p className="text-xs text-amber-600 font-medium mt-0.5">{inst.type}</p>}
                    </div>
                    {activeOrders.length > 0 && (
                      <span className="flex h-3 w-3 rounded-full bg-amber-500" title="En taller actualmente" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-zinc-600 mt-1">{inst.model}</div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-xs text-zinc-400 uppercase font-semibold mb-1">Propietario</div>
                  <div className="font-medium text-zinc-700">{inst.customerName || "Sin asignar"}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-start pr-6">
              <DialogTitle className="text-xl flex items-center gap-2 text-zinc-900">
                <Guitar className="w-5 h-5 text-amber-500" /> 
                {isEditing ? "Editar Especificaciones" : `${selectedInstrument?.brand} ${selectedInstrument?.model}`}
              </DialogTitle>
              {!isEditing && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-amber-600" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {!isEditing && (
              <DialogDescription>
                Dueño registrado: <span className="font-medium text-zinc-900">{selectedInstrument?.customerName || "Sin asignar"}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {isEditing ? (
            <div className="space-y-4 py-2 mt-2 border-t border-zinc-100">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={editData.brand} onChange={(e) => setEditData({...editData, brand: e.target.value})} placeholder="Ej. Gibson, Fender..." />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={editData.model} onChange={(e) => setEditData({...editData, model: e.target.value})} placeholder="Ej. Les Paul, Stratocaster..." />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo / Categoría</Label>
                <select
                  className={selectClasses}
                  value={showCustomType ? "Otros" : editData.type || "Guitarra Eléctrica"}
                  onChange={(e) => {
                    if (e.target.value === "Otros") {
                      setShowCustomType(true);
                      setEditData({ ...editData, type: "" }); 
                    } else {
                      setShowCustomType(false);
                      setEditData({ ...editData, type: e.target.value });
                    }
                  }}
                >
                  {/* CORRECCIÓN: Opciones exactas como en la base de datos */}
                  <option value="Guitarra Eléctrica">Guitarra Eléctrica</option>
                  <option value="Guitarra Acústica">Guitarra Acústica</option>
                  <option value="Bajo Eléctrico">Bajo Eléctrico</option>
                  <option value="Otros">Otros (Especificar)...</option>
                </select>

                {showCustomType && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                    <Input
                      value={editData.type}
                      onChange={(e) => setEditData({...editData, type: e.target.value})}
                      placeholder="Ej. Ukulele, Cello, Amplificador..."
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleUpdateInstrument} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 border-t border-zinc-100 pt-4">
              <h4 className="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wider">
                Estatus Actual en Taller
              </h4>
              
              {selectedInstrument && getActiveOrdersForInstrument(selectedInstrument).length > 0 ? (
                <div className="space-y-3">
                  {getActiveOrdersForInstrument(selectedInstrument).map(order => (
                    <div key={order.id} className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500">Folio: #{order.id.split('-')[0]}</span>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">{order.status}</Badge>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{order.serviceType}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">Esta guitarra se encuentra actualmente en la mesa de trabajo.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Libre de servicio</p>
                    <p className="text-xs text-emerald-700">Este instrumento no tiene órdenes activas en este momento.</p>
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