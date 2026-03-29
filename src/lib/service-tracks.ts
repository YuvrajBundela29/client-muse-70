const TRACK_KEYWORDS: Record<string, string[]> = {
  track_web: ["web", "website", "design", "development", "wordpress", "shopify", "landing page"],
  track_seo: ["seo", "search engine", "google", "ranking", "organic", "backlink"],
  track_social: ["social", "instagram", "facebook", "tiktok", "content", "influencer", "marketing"],
  track_consulting: ["consult", "strategy", "business", "management", "analytics", "data"],
};

export function detectServiceTrack(industry: string, opportunity?: string | null): string | null {
  const text = `${industry} ${opportunity || ""}`.toLowerCase();

  for (const [track, keywords] of Object.entries(TRACK_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return track;
    }
  }
  return null;
}

export function getTrackLabel(trackId: string): string {
  const labels: Record<string, string> = {
    track_web: "Web Design & Development",
    track_seo: "SEO & Search Optimization",
    track_social: "Social Media & Content",
    track_consulting: "Business Consulting & Strategy",
  };
  return labels[trackId] || trackId;
}

export function getTrackEmoji(trackId: string): string {
  const emojis: Record<string, string> = {
    track_web: "🌐",
    track_seo: "📈",
    track_social: "📱",
    track_consulting: "💼",
  };
  return emojis[trackId] || "🎯";
}
