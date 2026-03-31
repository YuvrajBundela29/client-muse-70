import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone?: string | null;
  businessName: string;
  message?: string;
  className?: string;
  size?: "sm" | "md";
}

export function WhatsAppButton({ phone, businessName, message, className = "", size = "sm" }: WhatsAppButtonProps) {
  const defaultMessage = message || `Hi! I came across ${businessName} and I'd love to discuss how I can help grow your business. Would you be open to a quick chat?`;
  const encodedMessage = encodeURIComponent(defaultMessage);

  // If phone available, use wa.me with phone. Otherwise use generic WhatsApp share
  const cleanPhone = phone?.replace(/[^0-9+]/g, "").replace(/^\+/, "") || "";
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors ${
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      } ${className}`}
    >
      <MessageCircle className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      WhatsApp
    </a>
  );
}
