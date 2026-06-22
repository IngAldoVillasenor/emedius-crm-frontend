"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClipboardList, User, Wrench, Music, Calendar, Edit2, Save, X, Loader2, Printer } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: (updatedOrder: any) => void; 
}

export default function OrderDetailModal({ order, isOpen, onClose, onUpdateSuccess }: OrderDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [editData, setEditData] = useState({
    serviceType: "",
    notes: "",
    intakeCondition: { stringGauge: "", action1stFret: "", action12thFret: "", paintCondition: "", fretboardStatus: "", hardwareStatus: "" }
  });

  useEffect(() => {
    if (order && isOpen) {
      setIsEditing(false);
      setEditData({
        serviceType: order.serviceType || "Pa'l Huesero",
        notes: order.notes || "",
        intakeCondition: {
          stringGauge: order.intakeCondition?.stringGauge || "",
          action1stFret: order.intakeCondition?.action1stFret || "",
          action12thFret: order.intakeCondition?.action12thFret || "",
          paintCondition: order.intakeCondition?.paintCondition || "",
          fretboardStatus: order.intakeCondition?.fretboardStatus || "",
          hardwareStatus: order.intakeCondition?.hardwareStatus || ""
        }
      });
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedOrder = await fetchFromAPI(`/service-orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify(editData),
      });
      setIsEditing(false);
      onUpdateSuccess(updatedOrder); 
    } catch (err: any) {
      alert(err.message || "Error al actualizar la orden.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = async () => {
    const originalTitle = document.title;
    const folio = order.id.split('-')[0].toUpperCase();
    const cleanName = (order.customerName || "Cliente").replace(/\s+/g, '_'); 
    const fileName = `Orden_${folio}_${cleanName}`;
    
    document.title = fileName;

    try {
      await navigator.clipboard.writeText(fileName);
      // alert(`Nombre del archivo copiado al portapapeles: \n${fileName}\n\nSi la ventana de Windows aparece vacía, solo presiona "Ctrl + V" (Pegar).`);
    } catch (err) {
      console.error("No se pudo copiar al portapapeles", err);
    }
    
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 300);
  };

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

  const handleIntakeChange = (field: string, value: string) => {
    setEditData({
      ...editData,
      intakeCondition: { ...editData.intakeCondition, [field]: value }
    });
  };

  const selectClasses = "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 
        EL FIX ESTÁ AQUÍ EN LAS CLASES print: 
        Obligamos al modal a ser estático (static), quitamos la transformación que lo centra (transform-none), 
        y lo mandamos a la esquina superior izquierda (top-0 left-0) permitiendo desborde (overflow-visible).
      */}
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-x-hidden overflow-y-auto p-0 border-0 shadow-2xl print:static print:transform-none print:left-0 print:top-0 print:translate-x-0 print:translate-y-0 print:overflow-visible print:h-auto print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
        
        <style>{`
          @media print {
            @page {
              margin: 1.5cm;
            }
            /* Destruimos las restricciones de altura y scroll que pone el modal al documento */
            html, body {
              overflow: visible !important;
              height: auto !important;
              position: static !important;
            }
            body * { visibility: hidden; }
            
            /* Ocultamos elementos invisibles de Radix UI que estorban a la impresora */
            div[data-radix-focus-guard], 
            div[data-aria-hidden="true"] {
              display: none !important;
            }
            
            /* El ticket toma el control desde el mero inicio de la hoja */
            #printable-ticket, #printable-ticket * { visibility: visible; }
            #printable-ticket {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
              padding: 0;
              margin: 0;
            }
            .no-print { display: none !important; }
          }
        `}</style>

        {/* ========================================= */}
        {/* VISTA NORMAL (DIGITAL) - Oculta al imprimir */}
        {/* ========================================= */}
        <div className="no-print">
          <DialogHeader className="bg-zinc-50 border-b border-zinc-200 p-6 rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-zinc-900 flex flex-wrap items-center gap-2">
                  Orden de Servicio <span className="text-amber-600">#{order.id.split('-')[0]}</span>
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500 font-medium">
                  <Calendar className="w-4 h-4" /> Ingresó el: {formatOrderDate(order.entryDate)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 px-3 py-1.5 text-sm whitespace-nowrap">
                  {order.status}
                </Badge>
                
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 border-zinc-300 text-zinc-700 hover:text-black">
                    <Printer className="w-3.5 h-3.5" /> Generar Ticket
                  </Button>
                )}

                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 border-zinc-300 text-zinc-700">
                    <Edit2 className="w-3.5 h-3.5" /> Editar Orden
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm opacity-80">
                <h4 className="flex items-center gap-2 font-bold text-zinc-800 mb-4 pb-2 border-b border-zinc-100">
                  <User className="w-5 h-5 text-zinc-400" /> Datos del Cliente e Instrumento
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Propietario</p>
                    <p className="text-base font-medium text-zinc-900">{order.customerName || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Instrumento en Taller</p>
                    <p className="text-base text-zinc-700 flex items-center gap-2 mt-0.5">
                      <Music className="w-4 h-4 text-amber-500" />
                      {order.instrumentBrand} {order.instrumentModel}
                    </p>
                  </div>
                  {isEditing && <p className="text-xs text-amber-600 mt-2 italic">*Para editar cliente o instrumento, ve a sus respectivos catálogos.</p>}
                </div>
              </div>

              <div className={`bg-white p-5 rounded-xl border shadow-sm transition-colors ${isEditing ? "border-amber-400 ring-1 ring-amber-400/20" : "border-zinc-200"}`}>
                <h4 className="flex items-center gap-2 font-bold text-zinc-800 mb-4 pb-2 border-b border-zinc-100">
                  <Wrench className="w-5 h-5 text-zinc-400" /> Detalles del Servicio
                </h4>
                {isEditing ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                      <Label>Paquete Seleccionado</Label>
                      <select value={editData.serviceType} onChange={(e) => setEditData({...editData, serviceType: e.target.value})} className={selectClasses}>
                        <option value="Pa'l Huesero">Pa'l Huesero</option>
                        <option value="Pa'l Rockstar">Pa'l Rockstar (Full Service)</option>
                        <option value="Ajuste Personalizado">Ajuste Personalizado</option>
                        <option value="Solo Electrónica">Solo Electrónica</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Instrucciones Especiales</Label>
                      <Input value={editData.notes} onChange={(e) => setEditData({...editData, notes: e.target.value})} placeholder="Afinar en Drop D, etc." />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-semibold">Paquete Seleccionado</p>
                      <p className="text-base font-bold text-amber-600">{order.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-semibold">Instrucciones Especiales</p>
                      <p className="text-sm text-zinc-700 bg-zinc-50 p-2.5 rounded-md border border-zinc-100 mt-1">
                        {order.notes || "Ninguna instrucción adicional."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 text-zinc-100 p-6 rounded-xl shadow-lg border border-zinc-800">
              <h4 className="flex items-center gap-2 font-bold text-white mb-6 pb-3 border-b border-zinc-700/50 text-lg">
                <ClipboardList className="w-5 h-5 text-amber-500" /> Hoja de Inspección de Ingreso
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-8">
                {[
                  { label: "Calibre de Cuerdas", field: "stringGauge" },
                  { label: "Acción 1er Traste", field: "action1stFret" },
                  { label: "Acción 12vo Traste", field: "action12thFret" },
                  { label: "Estado de la Pintura", field: "paintCondition" },
                  { label: "Estado del Diapasón", field: "fretboardStatus" },
                  { label: "Hardware y Electrónica", field: "hardwareStatus" },
                ].map((item) => (
                  <div key={item.field}>
                    <Label className="text-xs text-zinc-400 uppercase tracking-wider mb-1.5 block">
                      {item.label}
                    </Label>
                    {isEditing ? (
                      <Input className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-amber-500" value={(editData.intakeCondition as any)[item.field]} onChange={(e) => handleIntakeChange(item.field, e.target.value)} />
                    ) : (
                      <p className="font-medium text-amber-50 text-base">{order.intakeCondition?.[item.field] || "N/A"}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 animate-in fade-in slide-in-from-bottom-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating} className="border-zinc-300">
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button onClick={handleUpdate} disabled={isUpdating} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Especificaciones
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* VISTA TICKET (Solo visible al imprimir)     */}
        {/* ========================================= */}
        <div id="printable-ticket" className="hidden text-black font-sans bg-white w-full mx-auto border-0">
          
          <div className="text-center border-b-2 border-black pb-6 mb-6">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">Emedius' Guitar Workshop</h1>
            <p className="text-lg font-medium text-zinc-600 mt-1">Ticket de Recepción / Hoja Técnica</p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-b border-dashed border-zinc-300 pb-6 mb-6">
            <div className="space-y-4">
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Folio de Orden</span><br/><span className="text-xl font-bold">#{order.id.split('-')[0].toUpperCase()}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Fecha de Ingreso</span><br/><span className="text-base font-medium">{formatOrderDate(order.entryDate)}</span></p>
            </div>
            <div className="space-y-4">
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Propietario</span><br/><span className="text-xl font-bold">{order.customerName || "No especificado"}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Instrumento</span><br/><span className="text-base font-medium">{order.instrumentBrand} {order.instrumentModel}</span></p>
            </div>
          </div>

          <div className="border-b border-dashed border-zinc-300 pb-6 mb-6">
            <p className="mb-4"><span className="font-bold text-zinc-500 uppercase text-xs">Paquete de Servicio</span><br/><span className="text-lg font-bold">{order.serviceType}</span></p>
            <p><span className="font-bold text-zinc-500 uppercase text-xs">Instrucciones Especiales</span><br/><span className="text-base italic">{order.notes || "Ninguna instrucción adicional."}</span></p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 bg-zinc-100 py-2 px-3 uppercase text-center tracking-wider">Condiciones de Ingreso</h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Calibre de Cuerdas:</span><br/> <span className="font-medium text-base">{order.intakeCondition?.stringGauge || "N/A"}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Pintura:</span><br/> <span className="font-medium text-base">{order.intakeCondition?.paintCondition || "N/A"}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Acción 1er Traste:</span><br/> <span className="font-medium text-base">{order.intakeCondition?.action1stFret || "N/A"}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Diapasón:</span><br/> <span className="font-medium text-base">{order.intakeCondition?.fretboardStatus || "N/A"}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Acción 12vo Traste:</span><br/> <span className="font-medium text-base">{order.intakeCondition?.action12thFret || "N/A"}</span></p>
              <p><span className="font-bold text-zinc-500 uppercase text-xs">Hardware:</span><br/> <span className="font-medium text-base">{order.intakeCondition?.hardwareStatus || "N/A"}</span></p>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-2 gap-12 text-center">
            <div>
              <div className="border-t border-black pt-2">
                <p className="font-bold">Firma de Conformidad</p>
                <p className="text-xs text-zinc-500">Cliente / Propietario</p>
              </div>
            </div>
            <div>
              <div className="border-t border-black pt-2">
                <p className="font-bold">Emedius' Guitar Workshop</p>
                <p className="text-xs text-zinc-500">Recepción / Luthier</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-zinc-500 border-t border-zinc-200 pt-4">
            Al firmar este documento, el cliente acepta las condiciones en las que ingresa el instrumento descritas en la "Hoja de Inspección". 
            Conserve este ticket para recoger su instrumento. Pasados 30 días de la notificación de entrega, se generarán cargos por almacenaje.
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}