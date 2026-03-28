import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Play, Trash2, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    return <div className="p-6 text-muted-foreground">Loading saved searches...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bookmark className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Saved Searches</h1>
      </div>

      {searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No saved searches yet. Save a search from the Discover page to quickly re-run it later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searches.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.label}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {s.industry && <Badge variant="secondary">{s.industry}</Badge>}
                      {s.country && <Badge variant="outline">{s.country}</Badge>}
                      {s.service && <Badge variant="outline">{s.service}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saved {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => runSearch(s)} className="gap-1">
                      <Play className="h-3.5 w-3.5" /> Run
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleAlert(s)}>
                      {s.is_alert ? <Bell className="h-3.5 w-3.5 text-primary" /> : <BellOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteSearch(s.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
