import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchResult {
  title: string;
  url: string;
  description: string;
  source: string;
}

// --- Source fetchers ---

async function fetchZenserp(query: string): Promise<SearchResult[]> {
  const key = Deno.env.get("ZENSERP_API_KEY");
  if (!key) return [];
  try {
    const params = new URLSearchParams({ apikey: key, q: query, num: "15" });
    const res = await fetch(`https://app.zenserp.com/api/v2/search?${params}`);
    if (!res.ok) { await res.text(); return []; }
    const data = await res.json();
    return (data.organic || []).map((r: Record<string, string>) => ({
      title: r.title || "", url: r.url || "", description: r.description || "", source: "zenserp",
    }));
  } catch (e) { console.error("Zenserp error:", e); return []; }
}

async function fetchSerpstack(query: string): Promise<SearchResult[]> {
  const key = Deno.env.get("SERPSTACK_API_KEY");
  if (!key) return [];
  try {
    const params = new URLSearchParams({ access_key: key, query, num: "15" });
    const res = await fetch(`http://api.serpstack.com/search?${params}`);
    if (!res.ok) { await res.text(); return []; }
    const data = await res.json();
    return (data.organic_results || []).map((r: Record<string, string>) => ({
      title: r.title || "", url: r.url || "", description: r.snippet || "", source: "serpstack",
    }));
  } catch (e) { console.error("Serpstack error:", e); return []; }
}

async function fetchJooble(industry: string, location: string): Promise<SearchResult[]> {
  const key = Deno.env.get("JOOBLE_API_KEY");
  if (!key) return [];
  try {
    const res = await fetch(`https://jooble.org/api/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: industry, location, page: 1 }),
    });
    if (!res.ok) { await res.text(); return []; }
    const data = await res.json();
    return (data.jobs || []).slice(0, 15).map((j: Record<string, string>) => ({
      title: j.title || "", url: j.link || "", description: `${j.company || ""} - ${j.snippet || ""}`, source: "jooble",
    }));
  } catch (e) { console.error("Jooble error:", e); return []; }
}

async function fetchCareerjet(industry: string, location: string): Promise<SearchResult[]> {
  const affid = Deno.env.get("CAREERJET_AFFILIATE_ID");
  if (!affid) return [];
  try {
    const params = new URLSearchParams({
      affid, keywords: industry, location, pagesize: "15", page: "1", sort: "date",
    });
    const res = await fetch(`http://public.api.careerjet.net/search?${params}`);
    if (!res.ok) { await res.text(); return []; }
    const data = await res.json();
    return (data.jobs || []).map((j: Record<string, string>) => ({
      title: j.title || "", url: j.url || "", description: `${j.company || ""} - ${j.description || ""}`, source: "careerjet",
    }));
  } catch (e) { console.error("Careerjet error:", e); return []; }
}

async function fetchWhatJobs(industry: string, location: string): Promise<SearchResult[]> {
  const key = Deno.env.get("WHATJOBS_API_KEY");
  if (!key) return [];
  try {
    const params = new URLSearchParams({ api_key: key, keywords: industry, location, results_per_page: "15" });
    const res = await fetch(`https://api.whatjobs.com/api/v1/search?${params}`);
    if (!res.ok) { await res.text(); return []; }
    const data = await res.json();
    return (data.data || data.results || []).slice(0, 15).map((j: Record<string, string>) => ({
      title: j.title || "", url: j.url || j.redirect_url || "", description: `${j.company || ""} - ${j.description || ""}`, source: "whatjobs",
    }));
  } catch (e) { console.error("WhatJobs error:", e); return []; }
}

// --- Main handler ---

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Fetch from all configured sources in parallel
    const searchQuery = `${industry} businesses in ${location} that need ${service}`;
    console.log(`Multi-source search: "${searchQuery}"`);

    const allResults = await Promise.all([
      fetchZenserp(searchQuery),
      fetchSerpstack(searchQuery),
      fetchJooble(industry, location),
      fetchCareerjet(industry, location),
      fetchWhatJobs(industry, location),
    ]);

    const combined: SearchResult[] = allResults.flat();
    console.log(`Total results from all sources: ${combined.length} (${allResults.map((r, i) => `${["zenserp","serpstack","jooble","careerjet","whatjobs"][i]}:${r.length}`).join(", ")})`);

    // Deduplicate by URL
    const seen = new Set<string>();
    const unique = combined.filter((r) => {
      const key = r.url.replace(/\/$/, "").toLowerCase();
      if (seen.has(key) || !key) return false;
      seen.add(key);
      return true;
    });

    if (unique.length === 0) {
      return new Response(
        JSON.stringify({ success: true, leads: [], sources_queried: allResults.map((r, i) => ({ source: ["zenserp","serpstack","jooble","careerjet","whatjobs"][i], count: r.length })) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: AI analysis
    const businessSummaries = unique.slice(0, 30)
      .map((r, i) => `--- Result ${i + 1} [${r.source}] ---\nURL: ${r.url}\nTitle: ${r.title}\nDescription: ${r.description}`)
      .join("\n\n");

    const aiPrompt = `You are analyzing search results from multiple sources (Google, job boards) to find real businesses. For each result, determine if it represents an actual ${industry} business in or near ${location}. Job postings indicate a hiring company — extract the company as a lead. Skip directories, aggregator pages, and duplicates.

Search results:
${businessSummaries}

Service being offered to them: ${service}

For each REAL business found, return a JSON array element with:
- "business_name": string
- "website": string or null
- "email": string or null
- "phone": string or null
- "instagram_url": string or null
- "google_rating": number or null
- "website_problem": string (identify a specific problem)
- "growth_opportunity": string (a concrete improvement)
- "recommended_service": string (recommend from: "${service}")
- "outreach_message": string (personalized outreach referencing a real detail)

Return ONLY a valid JSON array. No markdown. If no real businesses found, return [].`;

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

    // Step 3: Store in database
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

    console.log(`Saved ${insertedLeads?.length} leads from ${unique.length} unique results`);

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
