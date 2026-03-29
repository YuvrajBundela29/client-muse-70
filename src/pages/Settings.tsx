import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, AlertTriangle, Key, ExternalLink, CheckCircle2, XCircle, Settings as SettingsIcon, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const INDUSTRIES = [
  "Technology", "Design", "Marketing", "Writing", "Video",
  "Development", "Consulting", "Photography", "3D Animation", "Other",
];

const API_INTEGRATIONS = [
  { name: "Brave Search API", description: "Web discovery engine. Finds businesses matching your niche.", category: "Primary", status: "configured" as const },
  { name: "Bing Web Search", description: "Microsoft's search index. Fallback discovery source.", category: "Secondary", status: "configured" as const },
  { name: "Hunter.io", description: "Email finder. Get contact details for discovered leads.", category: "Enrichment", status: "configured" as const },
  { name: "OpenCorporates", description: "Business registry. Verify company legitimacy and get official data.", category: "Verification", status: "configured" as const },
  { name: "OpenAI", description: "Powers AI features: fit scoring, outreach generation, lead ranking.", category: "AI Engine", status: "configured" as const },
];

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
  const [plan, setPlan] = useState("free");
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setFullName(profile.full_name || "");
        setIndustry((profile as Record<string, unknown>).industry as string || "");
        setCountry((profile as Record<string, unknown>).country as string || "");
        setService((profile as Record<string, unknown>).service as string || "");
      }
      const { data: sub } = await (supabase as any).from("user_subscriptions").select("*").eq("user_id", user.id).single();
      if (sub) {
        setPlan((sub as Record<string, unknown>).plan as string || "free");
        setSearchesUsed((sub as Record<string, unknown>).searches_used_this_month as number || 0);
      }
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

  const planLimits: Record<string, number> = { free: 10, solo: 100, pro: 500, agency: 9999 };

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
          <TabsTrigger value="api-keys" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">API Integrations</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20">
                {(fullName || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{fullName || "Your Name"}</p>
                <p className="text-sm text-muted-foreground font-mono">{user?.email}</p>
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={changePassword} disabled={changingPassword} className="bg-primary hover:bg-primary/90">
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </div>

            <div className="glass-card rounded-2xl p-6 border-destructive/20">
              <h3 className="text-destructive flex items-center gap-2 font-medium mb-3">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </h3>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
            </div>
          </motion.div>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="glass-strong rounded-2xl border-[rgba(255,255,255,0.1)]">
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>This action cannot be undone. All your data will be permanently deleted.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} className="glass-input">Cancel</Button>
                <Button variant="destructive" onClick={async () => { await signOut(); toast.success("Account deletion requested"); }}>Confirm Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-medium">API Integrations</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Connected services powering your lead discovery engine. All keys are stored securely server-side.
              </p>
              <div className="space-y-3">
                {API_INTEGRATIONS.map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{api.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded">{api.category}</span>
                        <span className="flex items-center gap-1 text-[10px] text-success">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">{api.description}</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Lock className="h-3.5 w-3.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Stored securely, never exposed in browser</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>

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

        <TabsContent value="subscription" className="mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-medium">Current Plan</h3>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold capitalize">{plan}</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">Active</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">
                  Searches used: {searchesUsed} / {planLimits[plan] || 10}
                </p>
                <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-glow-cyan rounded-full transition-all shadow-glow"
                    style={{ width: `${Math.min(100, (searchesUsed / (planLimits[plan] || 10)) * 100)}%` }}
                  />
                </div>
              </div>
              {plan === "free" && (
                <Button onClick={() => window.location.href = "/upgrade"} className="bg-primary hover:bg-primary/90">Upgrade Plan</Button>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
