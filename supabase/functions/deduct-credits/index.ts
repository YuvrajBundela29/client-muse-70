import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  search: 1,
  ai_email: 2,
  intelligence_report: 3,
  contact_unlock: 5,
  classify_reply: 2,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { action } = await req.json();
    if (!action || !CREDIT_COSTS[action]) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cost = CREDIT_COSTS[action];

    // Use service role to read and update credits atomically
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("credits_remaining, plan")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Elite/agency plans have unlimited credits
    if (["elite", "agency"].includes(profile.plan)) {
      // Log transaction but don't deduct
      await adminClient.from("transactions").insert({
        user_id: userId,
        type: "credit_usage",
        amount_inr: 0,
        credits: -cost,
        description: `Used ${cost} credit${cost > 1 ? "s" : ""} for ${action.replace(/_/g, " ")} (unlimited plan)`,
        status: "success",
      });

      return new Response(JSON.stringify({
        success: true,
        credits_remaining: profile.credits_remaining,
        cost,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.credits_remaining < cost) {
      return new Response(JSON.stringify({
        error: "Insufficient credits",
        credits_remaining: profile.credits_remaining,
        cost,
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newBalance = profile.credits_remaining - cost;

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ credits_remaining: newBalance })
      .eq("id", userId)
      .eq("credits_remaining", profile.credits_remaining); // optimistic lock

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to deduct credits, please retry" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log transaction
    await adminClient.from("transactions").insert({
      user_id: userId,
      type: "credit_usage",
      amount_inr: 0,
      credits: -cost,
      description: `Used ${cost} credit${cost > 1 ? "s" : ""} for ${action.replace(/_/g, " ")}`,
      status: "success",
    });

    return new Response(JSON.stringify({
      success: true,
      credits_remaining: newBalance,
      cost,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
