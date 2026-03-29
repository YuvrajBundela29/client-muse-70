import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Shield, Zap } from "lucide-react";

const STORIES = [
  { text: "John S. closed an $8K deal from a lead found here", icon: TrendingUp },
  { text: "Sarah from NYC just found 3 qualified leads", icon: Zap },
  { text: "Mark upgraded to Pro — booked 5 calls this week", icon: TrendingUp },
  { text: "Agency in London closed $12K from pipeline leads", icon: TrendingUp },
  { text: "43,829 leads found today • 99.9% uptime", icon: Shield },
  { text: "Top 1% freelancers use AutoClient AI to win clients", icon: Zap },
];

export function SuccessTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % STORIES.length), 4500);
    return () => clearInterval(interval);
  }, []);

  const story = STORIES[idx];
  return (
    <div className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-success/5 border border-success/10 mb-6">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-xs text-success font-medium font-mono"
        >
          <story.icon className="inline h-3 w-3 mr-1 -mt-0.5" />
          {story.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
