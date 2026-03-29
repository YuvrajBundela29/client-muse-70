import { supabase } from "@/integrations/supabase/client";

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export interface PipelineEntry {
  id: string;
  lead_id: string;
  pipeline_status: string;
  service_track: string | null;
  recommended_package: string | null;
  email_sent_date: string | null;
  follow_up_day: number | null;
  notes: string | null;
  priority_rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineWithLead extends PipelineEntry {
  lead: {
    id: string;
    business_name: string;
    industry: string;
    city: string;
    website: string | null;
    email: string | null;
    phone: string | null;
    instagram_url: string | null;
    google_rating: number | null;
    website_problem: string | null;
    growth_opportunity: string | null;
    recommended_service: string | null;
    outreach_message: string | null;
    status: string;
    created_at: string;
  };
}

export async function fetchPipeline(): Promise<PipelineWithLead[]> {
  const { data, error } = await supabase
    .from("client_pipeline")
    .select("*, lead:leads(*)")
    .order("priority_rank", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data || []) as unknown as PipelineWithLead[];
}

export async function upsertPipelineEntry(
  leadId: string,
  fields: Partial<Omit<PipelineEntry, "id" | "lead_id" | "created_at" | "updated_at">>
): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from("client_pipeline")
    .upsert(
      { lead_id: leadId, user_id: userId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: "lead_id" }
    );
  if (error) throw new Error(error.message);
}

export async function updatePipelineStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("client_pipeline")
    .update({ pipeline_status: status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePipelineEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from("client_pipeline")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

