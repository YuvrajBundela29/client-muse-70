import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Search, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(230, 80%, 60%)", "hsl(152, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(260, 80%, 60%)", "hsl(185, 80%, 55%)"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

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
    { label: "Total Leads", value: stats.totalLeads, icon: Users, gradient: "from-primary/20 to-glow-cyan/10", border: "border-primary/20" },
    { label: "Searches Run", value: stats.totalSearches, icon: Search, gradient: "from-glow-violet/20 to-glow-violet/5", border: "border-glow-violet/20" },
    { label: "Avg Fit Score", value: stats.avgScore, icon: TrendingUp, gradient: "from-success/20 to-success/5", border: "border-success/20" },
    { label: "Converted", value: stats.converted, icon: BarChart3, gradient: "from-warning/20 to-warning/5", border: "border-warning/20" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Activity className="h-5 w-5 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/30" />
        </div>
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <motion.div key={m.label} variants={item}>
            <Card className={`border ${m.border} bg-gradient-to-br ${m.gradient} backdrop-blur-sm overflow-hidden relative group hover:shadow-card-hover transition-all duration-300`}>
              <CardContent className="pt-6 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 group-hover:scale-110 transition-transform duration-300">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold font-mono">{m.value}</p>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader><CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Leads Added Per Week</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(225, 25%, 9%)", border: "1px solid hsl(225, 15%, 15%)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="leads" stroke="hsl(230, 80%, 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader><CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Pipeline Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                  {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(225, 25%, 9%)", border: "1px solid hsl(225, 15%, 15%)", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader><CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Leads by Industry</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(225, 25%, 9%)", border: "1px solid hsl(225, 15%, 15%)", borderRadius: "12px" }} />
                <Bar dataKey="count" fill="hsl(230, 80%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
