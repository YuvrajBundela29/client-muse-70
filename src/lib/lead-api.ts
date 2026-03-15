import { supabase } from "@/integrations/supabase/client";
import { Lead, SearchParams } from "@/types/lead";

export async function findLeads(params: SearchParams): Promise<Lead[]> {
  const { data, error } = await supabase.functions.invoke("find-leads", {
    body: {
      industry: params.industry,
      location: params.location,
      service: params.service,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to find leads");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to find leads");
  }

  return (data.leads || []) as Lead[];
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Lead[];
}

export async function updateLeadStatusInDb(id: string, status: Lead["status"]): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
