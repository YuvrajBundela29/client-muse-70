export interface Package {
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface ServiceTrack {
  id: string;
  name: string;
  description: string;
  packages: Package[];
}

export const SERVICE_TRACKS: Record<string, ServiceTrack> = {
  track_a: {
    id: "track_a",
    name: "3D Medical Animation",
    description: "Skincare / Beauty Science",
    packages: [
      {
        name: "Starter",
        description: "1 × 30-sec reel, 2 formats (9:16 + 16:9), 2 revisions",
        price: 450,
        features: ["1 × 30-sec reel", "2 formats (9:16 + 16:9)", "2 revisions"],
      },
      {
        name: "Pro",
        description: "1 × 45-sec reel, voiceover, 3 formats, 3 revisions",
        price: 900,
        features: ["1 × 45-sec reel", "Voiceover included", "3 formats", "3 revisions"],
      },
      {
        name: "Bundle",
        description: "3 reels, all formats, voiceover included",
        price: 2200,
        features: ["3 reels", "All formats", "Voiceover included"],
      },
      {
        name: "Retainer",
        description: "2 reels/month ongoing",
        price: 1500,
        features: ["2 reels/month", "All formats", "Priority support"],
      },
    ],
  },
  track_b: {
    id: "track_b",
    name: "AI Influencer Reels",
    description: "Fashion / Clothing",
    packages: [
      {
        name: "Starter",
        description: "3 × 15-sec lifestyle reels",
        price: 400,
        features: ["3 × 15-sec reels", "Lifestyle format"],
      },
      {
        name: "Pro",
        description: "5 × 30-sec styled reels, 2 formats",
        price: 850,
        features: ["5 × 30-sec reels", "Styled content", "2 formats"],
      },
      {
        name: "Bundle",
        description: "10 reels, mixed formats",
        price: 1800,
        features: ["10 reels", "Mixed formats", "Brand kit"],
      },
    ],
  },
  track_c: {
    id: "track_c",
    name: "Product Reveal Reels",
    description: "Promotional / E-commerce",
    packages: [
      {
        name: "Starter",
        description: "1 × 20-sec unboxing reel",
        price: 350,
        features: ["1 × 20-sec reel", "Unboxing format"],
      },
      {
        name: "Pro",
        description: "3 × product reels, mixed formats",
        price: 800,
        features: ["3 product reels", "Mixed formats"],
      },
      {
        name: "Bundle",
        description: "5 reels + brand kit",
        price: 1600,
        features: ["5 reels", "Brand kit included"],
      },
    ],
  },
  track_d: {
    id: "track_d",
    name: "Technical Explainer",
    description: "IT / B2B",
    packages: [
      {
        name: "Starter",
        description: "1 × 60-sec explainer",
        price: 600,
        features: ["1 × 60-sec explainer"],
      },
      {
        name: "Pro",
        description: "1 × 90-sec with voiceover and motion graphics",
        price: 1200,
        features: ["1 × 90-sec explainer", "Voiceover", "Motion graphics"],
      },
      {
        name: "Bundle",
        description: "3 explainers",
        price: 2800,
        features: ["3 explainers", "All formats"],
      },
    ],
  },
};

export function getRecommendedPackage(confidence: number): string {
  if (confidence >= 90) return "Pro";
  if (confidence >= 75) return "Starter";
  return "Starter";
}
