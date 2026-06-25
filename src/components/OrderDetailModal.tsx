"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // <-- NUEVO IMPORT
import { 
  ClipboardList, User, Wrench, Music, Calendar, Edit2, 
  Save, X, Loader2, Printer, History, FileText, Send, Clock,
  AlertCircle, MessageCircle, Link as LinkIcon, CheckCircle2, DollarSign
} from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

// --- NUEVAS INTERFACES PARA LA BITÁCORA ---
export interface InstrumentLog {
  id: string;
  instrumentId: string;
  serviceOrderId?: string;
  author: string;
  note: string;
  type: string;
  entryDate: string; 
}

export interface InstrumentLogRequest {
  instrumentId: string;
  serviceOrderId?: string;
  author: string;
  note: string;
  type: string;
}

interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: (updatedOrder: any) => void; 
}

export default function OrderDetailModal({ order, isOpen, onClose, onUpdateSuccess }: OrderDetailModalProps) {
  // --- ESTADOS DE EDICIÓN (Tus estados originales) ---
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalData, setApprovalData] = useState({ cost: "", reason: "" });
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  
  const [editData, setEditData] = useState({
    serviceType: "",
    notes: "",
    intakeCondition: { stringGauge: "", action1stFret: "", action12thFret: "", paintCondition: "", fretboardStatus: "", hardwareStatus: "" }
  });

  // --- NUEVOS ESTADOS PARA LA BITÁCORA ---
  const [activeTab, setActiveTab] = useState<"details" | "logs">("details");
  const [logs, setLogs] = useState<InstrumentLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("Diagnóstico");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // Extraemos el ID del instrumento (ajusta esto si tu DTO tiene otra estructura)
  const instrumentId = order?.instrumentId || order?.instrument?.id;

  // --- EFECTOS ---
  useEffect(() => {
    if (order && isOpen) {
      setIsEditing(false);
      setShowApprovalForm(false);
      setActiveTab("details"); // Reseteamos a la pestaña de detalles al abrir
      setApprovalData({ cost: "", reason: "" });
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

  // Cargar bitácora al cambiar de pestaña
  useEffect(() => {
    if (activeTab === "logs" && instrumentId) {
      loadLogs();
    }
  }, [activeTab, instrumentId]);

  if (!order) return null;

  // --- FUNCIONES DE LA BITÁCORA ---
  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await fetchFromAPI(`/instrument-logs/instrument/${instrumentId}`);
      setLogs(data);
    } catch (error) {
      console.error("Error cargando bitácora:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleAddLog = async () => {
    if (!newNote.trim() || !instrumentId) return;
    setIsSubmittingLog(true);

    const payload: InstrumentLogRequest = {
      instrumentId: instrumentId,
      serviceOrderId: order.id,
      author: "Emedius", // A futuro puedes tomarlo del usuario logueado
      note: newNote,
      type: noteType
    };

    try {
      await fetchFromAPI("/instrument-logs", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setNewNote(""); 
      loadLogs(); 
    } catch (error) {
      console.error("Error al guardar nota:", error);
      alert("No se pudo guardar la nota en la bitácora.");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const formatLogDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-MX', { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  // --- FUNCIONES ORIGINALES (Edición e Impresión) ---
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

  const handleRequestApproval = async () => {
    if (!approvalData.cost || !approvalData.reason) {
      alert("Debes ingresar un costo y un motivo para la solicitud.");
      return;
    }

    const parsedCost = parseFloat(approvalData.cost);
    if (Number.isNaN(parsedCost)) {
      alert("El costo adicional debe ser un número válido.");
      return;
    }

    setIsRequestingApproval(true);
    try {
      const payload = {
        ...editData,
        status: "REQUIERE_APROBACION",
        extraCost: parsedCost,
        extraWorkReason: approvalData.reason,
      };

      // 1. Mandamos la actualización al backend (aquí se genera el token)
      const updatedOrder = await fetchFromAPI(`/service-orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // 2. Cerramos el formulario de solicitud
      setShowApprovalForm(false);
      
      // 3. ¡VITAL! Actualizamos la vista global para que el modal reciba el nuevo objeto `order`
      onUpdateSuccess(updatedOrder);

    } catch (err: any) {
      alert(err.message || "Error al generar la solicitud de aprobación.");
    } finally {
      setIsRequestingApproval(false);
    }
  };

  const generateWhatsAppLink = () => {
    const link = `https://emediusgw.com/aprobacion/${order.approvalToken}`;
    const message = `¡Hola ${order.customerName}! 🎸\n\nDurante la revisión de tu ${order.instrumentBrand}, nuestro laudero detectó un detalle que requiere tu visto bueno para continuar.\n\nPuedes revisar el diagnóstico y aprobar el presupuesto extra directamente en este enlace seguro:\n${link}\n\nQuedamos a tus órdenes.`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("¡Enlace copiado al portapapeles!");
    } catch (err) {
      console.error("Error al copiar: ", err);
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
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-x-hidden overflow-y-auto p-0 border-0 shadow-2xl print:static print:transform-none print:left-0 print:top-0 print:translate-x-0 print:translate-y-0 print:overflow-visible print:h-auto print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
        
        <style>{`
          @media print {
            @page {
              margin: 1.5cm;
            }
            html, body {
              overflow: visible !important;
              height: auto !important;
              position: static !important;
            }
            body * { visibility: hidden; }
            
            div[data-radix-focus-guard], 
            div[data-aria-hidden="true"] {
              display: none !important;
            }
            
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
        <div className="no-print flex flex-col h-full">
          <DialogHeader className="bg-zinc-50 border-b border-zinc-200 p-6 pb-4 rounded-t-lg">
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
                <Badge className={`px-3 py-1.5 text-sm whitespace-nowrap ${
                  order.status === 'REQUIERE_APROBACION' ? 'bg-red-100 text-red-800 border-red-300' :
                  order.status === 'APROBADO_POR_CLIENTE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                }`}>
                  {String(order.status).replace(/_/g, ' ')}
                </Badge>

                {!isEditing && activeTab === "details" && order.status !== "REQUIERE_APROBACION" && order.status !== "APROBADO_POR_CLIENTE" && (
                  <Button variant="outline" size="sm" onClick={() => setShowApprovalForm(!showApprovalForm)} className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                    <AlertCircle className="w-3.5 h-3.5" /> Solicitar Vo.Bo.
                  </Button>
                )}
                
                {!isEditing && activeTab === "details" && (
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 border-zinc-300 text-zinc-700 hover:text-black">
                    <Printer className="w-3.5 h-3.5" /> Generar Ticket
                  </Button>
                )}

                {!isEditing && activeTab === "details" && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 border-zinc-300 text-zinc-700">
                    <Edit2 className="w-3.5 h-3.5" /> Editar Orden
                  </Button>
                )}
              </div>
            </div>

            {/* --- SELECTOR DE PESTAÑAS --- */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-zinc-200">
              <Button 
                variant={activeTab === "details" ? "default" : "outline"} 
                size="sm"
                className={activeTab === "details" ? "bg-zinc-900 hover:bg-zinc-800 text-white" : "border-zinc-300 text-zinc-600"}
                onClick={() => setActiveTab("details")}
              >
                <FileText className="w-4 h-4 mr-2" /> Detalles de Orden
              </Button>
              <Button 
                variant={activeTab === "logs" ? "default" : "outline"}
                size="sm"
                className={activeTab === "logs" ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-zinc-300 text-zinc-600"}
                onClick={() => setActiveTab("logs")}
              >
                <History className="w-4 h-4 mr-2" /> Historial / Bitácora
              </Button>
            </div>
          </DialogHeader>

          <div className="p-6">
            {/* ========================================= */}
            {/* PESTAÑA 1: DETALLES DE LA ORDEN           */}
            {/* ========================================= */}
            {activeTab === "details" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {order.status === "REQUIERE_APROBACION" && (
                  <div className="bg-red-50/50 border border-red-200 rounded-xl p-5 shadow-sm animate-in fade-in">
                    <div className="flex gap-4">
                      <div className="bg-red-100 p-3 rounded-full shrink-0 h-fit">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="w-full">
                        <h3 className="text-lg font-bold text-red-900 mb-1">Esperando Aprobación del Cliente</h3>
                        <p className="text-red-700 text-sm mb-4">La reparación está pausada hasta que el cliente autorice el siguiente presupuesto extra:</p>

                        <div className="bg-white border border-red-100 rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="sm:col-span-1 border-r border-zinc-100">
                            <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Costo Extra</p>
                            <p className="text-xl font-black text-zinc-900">${order.extraCost} MXN</p>
                          </div>
                          <div className="sm:col-span-3">
                            <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Motivo / Diagnóstico</p>
                            <p className="text-sm font-medium text-zinc-800">{order.extraWorkReason}</p>
                          </div>
                        </div>

                        {order.approvalToken && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm gap-2" onClick={() => window.open(generateWhatsAppLink(), '_blank')}>
                              <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                            </Button>
                            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 gap-2" onClick={() => copyToClipboard(`https://emediusgw.com/aprobacion/${order.approvalToken}`)}>
                              <LinkIcon className="w-4 h-4" /> Copiar Enlace
                            </Button>
                          </div>
                        )}
                        {!order.approvalToken && (
                          <p className="text-xs text-red-500 mt-2 italic">*El token aún no se ha generado desde el servidor. Recarga la página.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {order.status === "APROBADO_POR_CLIENTE" && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div className="bg-emerald-100 p-2.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-900">Presupuesto Extra Aprobado</h3>
                      <p className="text-emerald-700 text-sm mt-1">El cliente aceptó el cargo de <strong>${order.extraCost} MXN</strong> y firmó los términos de servicio electrónicamente.</p>
                      <p className="text-emerald-600/70 text-xs mt-2 font-medium">Puedes cambiar el estatus a &quot;En Proceso&quot; editando la orden.</p>
                    </div>
                  </div>
                )}

                {showApprovalForm && order.status !== "REQUIERE_APROBACION" && (
                  <div className="bg-white border-2 border-red-100 rounded-xl p-6 shadow-md animate-in slide-in-from-top-4">
                    <h4 className="font-bold text-lg text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
                      <AlertCircle className="w-5 h-5 text-red-500" /> Nuevo Presupuesto Adicional
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 space-y-2">
                        <Label>Costo Adicional (MXN)</Label>
                        <div className="relative">
                          <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                          <Input 
                            type="number" 
                            className="pl-9 bg-zinc-50" 
                            placeholder="0.00" 
                            value={approvalData.cost}
                            onChange={(e) => setApprovalData({...approvalData, cost: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Explicación para el Cliente</Label>
                        <Textarea 
                          className="bg-zinc-50 resize-none min-h-[100px]" 
                          placeholder="Explica detalladamente por qué se necesita este dinero extra (Ej. Al desarmar la pastilla del puente, detectamos que...)" 
                          value={approvalData.reason}
                          onChange={(e) => setApprovalData({...approvalData, reason: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowApprovalForm(false)}>Cancelar</Button>
                      <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={isRequestingApproval} onClick={handleRequestApproval}>
                        {isRequestingApproval ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <LinkIcon className="w-4 h-4 mr-2" />}
                        Pausar Orden y Generar Link
                      </Button>
                    </div>
                  </div>
                )}

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
            )}

            {/* ========================================= */}
            {/* PESTAÑA 2: EXPEDIENTE / BITÁCORA            */}
            {/* ========================================= */}
            {activeTab === "logs" && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* FORMULARIO PARA NUEVA NOTA */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4 shadow-sm">
                  
                  {/* Encabezado y Clasificación en la misma línea */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                    <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Añadir Nota al Expediente</h3>
                    <div className="flex items-center gap-3">
                      <Label className="text-xs text-zinc-500 font-semibold whitespace-nowrap">Clasificación:</Label>
                      <Input 
                        placeholder="Ej. Espera" 
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="bg-white h-8 text-sm w-full sm:w-40 border-zinc-300 focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>
                  
                  {/* Textarea a todo el ancho */}
                  <div>
                    <Textarea 
                      placeholder="Escribe los detalles, piezas faltantes o motivos de pausa aquí..." 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px] bg-white border-zinc-300 focus-visible:ring-amber-500 resize-none text-sm leading-relaxed"
                    />
                  </div>
                  
                  {/* Botón alineado a la derecha */}
                  <div className="flex justify-end pt-1">
                    <Button onClick={handleAddLog} disabled={isSubmittingLog || !newNote.trim()} className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all">
                      {isSubmittingLog ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Guardar en Historial
                    </Button>
                  </div>
                </div>

                {/* TIMELINE DE HISTORIAL */}
                <div className="px-2 mt-4">
                  <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" /> Línea de Tiempo del Instrumento
                  </h3>
                  
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-12 text-amber-600">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                      Aún no hay registros en la bitácora de este instrumento.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-zinc-200 ml-3 space-y-8 pb-4">
                      {logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          
                          {/* El Punto de la Línea de Tiempo */}
                          <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-amber-500 ring-4 ring-white" />
                          
                          <div className="flex flex-col gap-1.5 bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-900">{log.author}</span>
                                <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 font-medium border border-zinc-200">
                                  {log.type}
                                </Badge>
                              </div>
                              <span className="text-xs text-zinc-500 font-medium bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                                {formatLogDate(log.entryDate)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-zinc-700 mt-2 whitespace-pre-wrap leading-relaxed">
                              {log.note}
                            </p>

                            {log.serviceOrderId && log.serviceOrderId !== order.id && (
                              <div className="mt-3 pt-3 border-t border-zinc-100">
                                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
                                  Nota de visita anterior (Orden #{log.serviceOrderId.split('-')[0]})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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