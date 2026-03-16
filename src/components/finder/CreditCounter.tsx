import { Zap } from 'lucide-react';
import { useCreditStore } from '@/lib/credit-store';

export function CreditCounter() {
  const credits = useCreditStore((s) => s.credits);
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-medium">
        <Zap className="h-3.5 w-3.5 text-warning" />
        <span>{credits}</span>
        <span className="text-muted-foreground text-xs">Credits</span>
      </div>
      <button className="text-xs text-primary hover:underline">Buy Credits</button>
    </div>
  );
}
