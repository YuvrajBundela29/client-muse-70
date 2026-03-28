import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crosshair, Clock, Search, Trash2, ArrowRight, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/session-store";

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

export default function History() {
  const navigate = useNavigate();
  const { searchHistory, clearHistory, setLastSearch } = useSessionStore();

  const handleSearchAgain = (entry: { industry: string; location: string; service: string }) => {
    setLastSearch(entry);
    navigate(`/search?industry=${encodeURIComponent(entry.industry)}&location=${encodeURIComponent(entry.location)}&service=${encodeURIComponent(entry.service)}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Search History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center"
          >
            <HistoryIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-bold">No searches yet</h2>
            <p className="mb-6 text-muted-foreground">Start finding clients and your search history will appear here.</p>
            <Link to="/search">
              <Button className="gap-2">
                <Search className="h-4 w-4" /> Start Searching
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {searchHistory.map((entry, i) => (
              <motion.div
                key={`${entry.timestamp}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {entry.industry}
                      </span>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        📍 {entry.location}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Service: {entry.service}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {timeAgo(entry.timestamp)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSearchAgain(entry)}
                    className="gap-1.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    Search Again <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
