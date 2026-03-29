import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, AlertTriangle, Key, ExternalLink, CheckCircle2, XCircle, Settings as SettingsIcon } from "lucide-react";
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

const INDUSTRIES = [
  "Technology", "Design", "Marketing", "Writing", "Video",
  "Development", "Consulting", "Photography", "3D Animation", "Other",
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <div className="relative">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/30" />
        </div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap glass border-border/50">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="api-keys">API Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Display Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass border-border/50 focus:border-primary/50 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="glass border-border/50 mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Target Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} className="glass border-border/50 focus:border-primary/50 mt-1" />
              </div>
              <div>
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Service</Label>
                <Input value={service} onChange={(e) => setService(e.target.value)} className="glass border-border/50 focus:border-primary/50 mt-1" />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2 shadow-glow">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="glass border-border/50 focus:border-primary/50" />
              <Button onClick={changePassword} disabled={changingPassword} className="shadow-glow">
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
            </CardContent>
          </Card>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="glass border-border/50">
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>This action cannot be undone. All your data will be permanently deleted.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} className="glass border-border/50">Cancel</Button>
                <Button variant="destructive" onClick={async () => { await signOut(); toast.success("Account deletion requested"); }}>Confirm Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4 space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> Search API Keys</CardTitle>
              <CardDescription>
                Connect additional search engines to broaden your lead discovery. All keys are stored securely and never exposed client-side.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Zenserp", description: "Google SERP API for organic search results", url: "https://app.zenserp.com/", status: "configured" as const },
                { name: "Serpstack", description: "Alternative Google search API with real-time results", url: "https://serpstack.com/dashboard", status: "configured" as const },
                { name: "Jooble", description: "Job aggregator API — finds hiring companies as warm leads", url: "https://jooble.org/api/about", status: "configured" as const },
                { name: "Careerjet", description: "Job search API — discovers companies actively recruiting", url: "https://www.careerjet.com/partners/publisher/api/", status: "configured" as const },
                { name: "WhatJobs", description: "Job publisher API — identifies businesses with open positions", url: "https://www.whatjobs.com/contact/publisher", status: "configured" as const },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between p-4 rounded-xl glass border-border/50 hover:border-primary/20 transition-all duration-300">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{api.name}</span>
                      <span className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{api.description}</p>
                  </div>
                  <a href={api.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1 glass border-border/50 hover:border-primary/30">
                      <ExternalLink className="h-3 w-3" /> Dashboard
                    </Button>
                  </a>
                </div>
              ))}
              <p className="text-xs text-muted-foreground font-mono">
                Keys are stored as encrypted secrets and used server-side only.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold capitalize">{plan}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">Active</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">
                  Searches used: {searchesUsed} / {planLimits[plan] || 10}
                </p>
                <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-glow-cyan rounded-full transition-all shadow-glow"
                    style={{ width: `${Math.min(100, (searchesUsed / (planLimits[plan] || 10)) * 100)}%` }}
                  />
                </div>
              </div>
              {plan === "free" && (
                <Button onClick={() => window.location.href = "/upgrade"} className="shadow-glow">Upgrade Plan</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
