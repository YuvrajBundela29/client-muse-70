import { create } from "zustand";
import { Lead } from "@/types/lead";

interface LeadStore {
  leads: Lead[];
  addLeads: (newLeads: Lead[]) => void;
  updateLeadStatus: (id: string, status: Lead["status"]) => void;
  clearLeads: () => void;
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  addLeads: (newLeads) =>
    set((state) => ({ leads: [...newLeads, ...state.leads] })),
  updateLeadStatus: (id, status) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
    })),
  clearLeads: () => set({ leads: [] }),
}));
