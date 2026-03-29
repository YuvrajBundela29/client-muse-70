import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead_id } = await req.json();
    if (!lead_id) {
      return new Response(JSON.stringify({ error: "lead_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lead
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadErr || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Scrape website if available
    let websiteContent = "";
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (lead.website && firecrawlKey) {
      try {
        let url = lead.website.trim();
        if (!url.startsWith("http")) url = `https://${url}`;
        
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        });
        const scrapeData = await scrapeRes.json();
        websiteContent = scrapeData?.data?.markdown || scrapeData?.markdown || "";
        if (websiteContent.length > 3000) websiteContent = websiteContent.slice(0, 3000);
      } catch (e) {
        console.error("Scrape failed:", e);
      }
    }

    // Generate emails using AI
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are an elite B2B outreach copywriter for a freelancer/agency.

LEAD DATA:
- Business: ${lead.business_name}
- Industry: ${lead.industry}
- City: ${lead.city}
- Website: ${lead.website || "none"}
- Email: ${lead.email || "none"}
- Problem: ${lead.website_problem || "unknown"}
- Opportunity: ${lead.growth_opportunity || "unknown"}
- Rating: ${lead.google_rating || "unknown"}
- Recommended Service: ${lead.recommended_service || "unknown"}

${websiteContent ? `WEBSITE CONTENT (scraped):\n${websiteContent}\n` : ""}

Generate 3 personalized outreach email variants tailored to the lead's industry and the recommended service. Each must:
- Reference something SPECIFIC from the data above
- Be under 200 words
- Sound human, not templated
- Include a specific value proposition based on the recommended service and the lead's actual problems

Return a JSON object with these exact keys:
{
  "professional": "...",
  "friendly": "...", 
  "aggressive": "...",
  "email_type": "general|press|sales|direct",
  "follow_up_day4": "one-line bump email",
  "follow_up_day7": "phone call script (3 sentences)",
  "follow_up_day10": "final closing email"
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a world-class B2B outreach specialist. Always return valid JSON only." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_emails",
            description: "Generate personalized email variants",
            parameters: {
              type: "object",
              properties: {
                professional: { type: "string" },
                friendly: { type: "string" },
                aggressive: { type: "string" },
                email_type: { type: "string", enum: ["general", "press", "sales", "direct"] },
                follow_up_day4: { type: "string" },
                follow_up_day7: { type: "string" },
                follow_up_day10: { type: "string" },
              },
              required: ["professional", "friendly", "aggressive", "email_type"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_emails" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiRes.text();
      console.error("AI error:", status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let emails;
    if (toolCall?.function?.arguments) {
      emails = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from content
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      emails = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!emails) {
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      emails: {
        professional: emails.professional,
        friendly: emails.friendly,
        aggressive: emails.aggressive,
      },
      email_type: emails.email_type,
      follow_ups: {
        day4: emails.follow_up_day4,
        day7: emails.follow_up_day7,
        day10: emails.follow_up_day10,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-client error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
