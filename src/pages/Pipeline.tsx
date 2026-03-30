import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload, RefreshCw, Search, Plus,
  Mail, MailX, MessageSquare, Phone, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Zap, MoreHorizontal, TrendingUp, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchPipeline, updatePipelineStatus, PipelineWithLead } from "@/lib/pipeline-api";
import { enrichLead } from "@/lib/enrich-lead";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
  { key: "not_contacted", label: "Not Contacted", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/30", dot: "bg-muted-foreground" },
  { key: "email_sent", label: "Email Sent", icon: Mail, color: "text-primary", bg: "bg-primary/10", dot: "bg-primary" },
  { key: "replied", label: "Replied", icon: MessageSquare, color: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
  { key: "call_booked", label: "Call Booked", icon: Phone, color: "text-[hsl(var(--glow-violet))]", bg: "bg-[hsl(var(--glow-violet))]/10", dot: "bg-[hsl(var(--glow-violet))]" },
  { key: "closed", label: "Closed", icon: CheckCircle2, color: "text-success", bg: "bg-success/10", dot: "bg-success" },
  { key: "no_response", label: "No Response", icon: MailX, color: "text-orange-400", bg: "bg-orange-400/10", dot: "bg-orange-400" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" },
] as const;

function hashValue(s: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return min + (Math.abs(h) % (max - min + 1));
}

function PipelineAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return (
    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: `hsl(${hue}, 50%, 40%)` }}>
      {initials}
    </div>
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

  const closedCount = entries.filter(e => e.pipeline_status === "closed").length;
  const activeCount = entries.filter(e => !["closed", "rejected", "no_response"].includes(e.pipeline_status)).length;
  const repliedCount = entries.filter(e => ["replied", "call_booked"].includes(e.pipeline_status)).length;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Pipeline CRM
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {entries.length} clients tracked · Auto-synced from searches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-40 pl-8 text-xs glass-input"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="glass border-[rgba(255,255,255,0.08)] h-8 w-8 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem onClick={load} className="gap-2 text-xs">
                <RefreshCw className="h-3 w-3" /> Refresh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileRef.current?.click()} className="gap-2 text-xs">
                <Upload className="h-3 w-3" /> Import CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Active", count: activeCount, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Engaged", count: repliedCount, icon: MessageSquare, color: "text-warning", bg: "bg-warning/10" },
          { label: "Closed", count: closedCount, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-lg font-bold font-mono ${s.color}`}>{s.count}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mb-3 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
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
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                filterStatus === s.key ? "bg-primary text-primary-foreground" : "bg-[rgba(255,255,255,0.04)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-[rgba(255,255,255,0.04)] animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)", backgroundSize: "200% 100%" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-medium mb-1">No clients in pipeline</h3>
          <p className="text-xs text-muted-foreground mb-4">Search for clients and they'll automatically appear here.</p>
          <Link to="/search">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <Search className="h-3.5 w-3.5" /> Find Clients
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((entry, i) => {
            const enriched = enrichLead(entry.lead as any);
            const successProb = hashValue(entry.lead_id + "prob", 15, 85);
            const statusOpt = STATUS_OPTIONS.find(s => s.key === entry.pipeline_status) || STATUS_OPTIONS[0];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.015 }}
              >
                <Link to={`/pipeline/${entry.lead_id}`}>
                  <div className="glass-card rounded-lg p-3 hover:border-[rgba(255,255,255,0.12)] transition-all duration-150 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <PipelineAvatar name={entry.lead.business_name} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{entry.lead.business_name}</h3>
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            enriched.confidence_score >= 75 ? "bg-success/15 text-success" :
                            enriched.confidence_score >= 50 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                          }`}>
                            {enriched.confidence_score}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono truncate">
                          <span>{entry.lead.industry} · {entry.lead.city}</span>
                          {entry.lead.email && (
                            <a href={`mailto:${entry.lead.email}`} onClick={(e) => e.stopPropagation()} className="hidden sm:inline-flex items-center gap-0.5 hover:text-primary transition-colors">
                              <Mail className="h-2.5 w-2.5" /> {entry.lead.email}
                            </a>
                          )}
                          {entry.lead.phone && (
                            <a href={`tel:${entry.lead.phone}`} onClick={(e) => e.stopPropagation()} className="hidden md:inline-flex items-center gap-0.5 hover:text-primary transition-colors">
                              <Phone className="h-2.5 w-2.5" /> {entry.lead.phone}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Win probability bar */}
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0 w-20">
                        <div className="flex-1 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${successProb}%`,
                              background: successProb >= 50 ? "hsl(var(--success))" : "hsl(var(--warning))",
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-mono font-bold w-7 text-right" style={{ color: successProb >= 50 ? "hsl(var(--success))" : "hsl(var(--warning))" }}>
                          {successProb}%
                        </span>
                      </div>

                      {/* Status dropdown */}
                      <div className="shrink-0" onClick={(e) => e.preventDefault()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${statusOpt.color} ${statusOpt.bg} border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-colors`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusOpt.dot}`} />
                              {statusOpt.label}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-strong min-w-[160px]">
                            {STATUS_OPTIONS.map((s) => {
                              const Icon = s.icon;
                              return (
                                <DropdownMenuItem
                                  key={s.key}
                                  onClick={() => handleStatusChange(entry.id, s.key)}
                                  className={`gap-2 text-xs ${entry.pipeline_status === s.key ? "bg-primary/10" : ""}`}
                                >
                                  <Icon className={`h-3 w-3 ${s.color}`} />
                                  {s.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
