import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan credit mappings
const PLAN_CREDITS: Record<string, number> = {
  trial: 25,
  micro: 50,
  starter: 200,
  pro: 600,
  elite: 99999,
  agency: 99999,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planName, credits, amount } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing payment details" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature using Web Crypto API
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (generatedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Payment verified! Now process it
    const isPlanUpgrade = planName && !planName.includes("credits");
    
    if (isPlanUpgrade) {
      const planKey = planName.toLowerCase();
      const planCredits = PLAN_CREDITS[planKey] || 200;
      
      // Update profile plan and credits
      await supabaseAdmin.from("profiles").update({
        plan: planKey,
        credits_remaining: planCredits,
      }).eq("id", userId);

      // Update subscription
      await supabaseAdmin.from("user_subscriptions").update({
        plan: planKey,
        status: "active",
        searches_used_this_month: 0,
      }).eq("user_id", userId);

      // Log transaction
      await supabaseAdmin.from("transactions").insert({
        user_id: userId,
        type: "subscription",
        amount_inr: amount || 0,
        credits: planCredits,
        description: `Upgraded to ${planName}`,
        razorpay_payment_id,
        razorpay_order_id,
        status: "success",
      });

      return new Response(
        JSON.stringify({ success: true, type: "subscription", plan: planKey, credits: planCredits }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Credit purchase
      const creditAmount = credits || 0;

      // Get current credits
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("credits_remaining")
        .eq("id", userId)
        .single();

      const newCredits = (profile?.credits_remaining || 0) + creditAmount;
      await supabaseAdmin.from("profiles").update({ credits_remaining: newCredits }).eq("id", userId);

      // Log transaction
      await supabaseAdmin.from("transactions").insert({
        user_id: userId,
        type: "credit_purchase",
        amount_inr: amount || 0,
        credits: creditAmount,
        description: `Purchased ${creditAmount} credits`,
        razorpay_payment_id,
        razorpay_order_id,
        status: "success",
      });

      return new Response(
        JSON.stringify({ success: true, type: "credits", creditsAdded: creditAmount, newBalance: newCredits }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
