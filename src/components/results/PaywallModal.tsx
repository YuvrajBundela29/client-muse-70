import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, X, Crown, Shield, TrendingUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 inline-flex rounded-full bg-warning/10 p-4">
              <Lock className="h-8 w-8 text-warning" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">You've Hit Your Limit</h2>
            <p className="mb-2 text-muted-foreground">
              You've used all <span className="font-bold text-foreground">5 free searches</span> for today.
            </p>
            <p className="mb-2 text-sm text-destructive font-medium">
              ⚠️ You've missed 12 perfect leads this week
            </p>

            {/* ROI calculator */}
            <div className="mb-4 rounded-xl bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground mb-1">Investment Calculator</p>
              <p className="text-sm">
                <span className="text-primary font-bold">$49/mo</span> → Average <span className="text-success font-bold">$3,200</span> extra/mo = <span className="text-warning font-bold">65× ROI</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,400+ users</span>
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /> 65× avg ROI</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Money-back</span>
            </div>

            <Link to="/upgrade">
              <Button size="lg" className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 animate-glow-pulse">
                <Crown className="h-5 w-5" /> Upgrade to Pro — $49/mo
              </Button>
            </Link>

            <p className="mt-2 text-[10px] text-warning">
              ⏰ Only 7 Pro slots left this month
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Or come back tomorrow for 5 more free searches.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
