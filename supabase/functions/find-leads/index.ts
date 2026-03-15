import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, location, service } = await req.json();

    if (!industry || !location || !service) {
      return new Response(
        JSON.stringify({ success: false, error: "industry, location, and service are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Search for businesses using Firecrawl
    console.log(`Searching for: ${industry} in ${location}`);
    const searchQuery = `${industry} in ${location} website contact`;

    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error("Firecrawl search error:", searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || "Search failed" }),
        { status: searchResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = searchData.data || [];
    console.log(`Found ${results.length} search results`);

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ success: true, leads: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Analyze each result with AI
    const businessSummaries = results
      .map((r: any, i: number) => {
        const content = (r.markdown || "").slice(0, 1500);
        return `--- Business ${i + 1} ---\nURL: ${r.url || "N/A"}\nTitle: ${r.title || "N/A"}\nDescription: ${r.description || "N/A"}\nContent:\n${content}`;
      })
      .join("\n\n");

    const aiPrompt = `You are analyzing businesses found online. For each business below, extract and analyze their information.

Industry: ${industry}
Location: ${location}
Service being offered to them: ${service}

${businessSummaries}

For EACH business, return a JSON array where each element has:
- "business_name": string (the business name)
- "website": string or null (their website URL)
- "email": string or null (contact email if found)
- "phone": string or null (phone number if found)
- "instagram_url": string or null (Instagram link if found)
- "google_rating": number or null (rating if mentioned)
- "website_problem": string (identify a specific marketing/website problem)
- "growth_opportunity": string (suggest a specific improvement opportunity)
- "recommended_service": string (recommend a specific service from: "${service}")
- "outreach_message": string (a short, friendly, personalized outreach message referencing the detected problem and suggesting the service)

Only include businesses that are actual ${industry} businesses in or near ${location}. Skip irrelevant results like directories or news articles.

Return ONLY a valid JSON array, no markdown formatting.`;

    console.log("Calling AI for analysis...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a business analyst. Return only valid JSON arrays. No markdown code blocks." },
          { role: "user", content: aiPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "[]";
    console.log("AI response received, parsing...");

    // Parse AI response - handle potential markdown wrapping
    let leads: any[];
    try {
      const cleaned = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      leads = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", aiContent.slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse AI analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(leads) || leads.length === 0) {
      return new Response(
        JSON.stringify({ success: true, leads: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Store leads in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const leadsToInsert = leads.map((l: any) => ({
      business_name: l.business_name || "Unknown Business",
      industry,
      city: location,
      website: l.website || null,
      email: l.email || null,
      phone: l.phone || null,
      instagram_url: l.instagram_url || null,
      google_rating: l.google_rating || null,
      website_problem: l.website_problem || null,
      growth_opportunity: l.growth_opportunity || null,
      recommended_service: l.recommended_service || null,
      outreach_message: l.outreach_message || null,
      status: "new",
    }));

    const { data: insertedLeads, error: insertError } = await supabase
      .from("leads")
      .insert(leadsToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save leads" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully saved ${insertedLeads?.length} leads`);

    return new Response(
      JSON.stringify({ success: true, leads: insertedLeads }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("find-leads error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
