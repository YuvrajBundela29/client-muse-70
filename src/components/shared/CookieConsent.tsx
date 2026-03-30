import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-border bg-card/95 backdrop-blur-xl p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 space-y-3">
              <p className="text-sm text-foreground">
                We use cookies to enhance your experience and analyze site usage.{" "}
                <a href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  Privacy Policy
                </a>
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={accept}>Accept</Button>
                <Button size="sm" variant="ghost" onClick={decline}>Decline</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
