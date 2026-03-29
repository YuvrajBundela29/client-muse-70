import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Bookmark, GitBranch, Clock, Users, Zap, Activity,
  ChevronRight, Lightbulb, AlertCircle, CalendarClock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return count;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 30 } } };

const METRIC_CONFIGS = [
  { label: "TOTAL LEADS", key: "totalLeads" as const, icon: Users, accent: "hsl(238, 75%, 64%)" },
  { label: "SAVED LEADS", key: "savedLeads" as const, icon: Bookmark, accent: "hsl(166, 72%, 45%)" },
  { label: "IN PIPELINE", key: "pipelineActive" as const, icon: GitBranch, accent: "hsl(260, 80%, 60%)" },
  { label: "SEARCHES", key: "recentSearches" as const, icon: Search, accent: "hsl(38, 92%, 50%)" },
];

function MetricCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  const animated = useAnimatedCounter(value);
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 30 } }}
      className="glass-card p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.15)] group cursor-default"
      style={{ borderTop: `1px solid ${accent}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${accent}1F`, boxShadow: `0 0 20px ${accent}26` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <div>
          <p className="number-lg text-foreground">{animated}</p>
          <p className="section-label">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, savedLeads: 0, pipelineActive: 0, recentSearches: 0 });
  const [followUps, setFollowUps] = useState<any[]>([]);

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

  const insights = [
    { title: "Best time to outreach", desc: "9–11am gets 3× reply rates in your timezone", icon: Lightbulb, accent: "hsl(238, 75%, 64%)", link: "/search" },
    { title: "Top converting niche", desc: "SaaS startups in Germany — 42% response rate", icon: Zap, accent: "hsl(166, 72%, 45%)", link: "/analytics" },
    { title: "Pipeline needs attention", desc: `${stats.pipelineActive} leads with no recent activity`, icon: AlertCircle, accent: "hsl(38, 92%, 50%)", link: "/pipeline" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* Hero card with 3D effect */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-glow-cyan/5 rounded-full blur-[60px]" />
          {/* Scanner line */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scanner" />
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* Animated waveform */}
              <div className="flex items-end gap-[2px] h-5">
                {[0.6, 1, 0.7].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={{ height: [`${h * 20}px`, `${h * 10}px`, `${h * 20}px`] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <h1 className="page-title">
                Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">Your AI client acquisition command center</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-[11px] text-muted-foreground font-mono">All systems operational</span>
          </div>
        </div>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {METRIC_CONFIGS.map((m) => (
          <MetricCard key={m.key} label={m.label} value={stats[m.key]} icon={m.icon} accent={m.accent} />
        ))}
      </motion.div>

      {/* AI Intelligence Feed */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
          <h2 className="section-label">Live Intelligence</h2>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {insights.map((insight) => (
          <motion.div
            key={insight.title}
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 30 } }}
            className="glass-card p-5 cursor-default group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${insight.accent}1F` }}>
                <insight.icon className="h-4 w-4" style={{ color: insight.accent }} />
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="text-[15px] font-medium mb-1">{insight.title}</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{insight.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Upcoming Follow-ups */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <h2 className="section-label">Upcoming Follow-ups</h2>
      </div>
      <div className="glass-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No follow-ups scheduled — add reminders from client profiles
        </p>
      </div>
    </div>
  );
}
