import { create } from 'zustand';

interface CreditStore {
  credits: number;
  useCredit: () => boolean;
  addCredits: (n: number) => void;
}

export const useCreditStore = create<CreditStore>((set, get) => ({
  credits: 47,
  useCredit: () => {
    if (get().credits <= 0) return false;
    set((s) => ({ credits: s.credits - 1 }));
    return true;
  },
  addCredits: (n) => set((s) => ({ credits: s.credits + n })),
}));
