import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, AlertTriangle } from "lucide-react";
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name || "");
        setIndustry((profile as Record<string, unknown>).industry as string || "");
        setCountry((profile as Record<string, unknown>).country as string || "");
        setService((profile as Record<string, unknown>).service as string || "");
      }
      const { data: sub } = await supabase
        .from("user_subscriptions" as string)
        .select("*")
        .eq("user_id", user.id)
        .single();
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
    await supabase
      .from("profiles")
      .update({ full_name: fullName, industry, country, service } as Record<string, unknown>)
      .eq("id", user.id);
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
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div>
                <Label>Service</Label>
                <Input value={service} onChange={(e) => setService(e.target.value)} />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={changePassword} disabled={changingPassword}>
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => { await signOut(); toast.success("Account deletion requested"); }}>
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold capitalize">{plan}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Active</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Searches used: {searchesUsed} / {planLimits[plan] || 10}
                </p>
                <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, (searchesUsed / (planLimits[plan] || 10)) * 100)}%` }}
                  />
                </div>
              </div>
              {plan === "free" && (
                <Button onClick={() => window.location.href = "/upgrade"}>
                  Upgrade Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
