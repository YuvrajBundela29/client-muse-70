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

    const ZENSERP_API_KEY = Deno.env.get("ZENSERP_API_KEY");
    if (!ZENSERP_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "ZENSERP_API_KEY not configured" }),
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

    // Step 1: Search for businesses using Zenserp
    const searchQuery = `${industry} businesses in ${location} that need ${service}`;
    console.log(`Zenserp search: "${searchQuery}"`);

    const zenserpParams = new URLSearchParams({
      apikey: ZENSERP_API_KEY,
      q: searchQuery,
      num: "20",
    });

    const searchResponse = await fetch(
      `https://app.zenserp.com/api/v2/search?${zenserpParams.toString()}`,
      { method: "GET" }
    );

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      console.error("Zenserp error:", searchResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `Search API error: ${searchResponse.status}` }),
        { status: searchResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchData = await searchResponse.json();
    const organicResults = searchData.organic || [];
    console.log(`Zenserp returned ${organicResults.length} organic results`);

    if (organicResults.length === 0) {
      return new Response(
        JSON.stringify({ success: true, leads: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Analyze results with AI
    const businessSummaries = organicResults
      .map((r: Record<string, string>, i: number) => {
        return `--- Result ${i + 1} ---\nURL: ${r.url || "N/A"}\nTitle: ${r.title || "N/A"}\nDescription: ${r.description || "N/A"}`;
      })
      .join("\n\n");

    const aiPrompt = `You are analyzing Google search results to find real businesses. For each result below, determine if it's an actual ${industry} business in or near ${location}. Skip directories, news articles, listicles, and aggregator pages.

Search results:
${businessSummaries}

Service being offered to them: ${service}

For each REAL business found, return a JSON array element with:
- "business_name": string (the actual business name, not the page title)
- "website": string or null (their website URL)
- "email": string or null (contact email if visible in snippet)
- "phone": string or null (phone if visible)
- "instagram_url": string or null
- "google_rating": number or null
- "website_problem": string (identify a specific problem their website/marketing likely has based on the snippet and URL)
- "growth_opportunity": string (a concrete improvement they could make)
- "recommended_service": string (recommend from: "${service}")
- "outreach_message": string (a short, personalized outreach message referencing a real detail about them)

Return ONLY a valid JSON array. No markdown. If no real businesses are found, return [].`;

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
      return new Response(
        JSON.stringify({ success: false, error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "[]";
    console.log("AI response received, parsing...");

    let leads: Record<string, unknown>[];
    try {
      const cleaned = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      leads = JSON.parse(cleaned);
    } catch {
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

    const leadsToInsert = leads.map((l) => ({
      business_name: (l.business_name as string) || "Unknown Business",
      industry,
      city: location,
      website: (l.website as string) || null,
      email: (l.email as string) || null,
      phone: (l.phone as string) || null,
      instagram_url: (l.instagram_url as string) || null,
      google_rating: (l.google_rating as number) || null,
      website_problem: (l.website_problem as string) || null,
      growth_opportunity: (l.growth_opportunity as string) || null,
      recommended_service: (l.recommended_service as string) || null,
      outreach_message: (l.outreach_message as string) || null,
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

    console.log(`Successfully saved ${insertedLeads?.length} leads via Zenserp`);

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
