import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crosshair, Download, RefreshCw, ArrowLeft, Search as SearchIcon,
  SlidersHorizontal, Clock, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchLeads } from "@/lib/lead-api";
import { Lead, EnrichedLead } from "@/types/lead";
import { enrichLead } from "@/lib/enrich-lead";
import { LeadIntelCard } from "@/components/results/LeadIntelCard";
import { LeadSkeleton } from "@/components/results/LeadSkeleton";
import { toast } from "sonner";
import { useSessionStore } from "@/lib/session-store";

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
  a.href = url;
  a.download = "client-muse-intelligence-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("match");
  const { lastSearch } = useSessionStore();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      // Filter by last search params so only relevant leads show
      const filtered = lastSearch
        ? data.filter((l) => {
            const matchIndustry = l.industry.toLowerCase().includes(lastSearch.industry.toLowerCase());
            const matchCity = l.city.toLowerCase().includes(lastSearch.location.toLowerCase());
            return matchIndustry || matchCity;
          })
        : data;
      setLeads(filtered.map(enrichLead));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>Client Muse</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/search">
              <Button size="sm" variant="outline" className="gap-1.5">
                <SearchIcon className="h-3.5 w-3.5" /> New Search
              </Button>
            </Link>
            <Link to="/pipeline">
              <Button size="sm" variant="ghost" className="gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Pipeline
              </Button>
            </Link>
            <Link to="/history">
              <Button size="sm" variant="ghost" className="gap-1.5">
                <Clock className="h-3.5 w-3.5" /> History
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/search" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to search
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Intelligence Report</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "lead" : "leads"} analyzed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 bg-card pl-9 border-border"
              />
            </div>
            {/* Sort */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
              {(["match", "urgency", "recent"] as SortKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    sort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "match" ? "Best Match" : s === "urgency" ? "Urgency" : "Recent"}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button size="sm" onClick={() => exportAllCSV(filtered)} className="gap-1.5" disabled={filtered.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export All CSV
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <LeadSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-bold">No matches found</h2>
            <p className="mb-6 text-muted-foreground">Try adjusting your filters or run a new search to discover leads.</p>
            <Link to="/search">
              <Button className="gap-2">
                <SearchIcon className="h-4 w-4" /> Start Searching
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((lead, i) => (
              <LeadIntelCard key={lead.id} lead={lead} index={i} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
