import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '923037192621';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export function GlobalWhatsAppButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-sm bg-[#25D366] text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
