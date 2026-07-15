import { useSubscription } from "@/hooks/useSubscription";

export type TierLevel = 0 | 1 | 2 | 3 | 4;

// 0 = free / trial, 1 = starter lite/micro, 2 = starter/solo, 3 = pro/professional, 4 = elite/agency
const TIER_MAP: Record<string, TierLevel> = {
  free: 0,
  trial: 0,
  micro: 1,
  starter_lite: 1,
  starter: 2,
  solo: 2,
  professional: 3,
  pro: 3,
  elite: 4,
  agency: 4,
};

export interface TierInfo {
  plan: string;
  level: TierLevel;
  isPaid: boolean;
  label: string;
  auraClass: string;         // outer wrap glow
  borderClass: string;       // border accent
  ringClass: string;         // focus/decorative ring
  badgeClass: string;        // badge pill
  gradientText: string;      // heading gradient
}

const LABELS: Record<TierLevel, string> = {
  0: "Free",
  1: "Starter Lite",
  2: "Starter",
  3: "Pro",
  4: "Elite",
};

// Neon Aurora scale — each tier layers more shimmer/glow
const AURA: Record<TierLevel, string> = {
  0: "",
  1: "tier-aura-1",
  2: "tier-aura-2",
  3: "tier-aura-3",
  4: "tier-aura-4",
};
const BORDER: Record<TierLevel, string> = {
  0: "",
  1: "border-primary/25",
  2: "border-primary/40",
  3: "border-primary/60",
  4: "border-transparent tier-border-elite",
};
const RING: Record<TierLevel, string> = {
  0: "",
  1: "ring-1 ring-primary/20",
  2: "ring-1 ring-primary/35",
  3: "ring-2 ring-primary/50",
  4: "ring-2 ring-[hsl(166_72%_45%/0.55)]",
};
const BADGE: Record<TierLevel, string> = {
  0: "bg-muted/40 text-muted-foreground border border-border",
  1: "bg-primary/10 text-primary border border-primary/25",
  2: "bg-primary/15 text-primary border border-primary/35",
  3: "tier-badge-pro",
  4: "tier-badge-elite",
};
const GRAD: Record<TierLevel, string> = {
  0: "",
  1: "text-primary",
  2: "text-gradient",
  3: "text-gradient",
  4: "text-gradient tier-text-elite",
};

export function useTier(): TierInfo {
  const { plan } = useSubscription();
  const level = (TIER_MAP[plan] ?? 0) as TierLevel;
  return {
    plan,
    level,
    isPaid: level >= 1,
    label: LABELS[level],
    auraClass: AURA[level],
    borderClass: BORDER[level],
    ringClass: RING[level],
    badgeClass: BADGE[level],
    gradientText: GRAD[level],
  };
}
