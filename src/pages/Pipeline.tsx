import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload, RefreshCw, Search, Plus,
  Mail, MailX, MessageSquare, Phone, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Globe, Zap, MoreHorizontal, DollarSign, TrendingUp, Clock, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchPipeline, upsertPipelineEntry, updatePipelineStatus, PipelineWithLead } from "@/lib/pipeline-api";
import { fetchLeads } from "@/lib/lead-api";
import { supabase } from "@/integrations/supabase/client";
import { enrichLead } from "@/lib/enrich-lead";
import { detectServiceTrack } from "@/lib/service-tracks";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
  { key: "not_contacted", label: "Not Contacted", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/30" },
  { key: "email_sent", label: "Email Sent", icon: Mail, color: "text-primary", bg: "bg-primary/10" },
  { key: "replied", label: "Replied", icon: MessageSquare, color: "text-warning", bg: "bg-warning/10" },
  { key: "call_booked", label: "Call Booked", icon: Phone, color: "text-[hsl(var(--glow-violet))]", bg: "bg-[hsl(var(--glow-violet))]/10" },
  { key: "closed", label: "Closed", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  { key: "no_response", label: "No Response", icon: MailX, color: "text-orange-400", bg: "bg-orange-400/10" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
] as const;

function hashValue(s: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return min + (Math.abs(h) % (max - min + 1));
}

function computePriority(lead: PipelineWithLead["lead"], enriched: ReturnType<typeof enrichLead>): number {
  let score = 0;
  if (lead.email) score += 100;
  score += enriched.confidence_score;
  const intentOrder: Record<string, number> = {
    "🔥 Actively Hiring": 50, "📈 Funding Received": 40,
    "👀 Visited Pricing Page": 30, "📉 Declining Traffic": 20, "🛠 Tech Stack Change": 10,
  };
  score += intentOrder[enriched.intent_signal] || 0;
  const urgencyOrder: Record<string, number> = { high: 30, medium: 20, low: 10 };
  score += urgencyOrder[enriched.urgency] || 0;
  return 1000 - score;
}

function PipelineAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
      style={{ background: `hsl(${hue}, 50%, 40%)` }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.key === status) || STATUS_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${opt.color} ${opt.bg}`}>
      <Icon className="h-3 w-3" />
      {opt.label}
    </span>
  );
}

export default function Pipeline() {
  const [entries, setEntries] = useState<PipelineWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { setEntries(await fetchPipeline()); }
    catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const syncLeadsToPipeline = async () => {
    try {
      const leads = await fetchLeads();
      const existing = entries.map((e) => e.lead_id);
      const newLeads = leads.filter((l) => !existing.includes(l.id));
      for (const lead of newLeads) {
        const enriched = enrichLead(lead);
        const track = detectServiceTrack(lead.industry, lead.growth_opportunity);
        await upsertPipelineEntry(lead.id, {
          pipeline_status: "not_contacted", service_track: track,
          priority_rank: computePriority(lead, enriched),
        });
      }
      if (newLeads.length > 0) { toast.success(`${newLeads.length} new leads added`); await load(); }
      else toast.info("All leads already in pipeline");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length < 2) { toast.error("CSV file is empty"); return; }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      return obj;
    });
    let added = 0;
    for (const row of rows) {
      const businessName = row["business_name"] || row["business name"] || row["name"] || "";
      const industry = row["industry"] || row["niche"] || "";
      const city = row["city"] || row["location"] || "";
      if (!businessName || !industry || !city) continue;
      const { data: existing } = await supabase.from("leads").select("id").eq("business_name", businessName).limit(1);
      if (existing && existing.length > 0) continue;
      const { data: newLead, error } = await supabase.from("leads").insert({
        business_name: businessName, industry, city,
        website: row["website"] || null, email: row["email"] || null,
        phone: row["phone"] || null, instagram_url: row["instagram"] || row["instagram_url"] || null,
        google_rating: row["rating"] ? parseFloat(row["rating"]) : null,
        website_problem: row["website_problem"] || row["problem"] || null,
        growth_opportunity: row["growth_opportunity"] || row["opportunity"] || null,
        recommended_service: row["recommended_service"] || row["service"] || null,
        outreach_message: row["outreach_message"] || row["message"] || null,
      }).select("id").single();
      if (!error && newLead) {
        const track = detectServiceTrack(industry, row["growth_opportunity"] || row["opportunity"]);
        await upsertPipelineEntry(newLead.id, { pipeline_status: "not_contacted", service_track: track });
        added++;
      }
    }
    toast.success(`${added} leads imported from CSV`);
    await load();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleStatusChange = async (entryId: string, newStatus: string) => {
    try {
      await updatePipelineStatus(entryId, newStatus);
      setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, pipeline_status: newStatus } : e)));
      toast.success("Status updated");
    } catch (err: any) { toast.error(err.message); }
  };

  const filtered = entries.filter((e) => {
    if (filterStatus !== "all" && e.pipeline_status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.lead.business_name.toLowerCase().includes(q) || e.lead.industry.toLowerCase().includes(q) || e.lead.city.toLowerCase().includes(q);
  });

  // Stats
  const closedCount = entries.filter(e => e.pipeline_status === "closed").length;
  const activeCount = entries.filter(e => !["closed", "rejected", "no_response"].includes(e.pipeline_status)).length;
  const repliedCount = entries.filter(e => ["replied", "call_booked"].includes(e.pipeline_status)).length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Pipeline CRM
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{entries.length} clients tracked</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-44 pl-9 glass-input"
            />
          </div>
          <Button size="sm" onClick={syncLeadsToPipeline} className="gap-1.5 bg-primary hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Leads
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="glass border-[rgba(255,255,255,0.08)] h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem onClick={syncLeadsToPipeline} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Sync Leads
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileRef.current?.click()} className="gap-2">
                <Upload className="h-3.5 w-3.5" /> Import CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={load} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-foreground">{activeCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
          </div>
        </div>
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-warning">{repliedCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Engaged</p>
          </div>
        </div>
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-success">{closedCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Closed</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
            filterStatus === "all" ? "bg-primary text-primary-foreground" : "bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({entries.length})
        </button>
        {STATUS_OPTIONS.map(s => {
          const count = entries.filter(e => e.pipeline_status === s.key).length;
          if (count === 0) return null;
          return (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                filterStatus === s.key ? "bg-primary text-primary-foreground" : "bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Upgrade prompt */}
      <Link to="/upgrade">
        <div className="mb-4 glass-card p-2.5 border-primary/15 hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">
              <span className="text-primary font-medium">Upgrade to automate follow-ups</span> — Pro users close 3× more deals
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </Link>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[rgba(255,255,255,0.04)] animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)", backgroundSize: "200% 100%" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">No clients in pipeline</h3>
          <p className="text-sm text-muted-foreground mb-4">Run a search and your leads will appear here.</p>
          <Link to="/search">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4" /> Find Clients
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, i) => {
            const enriched = enrichLead(entry.lead as any);
            const successProb = hashValue(entry.lead_id + "prob", 15, 85);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link to={`/pipeline/${entry.lead_id}`}>
                  <div className="glass-card rounded-xl p-4 hover:border-[rgba(255,255,255,0.15)] transition-all duration-200 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      {/* Avatar + Name */}
                      <PipelineAvatar name={entry.lead.business_name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-medium text-sm truncate">{entry.lead.business_name}</h3>
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            enriched.confidence_score >= 75 ? "bg-success/15 text-success" :
                            enriched.confidence_score >= 50 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                          }`}>
                            {enriched.confidence_score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {entry.lead.industry} · {entry.lead.city}
                          {entry.lead.email && <span className="ml-2 text-success">✉ Has email</span>}
                        </p>
                      </div>

                      {/* Win probability */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0 w-24">
                        <div className="flex-1">
                          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${successProb}%`,
                                background: successProb >= 50 ? "hsl(var(--success))" : "hsl(var(--warning))",
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color: successProb >= 50 ? "hsl(var(--success))" : "hsl(var(--warning))" }}>
                          {successProb}%
                        </span>
                      </div>

                      {/* Status */}
                      <div className="shrink-0" onClick={(e) => e.preventDefault()}>
                        <select
                          value={entry.pipeline_status}
                          onChange={(e) => { e.stopPropagation(); handleStatusChange(entry.id, e.target.value); }}
                          className="rounded-lg bg-[rgba(255,255,255,0.06)] px-2 py-1.5 text-[11px] font-medium border border-[rgba(255,255,255,0.08)] outline-none text-foreground backdrop-blur-sm cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
