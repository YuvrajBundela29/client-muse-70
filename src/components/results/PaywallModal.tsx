import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Daily Limit Reached</h2>
            <p className="mb-2 text-muted-foreground">
              You've used all <span className="font-bold text-foreground">5 free searches</span> for today.
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              Upgrade to Pro for unlimited AI-powered client discovery, priority research, and advanced filters.
            </p>
            <Button size="lg" className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25">
              <Zap className="h-5 w-5" /> Upgrade to Pro — $49/mo
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Or come back tomorrow for 5 more free searches.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
