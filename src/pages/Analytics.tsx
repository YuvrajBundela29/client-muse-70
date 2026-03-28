import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(262, 83%, 58%)", "hsl(199, 89%, 48%)"];

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

      // Stats
      const ratings = leads.filter(l => l.google_rating).map(l => l.google_rating as number);
      const avgScore = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 20) : 0;
      const closed = pipeline.filter(p => p.pipeline_status === "closed").length;
      setStats({ totalLeads: leads.length, totalSearches: searches.length, avgScore, converted: closed });

      // Industry breakdown
      const indMap: Record<string, number> = {};
      leads.forEach(l => { indMap[l.industry] = (indMap[l.industry] || 0) + 1; });
      setIndustryData(Object.entries(indMap).map(([name, count]) => ({ name, count })).slice(0, 6));

      // Pipeline distribution
      const stageMap: Record<string, number> = {};
      pipeline.forEach(p => { stageMap[p.pipeline_status] = (stageMap[p.pipeline_status] || 0) + 1; });
      setPipelineData(Object.entries(stageMap).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })));

      // Weekly leads (last 12 weeks)
      const weeks: { week: string; leads: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const count = leads.filter(l => {
          const c = new Date(l.created_at);
          return c >= weekStart && c < weekEnd;
        }).length;
        weeks.push({ week: `W${12 - i}`, leads: count });
      }
      setWeeklyData(weeks);
    };
    fetchAnalytics();
  }, [user]);

  const metricCards = [
    { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-primary" },
    { label: "Searches Run", value: stats.totalSearches, icon: Search, color: "text-accent-foreground" },
    { label: "Avg Fit Score", value: stats.avgScore, icon: TrendingUp, color: "text-green-500" },
    { label: "Converted", value: stats.converted, icon: BarChart3, color: "text-amber-500" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Leads Added Per Week</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pipeline Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Leads by Industry</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
