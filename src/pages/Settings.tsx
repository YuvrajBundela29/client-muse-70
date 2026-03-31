import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, AlertTriangle, Key, CheckCircle2, Settings as SettingsIcon, Lock, Eye, EyeOff, CreditCard, IndianRupee, Zap, Mail as MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const INDUSTRIES = [
  "Technology", "Design", "Marketing", "Writing", "Video",
  "Development", "Consulting", "Photography", "3D Animation", "Other",
];

interface Transaction {
  id: string;
  type: string;
  amount_inr: number;
  credits: number;
  description: string;
  status: string;
  created_at: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [plan, setPlan] = useState("free");
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setFullName(profile.full_name || "");
        setIndustry((profile as Record<string, unknown>).industry as string || "");
        setCountry((profile as Record<string, unknown>).country as string || "");
        setService((profile as Record<string, unknown>).service as string || "");
        setPlan(profile.plan || "free");
        setCreditsRemaining(profile.credits_remaining || 0);
      }
      const { data: sub } = await (supabase as any).from("user_subscriptions").select("*").eq("user_id", user.id).single();
      if (sub) {
        setSearchesUsed((sub as Record<string, unknown>).searches_used_this_month as number || 0);
      }
      const { data: txns } = await (supabase as any)
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (txns) setTransactions(txns);
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, industry, country, service } as Record<string, unknown>).eq("id", user.id);
    toast.success("Profile updated");
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPassword(""); }
    setChangingPassword(false);
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else {
      setResetEmailSent(true);
      toast.success("Password reset link sent to your email");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || deleteConfirmEmail !== user.email) {
      toast.error("Please type your email to confirm deletion");
      return;
    }
    setDeleting(true);
    try {
      // Delete user data from all tables
      const tables = ["client_activity", "client_pipeline", "saved_leads", "saved_searches", "search_history", "transactions", "referrals"];
      for (const table of tables) {
        await (supabase as any).from(table).delete().eq("user_id", user.id);
      }
      // Delete leads
      await supabase.from("leads").delete().eq("user_id", user.id);
      // Delete user subscriptions
      await (supabase as any).from("user_subscriptions").delete().eq("user_id", user.id);
      // Delete profile
      // Note: profile can't be deleted via RLS, but we can clear data
      await supabase.from("profiles").update({
        full_name: "[deleted]",
        email: null,
        industry: null,
        country: null,
        service: null,
        avatar_url: null,
        credits_remaining: 0,
      } as Record<string, unknown>).eq("id", user.id);

      await signOut();
      toast.success("Your account data has been deleted");
    } catch (err: any) {
      toast.error("Failed to delete account data: " + err.message);
    }
    setDeleting(false);
  };

  const planLimits: Record<string, number> = { free: 10, trial: 25, micro: 50, starter: 200, solo: 100, pro: 600, elite: 99999, agency: 99999 };
  const isPaid = ["micro", "starter", "pro", "elite", "agency"].includes(plan);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-primary" />
        <h1 className="page-title">Settings</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-full p-1 flex-wrap">
          <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Profile</TabsTrigger>
          <TabsTrigger value="account" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Account</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Subscription</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Transactions</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20">
                {(fullName || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{fullName || "Your Name"}</p>
                <p className="text-sm text-muted-foreground font-mono">{user?.email}</p>
                <Badge className={`mt-1 text-[9px] uppercase ${isPaid ? "bg-primary/15 text-primary border-primary/20" : "bg-muted text-muted-foreground"}`}>
                  {plan} plan
                </Badge>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <Label className="section-label">Display Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input mt-1.5" />
              </div>
              <div>
                <Label className="section-label">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="glass-input mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="section-label">Target Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} className="glass-input mt-1.5" />
              </div>
              <div>
                <Label className="section-label">Service</Label>
                <Input value={service} onChange={(e) => setService(e.target.value)} className="glass-input mt-1.5" />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2 bg-primary hover:bg-primary/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4 mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-medium">Change Password</h3>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input pr-10"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button onClick={changePassword} disabled={changingPassword} className="bg-primary hover:bg-primary/90">
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
                <Button variant="outline" onClick={sendPasswordReset} disabled={resetEmailSent} className="gap-2 glass-input">
                  <MailIcon className="h-4 w-4" />
                  {resetEmailSent ? "Reset Email Sent" : "Send Reset Link"}
                </Button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border-destructive/20">
              <h3 className="text-destructive flex items-center gap-2 font-medium mb-3">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
            </div>
          </motion.div>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="glass-strong rounded-2xl border-[rgba(255,255,255,0.1)]">
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Account Permanently</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your data including leads, pipeline, search history, and transactions. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label className="text-sm">Type your email <span className="font-mono text-destructive">{user?.email}</span> to confirm:</Label>
                <Input
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="glass-input"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirmEmail(""); }} className="glass-input">Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmEmail !== user?.email}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Permanently Delete Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-medium">Current Plan</h3>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold capitalize">{plan}</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Credits Remaining</p>
                  <p className="text-2xl font-bold font-mono text-primary">{plan === "elite" || plan === "agency" ? "∞" : creditsRemaining}</p>
                </div>
                <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Searches Used</p>
                  <p className="text-2xl font-bold font-mono">{searchesUsed}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">
                  Searches: {searchesUsed} / {["elite", "agency"].includes(plan) ? "∞" : planLimits[plan] || 10}
                </p>
                <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-glow-cyan rounded-full transition-all shadow-glow"
                    style={{ width: `${["elite", "agency"].includes(plan) ? 5 : Math.min(100, (searchesUsed / (planLimits[plan] || 10)) * 100)}%` }}
                  />
                </div>
              </div>
              {!isPaid && (
                <Link to="/upgrade">
                  <Button className="bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow gap-2">
                    <Zap className="h-4 w-4" /> Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Transaction History</h3>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <IndianRupee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Your payment and credit usage history will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${txn.credits < 0 ? "bg-warning/10" : txn.type === "subscription" ? "bg-primary/10" : "bg-success/10"}`}>
                          {txn.credits < 0 ? <Zap className="h-4 w-4 text-warning" /> : txn.type === "subscription" ? <Zap className="h-4 w-4 text-primary" /> : <IndianRupee className="h-4 w-4 text-success" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{txn.description}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(txn.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {txn.amount_inr > 0 && <p className="text-xs font-bold font-mono">₹{txn.amount_inr.toLocaleString("en-IN")}</p>}
                        {txn.credits !== 0 && (
                          <p className={`text-[10px] font-mono ${txn.credits > 0 ? "text-success" : "text-warning"}`}>
                            {txn.credits > 0 ? "+" : ""}{txn.credits} credits
                          </p>
                        )}
                        <Badge className={`text-[8px] mt-0.5 ${txn.status === "success" ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}`}>
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h3 className="font-medium">Email Notifications</h3>
              <div className="flex items-center justify-between">
                <Label>Follow-up reminders</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Saved search alerts</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Weekly pipeline summary</Label>
                <Switch />
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
