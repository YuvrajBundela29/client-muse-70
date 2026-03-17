import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "23 leads found in the last 10 minutes",
  "An agency in Miami just discovered 8 new clients",
  "Freelancer in London closed a deal from leads found here",
  "47 businesses analyzed in the last hour",
  "Consultant in NYC exported 12 leads just now",
  "Agencies using this closed 3 deals today",
];

export function LiveActivity() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--success))] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-xs text-muted-foreground"
        >
          {MESSAGES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
