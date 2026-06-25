"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, CheckCircle2, Music, User, Wrench, XCircle, FileSignature } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

export default function CustomerApprovalPage() {
  const params = useParams();
  const token = params.token as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      loadApprovalData();
    }
  }, [token]);

  const loadApprovalData = async () => {
    setIsLoading(true);
    try {
      // Usamos fetch nativo para que no busque tokens JWT
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/orders/approval/${token}`, {
        headers: {
          "Accept": "application/json",
          "x-tenant-id": "emelius_gw" // El identificador de tu taller
        }
      });
      if (!res.ok) throw new Error("Enlace inválido");
      const data = await res.json();
      
      setOrder(data);
      if (data.status === "APROBADO_POR_CLIENTE") {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError("No se pudo cargar la información o el enlace ha expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!termsAccepted) return;
    setIsSubmitting(true);

    try {
      const approvalPayload = {
        approved: true,
        token,
        orderId: order?.id ?? null,
        customerName: order?.customerName ?? "",
        extraWorkReason: extraWorkReasonText,
        extraCost: order?.extraCost ?? null,
        instrumentBrand: order?.instrumentBrand ?? "",
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/orders/approval/${token}/accept`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "x-tenant-id": "emelius_gw"
        },
        body: JSON.stringify(approvalPayload),
      });

      if (!res.ok) {
        let detail = "Error al aprobar";
        try {
          const errorBody = await res.text();
          if (errorBody) {
            detail = errorBody;
          }
        } catch {
          // ignore
        }
        throw new Error(`${detail}`);
      }
      
      setIsSuccess(true);
      setOrder({ ...order, status: "APROBADO_POR_CLIENTE" });
    } catch (err: any) {
      console.error("Error al aprobar presupuesto", err);
      alert("Hubo un error al procesar tu aprobación. Intenta de nuevo." + (err?.message ? `: ${err.message}` : ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    // Aquí puedes redirigir a un WhatsApp de soporte o abrir un mail
    window.location.href = "https://wa.me/524775948211?text=Hola,%20tengo%20dudas%20sobre%20el%20presupuesto%20extra%20de%20mi%20instrumento.";
  };

  const extraWorkReasonText = order?.extraWorkReason != null
    ? String(order.extraWorkReason)
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
        <p className="text-zinc-500 font-medium animate-pulse">Cargando detalles de tu instrumento...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-red-100 shadow-lg">
          <CardContent className="pt-10 pb-8 flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Enlace Inválido</h2>
            <p className="text-zinc-600 mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Ir al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VISTA DE ÉXITO (Ya aprobado) ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-emerald-100 shadow-xl overflow-hidden">
          <div className="bg-emerald-500 py-6 flex justify-center">
            <div className="bg-white p-3 rounded-full shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <CardContent className="pt-8 pb-8 px-6">
            <h2 className="text-2xl font-black text-zinc-900 mb-2">¡Presupuesto Aprobado!</h2>
            <p className="text-zinc-600 mb-6 leading-relaxed">
              Gracias, <strong>{order.customerName}</strong>. Hemos recibido tu autorización. Nuestro luthier continuará trabajando en tu <strong>{order.instrumentBrand}</strong> de inmediato.
            </p>
            <div className="bg-zinc-50 rounded-lg p-4 text-left border border-zinc-100">
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Folio de Orden</p>
              <p className="font-mono font-bold text-zinc-800">#{order.id.split('-')[0].toUpperCase()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VISTA DE SOLICITUD DE APROBACIÓN ---
  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4 sm:py-12">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-900">Emedius' Guitar Workshop</h1>
          <p className="text-zinc-500 font-medium mt-1">Autorización de Presupuesto Adicional</p>
        </div>

        <Card className="border-t-4 border-t-amber-500 shadow-xl overflow-hidden">
          <CardHeader className="bg-white border-b border-zinc-100 pb-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-zinc-900 leading-tight mb-1">Se requiere tu visto bueno</CardTitle>
                <CardDescription className="text-base text-zinc-600">
                  Hola <strong>{order.customerName}</strong>, durante el servicio de tu instrumento detectamos un detalle que requiere tu autorización para continuar.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Detalles del Diagnóstico (Lo más importante para el cliente) */}
            <div className="bg-amber-50/50 p-6 border-b border-amber-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Diagnóstico del Luthier
              </h3>
              <p className="text-zinc-800 whitespace-pre-wrap leading-relaxed font-medium bg-white p-4 rounded-lg border border-amber-200/60 shadow-sm">
                {extraWorkReasonText || "No se proporcionó un detalle adicional."}
              </p>
              
              <div className="mt-6 flex items-end justify-between bg-white p-4 rounded-lg border border-amber-200/60 shadow-sm">
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Costo Adicional</p>
                  <p className="text-3xl font-black text-zinc-900">${order.extraCost} <span className="text-base font-medium text-zinc-500">MXN</span></p>
                </div>
              </div>
            </div>

            {/* Resumen del Instrumento */}
            <div className="p-6 bg-white">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Resumen de tu Orden</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-3 rounded-md border border-zinc-100">
                  <p className="text-xs text-zinc-500 uppercase font-semibold flex items-center gap-1.5 mb-1"><Music className="w-3.5 h-3.5"/> Instrumento</p>
                  <p className="font-semibold text-zinc-800">{order.instrumentBrand} {order.instrumentModel}</p>
                </div>
                <div className="bg-zinc-50 p-3 rounded-md border border-zinc-100">
                  <p className="text-xs text-zinc-500 uppercase font-semibold flex items-center gap-1.5 mb-1"><Wrench className="w-3.5 h-3.5"/> Servicio Original</p>
                  <p className="font-semibold text-zinc-800">{order.serviceType}</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col bg-zinc-50 p-6 border-t border-zinc-200">
            {/* Casilla de firma electrónica */}
            <div className="flex items-start space-x-3 mb-6 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm w-full">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm font-medium leading-tight text-zinc-700 cursor-pointer">
                  Acepto el diagnóstico y el cargo adicional por ${order.extraCost} MXN.
                </label>
                <p className="text-xs text-zinc-500">
                  Esta acción equivale a una firma electrónica de conformidad.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                className="w-full sm:w-1/3 bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300"
                onClick={handleDecline}
              >
                Tengo Dudas
              </Button>
              <Button 
                className="w-full sm:w-2/3 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!termsAccepted || isSubmitting}
                onClick={handleApprove}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}
                Autorizar Reparación
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-zinc-400 mt-8">
          Protegido por Emedius' Guitar Workshop System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}