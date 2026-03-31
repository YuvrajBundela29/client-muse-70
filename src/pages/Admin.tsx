import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import {
  Users, IndianRupee, TrendingUp, Search, Crown, Zap,
  BarChart3, ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  totalRevenue: number;
  totalSearches: number;
  monthlyRevenue: { month: string; revenue: number }[];
  planDistribution: { plan: string; count: number }[];
  recentUsers: { id: string; email: string; plan: string; credits: number; created_at: string }[];
}

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Check admin role
    (supabase.rpc as any)("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }: any) => {
      setIsAdmin(data === true);
    });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
  }, [isAdmin]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Fetch all profiles (admin can read via service role context)
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: transactions } = await supabase.from("transactions").select("*");
      const { data: searches } = await supabase.from("search_history").select("id, created_at");

      const allProfiles = profiles || [];
      const allTransactions = (transactions || []).filter((t: any) => t.status === "success");

      const totalRevenue = allTransactions.reduce((sum: number, t: any) => sum + (t.amount_inr || 0), 0);
      const paidUsers = allProfiles.filter((p: any) => p.plan !== "free").length;

      // Monthly revenue
      const monthlyMap: Record<string, number> = {};
      allTransactions.forEach((t: any) => {
        const month = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyMap[month] = (monthlyMap[month] || 0) + (t.amount_inr || 0);
      });
      const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

      // Plan distribution
      const planMap: Record<string, number> = {};
      allProfiles.forEach((p: any) => {
        planMap[p.plan] = (planMap[p.plan] || 0) + 1;
      });
      const planDistribution = Object.entries(planMap).map(([plan, count]) => ({ plan, count }));

      // Recent users
      const recentUsers = allProfiles
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)
        .map((p: any) => ({
          id: p.id,
          email: p.email || "N/A",
          plan: p.plan,
          credits: p.credits_remaining,
          created_at: p.created_at,
        }));

      setStats({
        totalUsers: allProfiles.length,
        paidUsers,
        totalRevenue,
        totalSearches: (searches || []).length,
        monthlyRevenue,
        planDistribution,
        recentUsers,
      });
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mrr = stats.totalRevenue / Math.max(stats.monthlyRevenue.length, 1);
  const ltv = stats.paidUsers > 0 ? stats.totalRevenue / stats.paidUsers : 0;
  const conversionRate = stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground font-mono">Business metrics & user management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Paid Users", value: stats.paidUsers, icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10", sub: `${conversionRate}% conversion` },
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-success", bg: "bg-success/10" },
          { label: "MRR (Est.)", value: `₹${Math.round(mrr).toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", sub: `LTV: ₹${Math.round(ltv).toLocaleString()}` },
        ].map((m) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            {m.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Revenue Over Time
          </h3>
          {stats.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(222,15%,56%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(222,15%,56%)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(228,40%,11%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(238,75%,64%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(238,75%,64%)" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Plan Distribution
          </h3>
          {stats.planDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.planDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="plan" tick={{ fill: "hsl(222,15%,56%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(222,15%,56%)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(228,40%,11%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(238,75%,64%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Extra metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Searches", value: stats.totalSearches, icon: Search },
          { label: "Avg Credits/User", value: stats.totalUsers > 0 ? Math.round(stats.recentUsers.reduce((s, u) => s + u.credits, 0) / stats.recentUsers.length) : 0, icon: Zap },
          { label: "Churn Risk", value: `${Math.max(0, 100 - Number(conversionRate) * 3).toFixed(0)}%`, icon: ArrowDownRight },
        ].map((m) => (
          <div key={m.label} className="glass-card p-3 text-center">
            <m.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold font-mono">{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-left py-2 px-2">Plan</th>
                <th className="text-right py-2 px-2">Credits</th>
                <th className="text-right py-2 px-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="py-2 px-2 font-mono">{u.email}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      u.plan === "free" ? "bg-muted text-muted-foreground" :
                      u.plan === "elite" ? "bg-amber-500/15 text-amber-400" :
                      "bg-primary/15 text-primary"
                    }`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">{u.credits}</td>
                  <td className="py-2 px-2 text-right text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
