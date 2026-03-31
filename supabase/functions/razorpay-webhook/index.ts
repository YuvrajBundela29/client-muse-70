import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const PLAN_CREDITS: Record<string, number> = {
  trial: 25,
  micro: 50,
  starter: 200,
  pro: 600,
  elite: 99999,
  agency: 99999,
};

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bodyText = await req.text();
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyWebhookSignature(bodyText, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    if (event !== "payment.captured") {
      // We only process captured payments
      return new Response(JSON.stringify({ status: "ignored", event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = payload.payload?.payment?.entity;
    if (!payment) {
      return new Response(JSON.stringify({ error: "No payment entity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const orderId = payment.order_id;
    const paymentId = payment.id;

    // Check if already processed (idempotency)
    const { data: existingTx } = await adminClient
      .from("transactions")
      .select("id")
      .eq("razorpay_payment_id", paymentId)
      .eq("status", "success")
      .maybeSingle();

    if (existingTx) {
      return new Response(JSON.stringify({ status: "already_processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find pending transaction by order_id
    const { data: pendingTx } = await adminClient
      .from("transactions")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .eq("status", "pending")
      .maybeSingle();

    if (!pendingTx) {
      // No pending tx found — this may have been processed by client-side verify already
      console.log("No pending transaction for order:", orderId);
      return new Response(JSON.stringify({ status: "no_pending_tx" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = pendingTx.user_id;
    const planName = pendingTx.description || "";
    const isPlanUpgrade = pendingTx.type === "subscription";

    if (isPlanUpgrade) {
      const planKey = planName.replace("Upgraded to ", "").toLowerCase();
      const planCredits = PLAN_CREDITS[planKey] || 200;

      await adminClient.from("profiles").update({
        plan: planKey,
        credits_remaining: planCredits,
      }).eq("id", userId);

      await adminClient.from("user_subscriptions").update({
        plan: planKey,
        status: "active",
        searches_used_this_month: 0,
      }).eq("user_id", userId);
    } else {
      const creditAmount = pendingTx.credits || 0;
      const { data: profile } = await adminClient
        .from("profiles")
        .select("credits_remaining")
        .eq("id", userId)
        .single();

      const newCredits = (profile?.credits_remaining || 0) + creditAmount;
      await adminClient.from("profiles").update({ credits_remaining: newCredits }).eq("id", userId);
    }

    // Mark transaction as success
    await adminClient.from("transactions").update({
      razorpay_payment_id: paymentId,
      status: "success",
    }).eq("id", pendingTx.id);

    console.log("Webhook processed successfully for order:", orderId);
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
