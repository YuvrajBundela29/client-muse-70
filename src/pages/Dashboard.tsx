import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Bookmark, GitBranch, Clock, ArrowRight, Users, Zap, Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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
    { label: "Total Leads", value: stats.totalLeads, icon: Users, gradient: "from-primary/20 to-glow-cyan/10", iconColor: "text-primary", border: "border-primary/20" },
    { label: "Saved Leads", value: stats.savedLeads, icon: Bookmark, gradient: "from-success/20 to-success/5", iconColor: "text-success", border: "border-success/20" },
    { label: "In Pipeline", value: stats.pipelineActive, icon: GitBranch, gradient: "from-warning/20 to-warning/5", iconColor: "text-warning", border: "border-warning/20" },
    { label: "Searches", value: stats.recentSearches, icon: Search, gradient: "from-glow-violet/20 to-glow-violet/5", iconColor: "text-glow-violet", border: "border-glow-violet/20" },
  ];

  const quickActions = [
    { label: "Find New Clients", to: "/search", icon: Search, desc: "AI-powered lead discovery", glow: "hover:glow-primary" },
    { label: "View Saved Leads", to: "/saved", icon: Bookmark, desc: "Manage your curated leads", glow: "hover:glow-cyan" },
    { label: "Pipeline CRM", to: "/pipeline", icon: GitBranch, desc: "Track client lifecycle", glow: "" },
    { label: "Search History", to: "/history", icon: Clock, desc: "Re-run past searches", glow: "" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="relative">
            <Activity className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/30" />
          </div>
          <h1 className="text-2xl font-bold">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8 ml-8">Your AI client acquisition command center</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className={`relative overflow-hidden p-5 border ${s.border} bg-gradient-to-br ${s.gradient} backdrop-blur-sm transition-all duration-300 hover:shadow-card-hover group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 ${s.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-bold font-mono tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h2>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((a) => (
          <motion.div key={a.label} variants={item}>
            <Link to={a.to}>
              <Card className={`p-5 glass border-border/50 cursor-pointer group transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 ${a.glow}`}>
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <a.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{a.label}</h3>
                <p className="text-xs text-muted-foreground mb-4">{a.desc}</p>
                <span className="text-xs text-primary flex items-center gap-1 font-medium group-hover:gap-2.5 transition-all duration-300">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
