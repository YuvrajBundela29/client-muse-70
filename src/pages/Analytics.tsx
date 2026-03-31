import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Search, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from "recharts";

const COLORS = ["#5B5FEF", "#00E5C3", "#F59E0B", "#EF4444", "#A78BFA", "#00B4D8"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(10,15,30,0.95)] border border-[rgba(255,255,255,0.12)] rounded-lg px-3.5 py-2.5 shadow-lg">
      <p className="text-[11px] text-muted-foreground font-mono mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLeads: 0, totalSearches: 0, avgScore: 0, converted: 0 });
  const [industryData, setIndustryData] = useState<{ name: string; count: number }[]>([]);
  const [pipelineData, setPipelineData] = useState<{ name: string; value: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ week: string; leads: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      const [leadsRes, searchRes, pipelineRes] = await Promise.all([
        supabase.from("leads").select("*").eq("user_id", user.id),
        supabase.from("search_history").select("id").eq("user_id", user.id),
        supabase.from("client_pipeline").select("pipeline_status").eq("user_id", user.id),
      ]);
      const leads = leadsRes.data || [];
      const searches = searchRes.data || [];
      const pipeline = pipelineRes.data || [];
      const ratings = leads.filter(l => l.google_rating).map(l => l.google_rating as number);
      const avgScore = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 20) : 0;
      const closed = pipeline.filter(p => p.pipeline_status === "closed").length;
      setStats({ totalLeads: leads.length, totalSearches: searches.length, avgScore, converted: closed });
      const indMap: Record<string, number> = {};
      leads.forEach(l => { indMap[l.industry] = (indMap[l.industry] || 0) + 1; });
      setIndustryData(Object.entries(indMap).map(([name, count]) => ({ name, count })).slice(0, 6));
      const stageMap: Record<string, number> = {};
      pipeline.forEach(p => { stageMap[p.pipeline_status] = (stageMap[p.pipeline_status] || 0) + 1; });
      setPipelineData(Object.entries(stageMap).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })));
      const weeks: { week: string; leads: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i * 7);
        const weekStart = new Date(d); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
        const count = leads.filter(l => { const c = new Date(l.created_at); return c >= weekStart && c < weekEnd; }).length;
        weeks.push({ week: `W${12 - i}`, leads: count });
      }
      setWeeklyData(weeks);
    };
    fetchAnalytics();
  }, [user]);

  const metricCards = [
    { label: "TOTAL LEADS", value: stats.totalLeads, icon: Users, accent: "#5B5FEF" },
    { label: "SEARCHES RUN", value: stats.totalSearches, icon: Search, accent: "#A78BFA" },
    { label: "AVG FIT SCORE", value: stats.avgScore, icon: TrendingUp, accent: "#00E5C3" },
    { label: "CONVERTED", value: stats.converted, icon: BarChart3, accent: "#F59E0B" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="page-title">Analytics</h1>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <motion.div key={m.label} variants={item} whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 30 } }}>
            <div className="glass-card p-5 cursor-default" style={{ borderTop: `1px solid ${m.accent}` }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${m.accent}1F` }}>
                  <m.icon className="h-5 w-5" style={{ color: m.accent }} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{m.value}</p>
                  <p className="section-label">{m.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {stats.totalLeads === 0 && stats.totalSearches === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-medium">No analytics data yet</h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-md mx-auto">
            Run your first search and add leads to the pipeline to start seeing analytics here.
          </p>
          <a href="/search">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              <Search className="h-4 w-4" /> Find Your First Leads
            </button>
          </a>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="section-label mb-4">Leads Added Per Week</h3>
            {weeklyData.every(d => d.leads === 0) ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No lead data yet — run searches to populate this chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fill: "#8892B0", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8892B0", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="leads" stroke="#5B5FEF" strokeWidth={2} fill="url(#leadsFill)" isAnimationActive animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <h3 className="section-label mb-4">Pipeline Distribution</h3>
            {pipelineData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No pipeline data yet — add leads to your pipeline
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name} isAnimationActive animationDuration={800}>
                    {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
            <h3 className="section-label mb-4">Leads by Industry</h3>
            {industryData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No industry data yet — discover leads across different niches
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={industryData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#8892B0", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8892B0", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#5B5FEF" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
