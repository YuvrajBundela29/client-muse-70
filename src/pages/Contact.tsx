import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to send message. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Message sent successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-3">Get in Touch</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Have a question, feedback, or need support? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, title: "Email Us", desc: "support@autoclient.ai" },
              { icon: MessageSquare, title: "Live Chat", desc: "Available Mon–Fri, 10am–6pm IST" },
              { icon: HelpCircle, title: "Help Center", desc: "Browse FAQs & guides" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-6 text-center">
                <item.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-border/50 bg-card/50 p-12 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                We'll get back to you within 24 hours.
              </p>
              <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-card/50 p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What's this about?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us more..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
