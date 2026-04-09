import { Globe, Mail, Phone, MessageCircle } from "lucide-react";
import { EnrichedLead } from "@/types/lead";

interface ContactStatsProps {
  leads: EnrichedLead[];
  onFilter: (type: "all" | "website" | "email" | "phone" | "whatsapp") => void;
  activeFilter: string;
}

export function ContactStats({ leads, onFilter, activeFilter }: ContactStatsProps) {
  const withWebsite = leads.filter((l) => l.website).length;
  const withEmail = leads.filter((l) => l.email).length;
  const withPhone = leads.filter((l) => l.phone).length;
  const withWhatsApp = leads.filter((l) => l.phone).length; // WhatsApp = has phone

  const stats = [
    { key: "all" as const, icon: null, label: "All", count: leads.length, color: "text-foreground" },
    { key: "website" as const, icon: Globe, label: "Website", count: withWebsite, color: "text-blue-400" },
    { key: "email" as const, icon: Mail, label: "Email", count: withEmail, color: "text-primary" },
    { key: "phone" as const, icon: Phone, label: "Phone", count: withPhone, color: "text-emerald-400" },
    { key: "whatsapp" as const, icon: MessageCircle, label: "WhatsApp", count: withWhatsApp, color: "text-[#25D366]" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {stats.map((s) => (
        <button
          key={s.key}
          onClick={() => onFilter(s.key)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
            activeFilter === s.key
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
          }`}
        >
          {s.icon && <s.icon className={`h-3.5 w-3.5 ${activeFilter === s.key ? "text-primary" : s.color}`} />}
          {s.label}
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            activeFilter === s.key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {s.count}
          </span>
        </button>
      ))}
    </div>
  );
}
