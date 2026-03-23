import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reply_text, lead_context } = await req.json();

    if (!reply_text) {
      return new Response(JSON.stringify({ error: "reply_text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Classify this client reply and generate an appropriate response.

CLIENT CONTEXT:
- Business: ${lead_context?.business_name || "Unknown"}
- Industry: ${lead_context?.industry || "Unknown"}

CLIENT REPLY:
"${reply_text}"

REPLY TYPES:
- WARM INTEREST: "interesting", "tell me more", "what does this cost"
- PRICING REQUEST: "how much", "rates", "pricing"
- PORTFOLIO REQUEST: "see more work", "examples"
- OBJECTION BUDGET: "too expensive", "not in budget"
- OBJECTION TIMING: "not right now", "maybe later"
- WRONG INBOX: automated CS reply, unrelated
- SOFT NO: "we handle internally", "not looking"
- HARD NO: "please remove me", "unsubscribe"

Classify the reply and generate the exact word-for-word response to send back. The response should be for a 3D animation producer offering content services.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You classify client replies and generate appropriate responses. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_reply",
            description: "Classify a client reply and suggest a response",
            parameters: {
              type: "object",
              properties: {
                classification: { type: "string", enum: [
                  "WARM INTEREST", "PRICING REQUEST", "PORTFOLIO REQUEST",
                  "OBJECTION BUDGET", "OBJECTION TIMING", "WRONG INBOX",
                  "SOFT NO", "HARD NO"
                ]},
                suggestedReply: { type: "string" },
                nextAction: { type: "string" },
                pipelineStatus: { type: "string", enum: [
                  "replied", "call_booked", "closed", "no_response", "rejected"
                ]},
              },
              required: ["classification", "suggestedReply", "nextAction", "pipelineStatus"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_reply" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI classification failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!result) {
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
