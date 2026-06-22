import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  // El número de Emedius y un mensaje prellenado amigable
  const phoneNumber = "524775615105"; // Reemplázalo con el código de país + número
  const message = "¡Hola! Vengo de la página web, me gustaría cotizar un mantenimiento para mi instrumento.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20b858] hover:scale-110 transition-all duration-300"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      {/* Círculo de notificación (puntito rojo/verde para llamar la atención) */}
      <span className="absolute top-0 right-0 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-100"></span>
      </span>
    </a>
  );
}