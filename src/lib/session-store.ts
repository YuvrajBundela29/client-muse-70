import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionStore {
  lastSearch: { industry: string; location: string; service: string } | null;
  dailySearchCount: number;
  dailyResetDate: string;
  specialization: "agency" | "freelancer" | "consultant";
  savedLeadIds: string[];
  contactedLeadIds: string[];
  setLastSearch: (s: SessionStore["lastSearch"]) => void;
  incrementSearch: () => boolean; // returns false if limit hit
  setSpecialization: (s: SessionStore["specialization"]) => void;
  toggleSaved: (id: string) => void;
  markContacted: (id: string) => void;
  isSaved: (id: string) => boolean;
  isContacted: (id: string) => boolean;
}

const DAILY_LIMIT = 5;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      lastSearch: null,
      dailySearchCount: 0,
      dailyResetDate: todayStr(),
      specialization: "agency",
      savedLeadIds: [],
      contactedLeadIds: [],
      setLastSearch: (s) => set({ lastSearch: s }),
      incrementSearch: () => {
        const state = get();
        const today = todayStr();
        let count = state.dailySearchCount;
        if (state.dailyResetDate !== today) {
          count = 0;
        }
        if (count >= DAILY_LIMIT) return false;
        set({ dailySearchCount: count + 1, dailyResetDate: today });
        return true;
      },
      setSpecialization: (s) => set({ specialization: s }),
      toggleSaved: (id) =>
        set((state) => ({
          savedLeadIds: state.savedLeadIds.includes(id)
            ? state.savedLeadIds.filter((x) => x !== id)
            : [...state.savedLeadIds, id],
        })),
      markContacted: (id) =>
        set((state) => ({
          contactedLeadIds: state.contactedLeadIds.includes(id)
            ? state.contactedLeadIds
            : [...state.contactedLeadIds, id],
        })),
      isSaved: (id) => get().savedLeadIds.includes(id),
      isContacted: (id) => get().contactedLeadIds.includes(id),
    }),
    { name: "client-muse-session" }
  )
);
