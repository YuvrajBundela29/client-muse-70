import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { isGodAdmin } from "@/lib/admin";
import {
  Users, IndianRupee, TrendingUp, Search, Crown, Zap,
  BarChart3, ArrowDownRight, Loader2, Shield, Pencil, Trash2,
  Mail, Calendar, CreditCard, Eye, X, Save, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  credits_remaining: number;
  created_at: string;
  onboarding_complete: boolean;
  country: string;
  service: string;
  industry: string;
}

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  totalRevenue: number;
  totalSearches: number;
  totalLeads: number;
  totalReferrals: number;
  monthlyRevenue: { month: string; revenue: number }[];
  planDistribution: { plan: string; count: number }[];
}

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editCredits, setEditCredits] = useState(0);

  const isAuthorized = !!user && isGodAdmin(user.email);

  useEffect(() => {
    if (!isAuthorized) return;
    loadData();
  }, [isAuthorized]);

  if (!isAuthorized) return <Navigate to="/dashboard" replace />;

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { data: profiles },
        { data: transactions },
        { data: searches },
        { data: leads },
        { data: referrals },
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("transactions").select("*"),
        supabase.from("search_history").select("id, created_at"),
        supabase.from("leads").select("id"),
        supabase.from("referrals").select("id"),
      ]);

      const allProfiles = (profiles || []) as UserRow[];
      const allTx = (transactions || []).filter((t: any) => t.status === "success");
      const totalRevenue = allTx.reduce((s: number, t: any) => s + (t.amount_inr || 0), 0);
      const paidUsers = allProfiles.filter((p) => p.plan !== "free").length;

      // Monthly revenue
      const monthlyMap: Record<string, number> = {};
      allTx.forEach((t: any) => {
        const m = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyMap[m] = (monthlyMap[m] || 0) + (t.amount_inr || 0);
      });

      // Plan distribution
      const planMap: Record<string, number> = {};
      allProfiles.forEach((p) => { planMap[p.plan] = (planMap[p.plan] || 0) + 1; });

      setStats({
        totalUsers: allProfiles.length,
        paidUsers,
        totalRevenue,
        totalSearches: (searches || []).length,
        totalLeads: (leads || []).length,
        totalReferrals: (referrals || []).length,
        monthlyRevenue: Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })),
        planDistribution: Object.entries(planMap).map(([plan, count]) => ({ plan, count })),
      });

      setUsers(allProfiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error("Admin load error:", err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ plan: editPlan, credits_remaining: editCredits })
      .eq("id", userId);
    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success("User updated");
      setEditingUser(null);
      loadData();
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (isGodAdmin(email)) {
      toast.error("Cannot delete god admin");
      return;
    }
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    // We can't delete auth users from client, but we can wipe their profile
    const { error } = await supabase.from("profiles").update({
      plan: "free",
      credits_remaining: 0,
      full_name: "[DELETED]",
      email: "[DELETED]",
    }).eq("id", userId);
    if (error) toast.error("Failed"); else { toast.success("User wiped"); loadData(); }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mrr = stats.totalRevenue / Math.max(stats.monthlyRevenue.length, 1);
  const ltv = stats.paidUsers > 0 ? stats.totalRevenue / stats.paidUsers : 0;
  const convRate = stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            God Mode — Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Full control · Only visible to you · {user.email}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
          { label: "Paid Users", value: stats.paidUsers, icon: Crown, color: "text-amber-400", sub: `${convRate}%` },
          { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-success" },
          { label: "MRR", value: `₹${Math.round(mrr).toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
          { label: "Searches", value: stats.totalSearches, icon: Search, color: "text-muted-foreground" },
          { label: "Leads", value: stats.totalLeads, icon: Eye, color: "text-muted-foreground" },
        ].map((m) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
            </div>
            <p className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</p>
            {m.sub && <p className="text-[9px] text-muted-foreground">conv: {m.sub}</p>}
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

      {/* Extra stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "LTV / Paid User", value: `₹${Math.round(ltv).toLocaleString()}`, icon: CreditCard },
          { label: "Referrals", value: stats.totalReferrals, icon: Mail },
          { label: "Churn Risk", value: `${Math.max(0, 100 - Number(convRate) * 3).toFixed(0)}%`, icon: ArrowDownRight },
        ].map((m) => (
          <div key={m.label} className="glass-card p-3 text-center">
            <m.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold font-mono">{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Users Management Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            User Management ({users.length})
          </h3>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 h-8 text-xs"
          />
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">User</th>
                <th className="text-left py-2 px-2">Plan</th>
                <th className="text-right py-2 px-2">Credits</th>
                <th className="text-left py-2 px-2">Country</th>
                <th className="text-left py-2 px-2">Service</th>
                <th className="text-right py-2 px-2">Joined</th>
                <th className="text-right py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isEditing = editingUser === u.id;
                return (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="py-2 px-2">
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                        <p className="font-mono text-muted-foreground text-[10px]">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      {isEditing ? (
                        <Select value={editPlan} onValueChange={setEditPlan}>
                          <SelectTrigger className="h-7 w-24 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["free", "micro", "starter", "pro", "elite", "agency"].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          u.plan === "free" ? "bg-muted text-muted-foreground" :
                          u.plan === "elite" ? "bg-amber-500/15 text-amber-400" :
                          u.plan === "agency" ? "bg-purple-500/15 text-purple-400" :
                          "bg-primary/15 text-primary"
                        }`}>
                          {u.plan}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editCredits}
                          onChange={(e) => setEditCredits(Number(e.target.value))}
                          className="h-7 w-20 text-[10px] text-right"
                        />
                      ) : (
                        u.credits_remaining
                      )}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{u.country || "—"}</td>
                    <td className="py-2 px-2 text-muted-foreground truncate max-w-[100px]">{u.service || "—"}</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-success" onClick={() => handleSaveUser(u.id)}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => setEditingUser(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => { setEditingUser(u.id); setEditPlan(u.plan); setEditCredits(u.credits_remaining); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {!isGodAdmin(u.email) && (
                            <Button
                              size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteUser(u.id, u.email)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
