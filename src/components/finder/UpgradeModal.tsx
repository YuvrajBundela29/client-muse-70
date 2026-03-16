import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Crown } from 'lucide-react';

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
            Upgrade to Pro for unlimited email reveals and priority access to verified contacts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button className="w-full gap-2" size="lg">
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
