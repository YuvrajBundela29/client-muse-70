import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Trash2, ArrowRight, ChevronDown, ChevronUp, MapPin, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/session-store";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HistoryEntry {
  id: string;
  industry: string;
  location: string;
  service: string;
  created_at: string;
  result_count: number | null;
  results_json: any;
}

function timeAgo(timestamp: string) {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setLastSearch } = useSessionStore();
  const [dbHistory, setDbHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setDbHistory((data as HistoryEntry[] | null) || []);
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  const handleSearchAgain = (entry: { industry: string; location: string; service: string }) => {
    setLastSearch(entry);
    navigate(`/search?industry=${encodeURIComponent(entry.industry)}&location=${encodeURIComponent(entry.location)}&service=${encodeURIComponent(entry.service)}`);
  };

  const leads = expandedId
    ? (() => {
        const entry = dbHistory.find(e => e.id === expandedId);
        if (!entry?.results_json) return [];
        try {
          return Array.isArray(entry.results_json) ? entry.results_json : [];
        } catch { return []; }
      })()
    : [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Search History
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {dbHistory.length} past {dbHistory.length === 1 ? "search" : "searches"} · leads saved automatically
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-[rgba(255,255,255,0.04)] animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)", backgroundSize: "200% 100%" }} />
          ))}
        </div>
      ) : dbHistory.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-medium">No search history yet</h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-sm mx-auto">
            Every search you run is automatically saved here with all discovered leads.
          </p>
          <Link to="/search">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4" /> Find Clients Now
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {dbHistory.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const resultCount = entry.result_count || 0;
            return (
              <motion.div key={entry.id} variants={item}>
                <div className="glass-card rounded-xl overflow-hidden transition-all duration-200 hover:border-[rgba(255,255,255,0.15)]">
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                          <Building2 className="h-3 w-3" /> {entry.industry}
                        </Badge>
                        <Badge variant="outline" className="border-[rgba(255,255,255,0.1)] text-xs gap-1">
                          <MapPin className="h-3 w-3" /> {entry.location}
                        </Badge>
                        <Badge variant="outline" className="border-[rgba(255,255,255,0.1)] text-xs gap-1">
                          <Briefcase className="h-3 w-3" /> {entry.service}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                        <span>{timeAgo(entry.created_at)}</span>
                        {resultCount > 0 && (
                          <span className="text-success">{resultCount} leads found</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {resultCount > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {isExpanded ? "Hide" : "View"} Leads
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleSearchAgain(entry)}
                        className="gap-1.5 bg-primary hover:bg-primary/90"
                      >
                        Re-run <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded leads */}
                  <AnimatePresence>
                    {isExpanded && leads.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3 space-y-2 bg-[rgba(255,255,255,0.02)]">
                          {leads.map((lead: any, li: number) => (
                            <div key={li} className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                                {(lead.business_name || "?").slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{lead.business_name || "Unknown"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate">
                                  {lead.city} {lead.email && `· ${lead.email}`}
                                </p>
                              </div>
                              {lead.website && (
                                <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-primary font-mono hover:underline shrink-0">
                                  Visit site →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
