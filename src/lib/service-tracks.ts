const TRACK_KEYWORDS: Record<string, string[]> = {
  track_a: ["beauty", "skincare", "cosmetics", "derma", "skin", "spa", "wellness", "clinic", "medical"],
  track_b: ["cloth", "fashion", "apparel", "wear", "boutique", "textile", "garment"],
  track_c: ["promo", "promotional", "e-commerce", "ecommerce", "product", "restaurant", "food", "hospitality", "retail", "shop", "store"],
  track_d: ["it", "technology", "software", "data", "saas", "tech", "digital", "cyber", "ai", "cloud"],
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
    track_a: "Track A — 3D Medical Animation",
    track_b: "Track B — AI Influencer Reels",
    track_c: "Track C — Product Reveal Reels",
    track_d: "Track D — Technical Explainer",
  };
  return labels[trackId] || trackId;
}

export function getTrackEmoji(trackId: string): string {
  const emojis: Record<string, string> = {
    track_a: "🧬",
    track_b: "👗",
    track_c: "📦",
    track_d: "💻",
  };
  return emojis[trackId] || "🎬";
}
