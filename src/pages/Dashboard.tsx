import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Bookmark, GitBranch, Clock, ArrowRight, Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, savedLeads: 0, pipelineActive: 0, recentSearches: 0 });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [leads, saved, pipeline, history] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("saved_leads").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("client_pipeline").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("search_history").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      setStats({
        totalLeads: leads.count || 0,
        savedLeads: saved.count || 0,
        pipelineActive: pipeline.count || 0,
        recentSearches: history.count || 0,
      });
    }
    load();
  }, [user]);

  const statCards = [
    { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-primary" },
    { label: "Saved Leads", value: stats.savedLeads, icon: Bookmark, color: "text-green-500" },
    { label: "In Pipeline", value: stats.pipelineActive, icon: GitBranch, color: "text-amber-500" },
    { label: "Searches", value: stats.recentSearches, icon: Search, color: "text-purple-500" },
  ];

  const quickActions = [
    { label: "Find New Clients", to: "/search", icon: Search, desc: "AI-powered lead discovery" },
    { label: "View Saved Leads", to: "/saved", icon: Bookmark, desc: "Manage your curated leads" },
    { label: "Pipeline CRM", to: "/pipeline", icon: GitBranch, desc: "Track client lifecycle" },
    { label: "Search History", to: "/history", icon: Clock, desc: "Re-run past searches" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">Your AI client acquisition command center</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((a, i) => (
          <motion.div key={a.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Link to={a.to}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <a.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-medium text-sm mb-1">{a.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{a.desc}</p>
                <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Go <ArrowRight className="h-3 w-3" />
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
