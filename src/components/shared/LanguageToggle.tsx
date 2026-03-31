import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 transition-colors"
      title={lang === "en" ? "हिंदी में बदलें" : "Switch to English"}
    >
      <Globe className="h-3 w-3" />
      {lang === "en" ? "हिंदी" : "EN"}
    </button>
  );
}
