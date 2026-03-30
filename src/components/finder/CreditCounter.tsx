import { Zap } from 'lucide-react';
import { useCredits, CREDIT_COSTS } from '@/hooks/useCredits';
import { Link } from 'react-router-dom';

export function CreditCounter() {
  const { credits, loading } = useCredits();
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-medium">
        <Zap className="h-3.5 w-3.5 text-warning" />
        <span>{loading ? "—" : credits}</span>
        <span className="text-muted-foreground text-xs">Credits</span>
      </div>
      <Link to="/upgrade" className="text-xs text-primary hover:underline">Buy Credits</Link>
    </div>
  );
}
