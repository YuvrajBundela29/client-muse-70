import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crosshair, Upload, Download, RefreshCw, Search, Clock, Plus,
  Mail, MailX, MessageSquare, Phone, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Star, Globe, Zap,
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

const STATUS_COLUMNS = [
  { key: "not_contacted", label: "Not Contacted", icon: AlertCircle, color: "text-blue-400" },
  { key: "email_sent", label: "Email Sent", icon: Mail, color: "text-yellow-400" },
  { key: "replied", label: "Replied", icon: MessageSquare, color: "text-emerald-400" },
  { key: "call_booked", label: "Call Booked", icon: Phone, color: "text-purple-400" },
  { key: "closed", label: "Closed", icon: CheckCircle2, color: "text-green-400" },
  { key: "no_response", label: "No Response", icon: MailX, color: "text-orange-400" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
] as const;

const STATUS_EMOJI: Record<string, string> = {
  not_contacted: "🔵",
  email_sent: "📤",
  replied: "💬",
  call_booked: "📞",
  closed: "✅",
  no_response: "❌",
  rejected: "🚫",
};

function computePriority(lead: PipelineWithLead["lead"], enriched: ReturnType<typeof enrichLead>): number {
  let score = 0;
  if (lead.email) score += 100;
  score += enriched.confidence_score;
  const intentOrder: Record<string, number> = {
    "🔥 Actively Hiring": 50,
    "📈 Funding Received": 40,
    "👀 Visited Pricing Page": 30,
    "📉 Declining Traffic": 20,
    "🛠 Tech Stack Change": 10,
  };
  score += intentOrder[enriched.intent_signal] || 0;
  const urgencyOrder: Record<string, number> = { high: 30, medium: 20, low: 10 };
  score += urgencyOrder[enriched.urgency] || 0;
  return 1000 - score; // lower = higher priority
}

export default function Pipeline() {
  const [entries, setEntries] = useState<PipelineWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPipeline();
      setEntries(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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
          pipeline_status: "not_contacted",
          service_track: track,
          priority_rank: computePriority(lead, enriched),
        });
      }
      if (newLeads.length > 0) {
        toast.success(`${newLeads.length} new leads added to pipeline`);
        await load();
      } else {
        toast.info("All leads already in pipeline");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
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

      // Check duplicate
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("business_name", businessName)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { data: newLead, error } = await supabase
        .from("leads")
        .insert({
          business_name: businessName,
          industry,
          city,
          website: row["website"] || null,
          email: row["email"] || null,
          phone: row["phone"] || null,
          instagram_url: row["instagram"] || row["instagram_url"] || null,
          google_rating: row["rating"] ? parseFloat(row["rating"]) : null,
          website_problem: row["website_problem"] || row["problem"] || null,
          growth_opportunity: row["growth_opportunity"] || row["opportunity"] || null,
          recommended_service: row["recommended_service"] || row["service"] || null,
          outreach_message: row["outreach_message"] || row["message"] || null,
        })
        .select("id")
        .single();

      if (!error && newLead) {
        const track = detectServiceTrack(industry, row["growth_opportunity"] || row["opportunity"]);
        await upsertPipelineEntry(newLead.id, {
          pipeline_status: "not_contacted",
          service_track: track,
        });
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
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, pipeline_status: newStatus } : e))
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = entries.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.lead.business_name.toLowerCase().includes(q) ||
      e.lead.industry.toLowerCase().includes(q) ||
      e.lead.city.toLowerCase().includes(q)
    );
  });

  const getColumn = (status: string) => filtered.filter((e) => e.pipeline_status === status);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>Client Muse</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/search"><Button size="sm" variant="ghost" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Search</Button></Link>
            <Link to="/results"><Button size="sm" variant="ghost" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Results</Button></Link>
            <Link to="/reel-library"><Button size="sm" variant="ghost" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Reels</Button></Link>
            <Link to="/history"><Button size="sm" variant="ghost" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> History</Button></Link>
          </nav>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipeline Manager</h1>
            <p className="text-sm text-muted-foreground">{entries.length} clients in pipeline</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pipeline..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 bg-card pl-9 border-border"
              />
            </div>
            <Button size="sm" variant="outline" onClick={syncLeadsToPipeline} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Sync Leads
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Import CSV
            </Button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-card border border-border" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((col) => {
              const items = getColumn(col.key);
              return (
                <div key={col.key} className="min-w-[280px] flex-shrink-0">
                  <div className="mb-3 flex items-center gap-2">
                    <col.icon className={`h-4 w-4 ${col.color}`} />
                    <span className="text-sm font-semibold">{col.label}</span>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {items.map((entry) => {
                      const enriched = enrichLead(entry.lead as any);
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Link to={`/pipeline/${entry.lead_id}`}>
                            <Card className="cursor-pointer border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg">
                              <CardContent className="p-4">
                                <div className="mb-2 flex items-start justify-between">
                                  <h3 className="font-semibold text-sm leading-tight">{entry.lead.business_name}</h3>
                                  <span className={`text-xs font-bold ${
                                    enriched.confidence_score >= 75 ? "text-green-400" :
                                    enriched.confidence_score >= 50 ? "text-yellow-400" : "text-red-400"
                                  }`}>
                                    {enriched.confidence_score}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {entry.lead.industry} · {entry.lead.city}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {entry.lead.email && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-400">
                                      <Mail className="h-2.5 w-2.5 mr-0.5" /> Email
                                    </Badge>
                                  )}
                                  {entry.lead.website && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-400">
                                      <Globe className="h-2.5 w-2.5 mr-0.5" /> Web
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                                    enriched.urgency === "high" ? "border-red-500/30 text-red-400" :
                                    enriched.urgency === "medium" ? "border-yellow-500/30 text-yellow-400" :
                                    "border-muted text-muted-foreground"
                                  }`}>
                                    {enriched.urgency}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                  {enriched.intent_signal}
                                </p>
                                {/* Status change dropdown */}
                                <div className="mt-3 flex items-center justify-between">
                                  <select
                                    value={entry.pipeline_status}
                                    onClick={(e) => e.preventDefault()}
                                    onChange={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleStatusChange(entry.id, e.target.value);
                                    }}
                                    className="rounded bg-secondary px-2 py-1 text-[10px] font-medium border-none outline-none text-foreground"
                                  >
                                    {STATUS_COLUMNS.map((s) => (
                                      <option key={s.key} value={s.key}>
                                        {STATUS_EMOJI[s.key]} {s.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center">
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
    </div>
  );
}
