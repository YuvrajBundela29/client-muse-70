import { motion } from "framer-motion";

interface AuditBarsProps {
  ux: number;
  seo: number;
  speed: number;
}

function barColor(val: number) {
  if (val >= 70) return "bg-[hsl(var(--success))]";
  if (val >= 40) return "bg-[hsl(var(--warning))]";
  return "bg-destructive";
}

function AuditBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-[10px] font-medium text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor(value)}`}
        />
      </div>
      <span className="w-7 text-right text-[10px] font-bold text-muted-foreground">{value}</span>
    </div>
  );
}

export function AuditBars({ ux, seo, speed }: AuditBarsProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Audit Snapshot</p>
      <AuditBar label="UI/UX" value={ux} />
      <AuditBar label="SEO" value={seo} />
      <AuditBar label="Speed" value={speed} />
    </div>
  );
}
