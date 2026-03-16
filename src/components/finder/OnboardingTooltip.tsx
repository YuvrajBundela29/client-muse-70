import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  { title: 'Search your niche', description: 'Use the search bar or presets to find companies in your target market.', position: 'top' },
  { title: 'Filter your ideal client', description: 'Narrow results by industry, size, seniority, and more.', position: 'left' },
  { title: 'Reveal contact & reach out', description: 'Click "Reveal" to unlock emails, then start your outreach.', position: 'center' },
] as const;

const STORAGE_KEY = 'finder-onboarding-done';

export function OnboardingTooltip() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep(step + 1);
    }
  };

  if (!visible) return null;

  const s = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
        onClick={dismiss}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-80 rounded-xl bg-card p-5 shadow-card-hover"
        >
          <button onClick={dismiss} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {step + 1}
            </span>
            <h3 className="text-sm font-semibold">{s.title}</h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <Button size="sm" className="h-7 text-xs" onClick={next}>
              {step >= STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
