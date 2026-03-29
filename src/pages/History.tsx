import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Trash2, ArrowRight, History as HistoryIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/session-store";
import { useState } from "react";

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
  const { searchHistory, clearHistory, setLastSearch } = useSessionStore();

  const handleSearchAgain = (entry: { industry: string; location: string; service: string }) => {
    setLastSearch(entry);
    navigate(`/search?industry=${encodeURIComponent(entry.industry)}&location=${encodeURIComponent(entry.location)}&service=${encodeURIComponent(entry.service)}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Search History
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {searchHistory.length} past {searchHistory.length === 1 ? "search" : "searches"}
          </p>
        </div>
        {searchHistory.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearHistory} className="gap-1.5 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </Button>
        )}
      </div>

      {searchHistory.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-medium">No search history yet</h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-sm mx-auto">
            Every search you run is automatically saved here. Run your first search to get started.
          </p>
          <Link to="/search">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4" /> Find Clients Now
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {searchHistory.map((entry, i) => (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              variants={item}
              className="group glass-card rounded-2xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.15)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {entry.industry}
                    </Badge>
                    <Badge variant="outline" className="border-[rgba(255,255,255,0.1)] text-xs">
                      📍 {entry.location}
                    </Badge>
                    <Badge variant="outline" className="border-[rgba(255,255,255,0.1)] text-xs">
                      🛠 {entry.service}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {timeAgo(entry.timestamp)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSearchAgain(entry)}
                    className="gap-1.5 shrink-0 bg-primary hover:bg-primary/90"
                  >
                    Re-run <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
