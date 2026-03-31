import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download, RefreshCw, ArrowLeft, Search as SearchIcon, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead, EnrichedLead } from "@/types/lead";
import { enrichLead } from "@/lib/enrich-lead";
import { LeadIntelCard } from "@/components/results/LeadIntelCard";
import { LeadSkeleton } from "@/components/results/LeadSkeleton";
import { toast } from "sonner";
import { useSessionStore } from "@/lib/session-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type SortKey = "match" | "recent" | "urgency";

function exportAllCSV(leads: EnrichedLead[]) {
  const headers = [
    "Business Name","Industry","City","Website","Email","Phone","Instagram",
    "Rating","Problem","Opportunity","Service","Confidence","Urgency","Intent","Status",
  ];
  const rows = leads.map((l) => [
    l.business_name, l.industry, l.city, l.website || "", l.email || "", l.phone || "",
    l.instagram_url || "", l.google_rating?.toString() || "", l.website_problem || "",
    l.growth_opportunity || "", l.recommended_service || "", l.confidence_score.toString(),
    l.urgency, l.intent_signal, l.status,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "autoclient-intelligence-report.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("match");
  const { lastSearch } = useSessionStore();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      // First try to load results from the most recent search_history entry
      if (user) {
        const { data: historyEntry } = await supabase
          .from("search_history")
          .select("results_json")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (historyEntry?.results_json && Array.isArray(historyEntry.results_json) && historyEntry.results_json.length > 0) {
          const rawLeads = historyEntry.results_json as Lead[];
          setLeads(rawLeads.map(enrichLead));
          setLoading(false);
          return;
        }
      }

      // Fallback: load from leads table filtered by last search
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);

      const allLeads = (data || []) as Lead[];
      const filtered = lastSearch
        ? allLeads.filter((l) => {
            const matchIndustry = l.industry.toLowerCase().includes(lastSearch.industry.toLowerCase());
            const matchCity = l.city.toLowerCase().includes(lastSearch.location.toLowerCase());
            return matchIndustry || matchCity;
          })
        : allLeads;
      setLeads(filtered.map(enrichLead));
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const handleStatusChange = (id: string, status: Lead["status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const filtered = leads
    .filter((l) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return l.business_name.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "match") return b.confidence_score - a.confidence_score;
      if (sort === "urgency") {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.urgency] - order[a.urgency];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/search" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to search
          </Link>
          <h1 className="page-title flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Intelligence Report
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {filtered.length} {filtered.length === 1 ? "lead" : "leads"} analyzed
            {lastSearch && (
              <span className="ml-2 text-primary/70">
                · {lastSearch.industry} in {lastSearch.location}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 pl-9 glass-input"
            />
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] p-0.5">
            {(["match", "urgency", "recent"] as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                  sort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "match" ? "Best Match" : s === "urgency" ? "Urgency" : "Recent"}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={load} className="gap-1.5 glass-input">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => exportAllCSV(filtered)} className="gap-1.5 bg-primary hover:bg-primary/90" disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <LeadSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <SearchIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-medium">No matches found</h2>
          <p className="mb-6 text-sm text-muted-foreground">Try adjusting your filters or run a new search.</p>
          <Link to="/search">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <SearchIcon className="h-4 w-4" /> Start Searching
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid gap-5 md:grid-cols-2"
        >
          {filtered.map((lead, i) => (
            <LeadIntelCard key={lead.id} lead={lead} index={i} onStatusChange={handleStatusChange} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
