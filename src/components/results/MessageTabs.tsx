import { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";

interface MessageTabsProps {
  professional: string;
  friendly: string;
  aggressive: string;
}

const tabs = [
  { key: "professional" as const, label: "Professional", hint: "Formal tone builds credibility with decision-makers." },
  { key: "friendly" as const, label: "Friendly", hint: "Casual tone increases reply rates by 23% on average." },
  { key: "aggressive" as const, label: "Aggressive", hint: "Urgency-driven copy creates immediate action." },
];

export function MessageTabs({ professional, friendly, aggressive }: MessageTabsProps) {
  const [active, setActive] = useState<"professional" | "friendly" | "aggressive">("professional");
  const [copied, setCopied] = useState(false);

  const messages = { professional, friendly, aggressive };
  const currentTab = tabs.find((t) => t.key === active)!;

  const copy = () => {
    navigator.clipboard.writeText(messages[active]);
    setCopied(true);
    toast.success("Message copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-muted/20">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
              active === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="p-3">
        <p className="mb-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground line-clamp-5">
          {messages[active]}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <Info className="h-3 w-3" /> {currentTab.hint}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
