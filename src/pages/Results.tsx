import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crosshair, Download, RefreshCw, Globe, Mail, Phone, Instagram,
  Star, AlertTriangle, TrendingUp, MessageSquare, Copy, Check,
  ArrowLeft, Search as SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchLeads, updateLeadStatusInDb } from "@/lib/lead-api";
import { Lead } from "@/types/lead";
import { toast } from "sonner";

function exportToCSV(leads: Lead[]) {
  const headers = [
    "Business Name", "Industry", "City", "Website", "Email", "Phone",
    "Instagram", "Google Rating", "Website Problem", "Growth Opportunity",
    "Recommended Service", "Outreach Message", "Status",
  ];
  const rows = leads.map((l) => [
    l.business_name, l.industry, l.city, l.website || "", l.email || "",
    l.phone || "", l.instagram_url || "", l.google_rating?.toString() || "",
    l.website_problem || "", l.growth_opportunity || "",
    l.recommended_service || "", l.outreach_message?.replace(/"/g, '""') || "",
    l.status,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "client-muse-leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function LeadCard({ lead, onStatusChange }: { lead: Lead; onStatusChange: (id: string, status: Lead["status"]) => void }) {
  const [copiedMsg, setCopiedMsg] = useState(false);

  const copyOutreach = () => {
    if (lead.outreach_message) {
      navigator.clipboard.writeText(lead.outreach_message);
      setCopiedMsg(true);
      toast.success("Outreach message copied!");
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  const statusColors: Record<string, string> = {
    new: "bg-primary/10 text-primary border-primary/30",
    contacted: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
    replied: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-primary/40"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{lead.business_name}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{lead.industry}</span>
            <span>·</span>
            <span>{lead.city}</span>
            {lead.google_rating && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                  {lead.google_rating}
                </span>
              </>
            )}
          </div>
        </div>
        <select
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value as Lead["status"])}
          className={`rounded-full border px-3 py-1 text-xs font-medium outline-none ${statusColors[lead.status] || ""}`}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* AI Insights */}
      {lead.website_problem && (
        <div className="mb-3 rounded-lg bg-destructive/5 border border-destructive/20 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> Problem Detected
          </div>
          <p className="text-sm text-muted-foreground">{lead.website_problem}</p>
        </div>
      )}
      {lead.growth_opportunity && (
        <div className="mb-3 rounded-lg bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/20 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--success))]">
            <TrendingUp className="h-3.5 w-3.5" /> Growth Opportunity
          </div>
          <p className="text-sm text-muted-foreground">{lead.growth_opportunity}</p>
        </div>
      )}
      {lead.recommended_service && (
        <Badge variant="secondary" className="mb-3">
          Recommend: {lead.recommended_service}
        </Badge>
      )}

      {/* Outreach */}
      {lead.outreach_message && (
        <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> AI Outreach Message
            </div>
            <button onClick={copyOutreach} className="flex items-center gap-1 text-xs text-primary hover:underline">
              {copiedMsg ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedMsg ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">{lead.outreach_message}</p>
        </div>
      )}

      {/* Contact links */}
      <div className="flex flex-wrap gap-2">
        {lead.website && (
          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40">
            <Globe className="h-3 w-3" /> Website
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40">
            <Mail className="h-3 w-3" /> {lead.email}
          </a>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40">
            <Phone className="h-3 w-3" /> {lead.phone}
          </a>
        )}
        {lead.instagram_url && (
          <a href={lead.instagram_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40">
            <Instagram className="h-3 w-3" /> Instagram
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function Results() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: Lead["status"]) => {
    try {
      await updateLeadStatusInDb(id, status);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = leads.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.business_name.toLowerCase().includes(q) ||
      l.industry.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q)
    );
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
          <Link to="/search">
            <Button size="sm" variant="outline" className="gap-1.5">
              <SearchIcon className="h-3.5 w-3.5" /> New Search
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/search" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to search
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Your Leads</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "lead" : "leads"} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 bg-card pl-9 border-border"
              />
            </div>
            <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button size="sm" onClick={() => exportToCSV(filtered)} className="gap-1.5" disabled={filtered.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-bold">No leads yet</h2>
            <p className="mb-6 text-muted-foreground">Run a search to discover potential clients.</p>
            <Link to="/search">
              <Button className="gap-2">
                <SearchIcon className="h-4 w-4" /> Start Searching
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
