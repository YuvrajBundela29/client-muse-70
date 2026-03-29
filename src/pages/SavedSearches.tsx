import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Play, Trash2, Bell, BellOff, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  label: string;
  industry: string | null;
  country: string | null;
  service: string | null;
  is_alert: boolean;
  created_at: string;
}

export default function SavedSearches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSearches((data as SavedSearch[] | null) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const runSearch = (s: SavedSearch) => {
    navigate(`/search?industry=${encodeURIComponent(s.industry || "")}&country=${encodeURIComponent(s.country || "")}&service=${encodeURIComponent(s.service || "")}`);
  };

  const toggleAlert = async (s: SavedSearch) => {
    await (supabase as any)
      .from("saved_searches")
      .update({ is_alert: !s.is_alert })
      .eq("id", s.id);
    setSearches(prev => prev.map(x => x.id === s.id ? { ...x, is_alert: !x.is_alert } : x));
    toast.success(s.is_alert ? "Alert disabled" : "Alert enabled");
  };

  const deleteSearch = async (id: string) => {
    await (supabase as any).from("saved_searches").delete().eq("id", id);
    setSearches(prev => prev.filter(x => x.id !== id));
    toast.success("Saved search deleted");
  };

  if (loading) {
    return <div className="p-6 text-muted-foreground font-mono">Loading saved searches...</div>;
  }

  const savedOnly = searches.filter(s => !s.is_alert);
  const alertsOnly = searches.filter(s => s.is_alert);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookmarkCheck className="h-5 w-5 text-primary" />
        <h1 className="page-title">Saved Searches</h1>
      </div>

      <Tabs defaultValue="saved">
        <TabsList className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-full p-1">
          <TabsTrigger value="saved" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-sm">
            <Bookmark className="h-3.5 w-3.5" /> Saved Searches
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-sm">
            <Bell className="h-3.5 w-3.5" /> Weekly Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          {savedOnly.length === 0 && searches.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bookmark className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No saved searches yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                After running a search, click "Save Search" to bookmark it for quick re-use.
              </p>
            </motion.div>
          ) : (
            <SearchList
              items={savedOnly.length > 0 ? savedOnly : searches.filter(s => !s.is_alert)}
              onRun={runSearch}
              onToggleAlert={toggleAlert}
              onDelete={deleteSearch}
            />
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          {alertsOnly.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No alerts set</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Toggle alerts on a saved search to get weekly notifications.
              </p>
            </div>
          ) : (
            <SearchList items={alertsOnly} onRun={runSearch} onToggleAlert={toggleAlert} onDelete={deleteSearch} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SearchList({ items, onRun, onToggleAlert, onDelete }: {
  items: SavedSearch[];
  onRun: (s: SavedSearch) => void;
  onToggleAlert: (s: SavedSearch) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <div className={`glass-card rounded-2xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.15)] ${s.is_alert ? "border-l-2 border-l-success" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-[15px] truncate">{s.label}</p>
                  {s.is_alert && (
                    <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Alert active</Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {s.industry && <Badge variant="secondary" className="bg-[rgba(255,255,255,0.06)] text-xs">{s.industry}</Badge>}
                  {s.country && <Badge variant="outline" className="border-[rgba(255,255,255,0.08)] text-xs">{s.country}</Badge>}
                  {s.service && <Badge variant="outline" className="border-[rgba(255,255,255,0.08)] text-xs">{s.service}</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                  Saved {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={() => onRun(s)} className="gap-1 bg-primary hover:bg-primary/90">
                  <Play className="h-3.5 w-3.5" /> Run
                </Button>
                <div className="flex items-center gap-1.5">
                  <Switch checked={s.is_alert} onCheckedChange={() => onToggleAlert(s)} />
                </div>
                <Button size="sm" variant="ghost" onClick={() => onDelete(s.id)} className="h-8 w-8 p-0">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
