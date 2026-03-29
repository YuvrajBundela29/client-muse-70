import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload, RefreshCw, Search, Plus,
  Mail, MailX, MessageSquare, Phone, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Globe, Zap, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

const STATUS_COLUMNS = [
  { key: "not_contacted", label: "Not Contacted", icon: AlertCircle, accent: "#8892B0" },
  { key: "email_sent", label: "Email Sent", icon: Mail, accent: "#5B5FEF" },
  { key: "replied", label: "Replied", icon: MessageSquare, accent: "#F59E0B" },
  { key: "call_booked", label: "Call Booked", icon: Phone, accent: "#A78BFA" },
  { key: "closed", label: "Closed", icon: CheckCircle2, accent: "#00E5C3" },
  { key: "no_response", label: "No Response", icon: MailX, accent: "#F97316" },
  { key: "rejected", label: "Rejected", icon: XCircle, accent: "#EF4444" },
] as const;

const STATUS_EMOJI: Record<string, string> = {
  not_contacted: "🔵", email_sent: "📤", replied: "💬",
  call_booked: "📞", closed: "✅", no_response: "❌", rejected: "🚫",
};

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

export default function Pipeline() {
  const [entries, setEntries] = useState<PipelineWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.lead.business_name.toLowerCase().includes(q) || e.lead.industry.toLowerCase().includes(q) || e.lead.city.toLowerCase().includes(q);
  });

  const getColumn = (status: string) => filtered.filter((e) => e.pipeline_status === status);

  return (
    <div className="p-6 lg:p-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Pipeline Manager
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{entries.length} clients in pipeline</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pipeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 pl-9 glass-input"
            />
          </div>
          <Button size="sm" onClick={syncLeadsToPipeline} className="gap-1.5 bg-primary hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Client
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-[rgba(255,255,255,0.04)] animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)", backgroundSize: "200% 100%" }} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const items = getColumn(col.key);
            return (
              <div key={col.key} className="min-w-[280px] max-w-[300px] flex-shrink-0">
                <div className="mb-3 flex items-center justify-between px-1 pb-3 border-b border-[rgba(255,255,255,0.08)]" style={{ borderTopColor: col.accent }}>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: col.accent }} />
                    <span className="section-label">{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono bg-[rgba(255,255,255,0.06)]">{items.length}</Badge>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {items.map((entry, i) => {
                    const enriched = enrichLead(entry.lead as any);
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 30 } }}
                      >
                        <Link to={`/pipeline/${entry.lead_id}`}>
                          <div className="glass-card p-4 rounded-xl cursor-pointer group hover:border-[rgba(255,255,255,0.15)] transition-all duration-200">
                            <div className="mb-2 flex items-start justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <PipelineAvatar name={entry.lead.business_name} />
                                <div className="min-w-0">
                                  <h3 className="font-medium text-sm leading-tight truncate">{entry.lead.business_name}</h3>
                                  {entry.lead.website && (
                                    <p className="text-[10px] text-success truncate font-mono">{entry.lead.website}</p>
                                  )}
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                                enriched.confidence_score >= 75 ? "bg-success/15 text-success" :
                                enriched.confidence_score >= 50 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                              }`}>
                                {enriched.confidence_score}%
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-2 font-mono truncate">
                              {entry.lead.industry} · {entry.lead.city}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {entry.lead.email && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-success/20 text-success bg-success/5">
                                  <Mail className="h-2.5 w-2.5 mr-0.5" /> Email
                                </Badge>
                              )}
                              {entry.lead.website && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 text-primary bg-primary/5">
                                  <Globe className="h-2.5 w-2.5 mr-0.5" /> Web
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <select
                                value={entry.pipeline_status}
                                onClick={(e) => e.preventDefault()}
                                onChange={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange(entry.id, e.target.value); }}
                                className="rounded-lg bg-[rgba(255,255,255,0.06)] px-2 py-1 text-[10px] font-medium border border-[rgba(255,255,255,0.08)] outline-none text-foreground backdrop-blur-sm"
                              >
                                {STATUS_COLUMNS.map((s) => (
                                  <option key={s.key} value={s.key}>{STATUS_EMOJI[s.key]} {s.label}</option>
                                ))}
                              </select>
                              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                View Details <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.08)] p-6 text-center">
                      <p className="text-xs text-muted-foreground">No clients</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
