import { motion } from "framer-motion";
import { Search, Filter, DollarSign, ArrowRight } from "lucide-react";

const STAGES = [
  { label: "Searches", value: "247", icon: Search, accent: "hsl(238, 75%, 64%)" },
  { label: "Qualified", value: "89", icon: Filter, accent: "hsl(38, 92%, 50%)" },
  { label: "Revenue", value: "$12.4K", icon: DollarSign, accent: "hsl(166, 72%, 45%)" },
];

export function RevenueFlow() {
  return (
    <div className="glass-card p-5 mb-6">
      <p className="section-label mb-4">Revenue Pipeline Flow</p>
      <div className="flex items-center justify-between gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-2 flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 flex-1 rounded-xl p-3 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${stage.accent}1A` }}>
                <stage.icon className="h-4 w-4" style={{ color: stage.accent }} />
              </div>
              <div>
                <p className="text-lg font-bold font-mono">{stage.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stage.label}</p>
              </div>
            </motion.div>
            {i < STAGES.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
