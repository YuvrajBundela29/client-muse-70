import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Crown, Shield, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <Zap className="h-6 w-6 text-warning" />
          </div>
          <DialogTitle className="text-center">You've used all your credits</DialogTitle>
          <DialogDescription className="text-center">
            Upgrade to unlock more searches, AI emails, and priority access to verified contacts.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center mb-2">
          <p className="text-xs text-muted-foreground">Investment Calculator</p>
          <p className="text-sm">
            <span className="text-primary font-bold">₹1,299/mo</span> → Average <span className="text-success font-bold">₹1,24,000</span> in 6 months = <span className="text-warning font-bold">95× ROI</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground mb-2">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,847+ users</span>
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /> 95× ROI</span>
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 60-day guarantee</span>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Link to="/upgrade" className="w-full">
            <Button className="w-full gap-2 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow font-bold" size="lg">
              <Crown className="h-4 w-4" />
              See All Plans
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
