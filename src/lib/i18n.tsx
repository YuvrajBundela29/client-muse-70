import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "hi";

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "nav.search": { en: "Search Clients", hi: "क्लाइंट खोजें" },
  "nav.pipeline": { en: "Pipeline CRM", hi: "पाइपलाइन CRM" },
  "nav.history": { en: "Search History", hi: "खोज इतिहास" },
  "nav.analytics": { en: "Analytics", hi: "एनालिटिक्स" },
  "nav.referrals": { en: "Referrals", hi: "रेफरल" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स" },
  "nav.admin": { en: "Admin", hi: "एडमिन" },
  "nav.upgrade": { en: "Upgrade to Pro", hi: "प्रो में अपग्रेड करें" },

  // Common
  "common.search": { en: "Search", hi: "खोजें" },
  "common.export": { en: "Export CSV", hi: "CSV निर्यात करें" },
  "common.refresh": { en: "Refresh", hi: "रिफ्रेश" },
  "common.save": { en: "Save", hi: "सेव करें" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें" },
  "common.delete": { en: "Delete", hi: "हटाएं" },
  "common.loading": { en: "Loading...", hi: "लोड हो रहा है..." },
  "common.noResults": { en: "No results found", hi: "कोई परिणाम नहीं मिला" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", hi: "डैशबोर्ड" },
  "dashboard.credits": { en: "Credits Remaining", hi: "शेष क्रेडिट" },
  "dashboard.searches": { en: "Total Searches", hi: "कुल खोजें" },
  "dashboard.leads": { en: "Leads Found", hi: "लीड मिले" },
  "dashboard.pipeline": { en: "In Pipeline", hi: "पाइपलाइन में" },

  // Search
  "search.title": { en: "Find Your Perfect Clients", hi: "अपने परफेक्ट क्लाइंट खोजें" },
  "search.industry": { en: "Industry", hi: "उद्योग" },
  "search.location": { en: "Location", hi: "स्थान" },
  "search.service": { en: "Your Service", hi: "आपकी सेवा" },
  "search.findClients": { en: "Find Clients", hi: "क्लाइंट खोजें" },

  // Results
  "results.title": { en: "Intelligence Report", hi: "इंटेलिजेंस रिपोर्ट" },
  "results.analyzed": { en: "leads analyzed", hi: "लीड विश्लेषित" },
  "results.bestMatch": { en: "Best Match", hi: "सर्वश्रेष्ठ मैच" },
  "results.urgency": { en: "Urgency", hi: "तत्कालता" },
  "results.recent": { en: "Recent", hi: "हाल का" },
  "results.whatsapp": { en: "WhatsApp", hi: "व्हाट्सएप" },
  "results.markContacted": { en: "Mark Contacted", hi: "संपर्क किया" },
  "results.contacted": { en: "Contacted", hi: "संपर्क हुआ" },
  "results.saveLead": { en: "Save Lead", hi: "लीड सेव करें" },

  // Pipeline
  "pipeline.title": { en: "Pipeline CRM", hi: "पाइपलाइन CRM" },
  "pipeline.active": { en: "Active", hi: "सक्रिय" },
  "pipeline.engaged": { en: "Engaged", hi: "संलग्न" },
  "pipeline.closed": { en: "Closed", hi: "बंद" },
  "pipeline.sharePortal": { en: "Share Portal", hi: "पोर्टल शेयर करें" },

  // Landing
  "landing.hero": { en: "Find Your Next Clients On Autopilot With AI", hi: "AI के साथ ऑटोपायलट पर अपने अगले क्लाइंट खोजें" },
  "landing.startFree": { en: "Start Free — Get 25 Credits", hi: "मुफ्त शुरू करें — 25 क्रेडिट पाएं" },
  "landing.howItWorks": { en: "See How It Works", hi: "कैसे काम करता है देखें" },

  // Settings
  "settings.title": { en: "Settings", hi: "सेटिंग्स" },
  "settings.language": { en: "Language", hi: "भाषा" },
  "settings.account": { en: "Account", hi: "खाता" },

  // Admin
  "admin.title": { en: "Admin Dashboard", hi: "एडमिन डैशबोर्ड" },
  "admin.totalUsers": { en: "Total Users", hi: "कुल उपयोगकर्ता" },
  "admin.revenue": { en: "Revenue (MRR)", hi: "राजस्व (MRR)" },
  "admin.activeUsers": { en: "Active Users", hi: "सक्रिय उपयोगकर्ता" },
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("autoclient_lang");
    return (saved === "hi" ? "hi" : "en") as Lang;
  });

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("autoclient_lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
