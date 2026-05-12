import { PRESETS } from "@/constants/presets";
import type { ThemeId } from "@/types/design";
import type { ChatMessage } from "@/types/design";
import type {
  BackgroundStyle,
  BadgeLayer,
  CtaLayer,
  DesignPlan,
  Effects,
  TextLayer,
  WorkspaceSnapshot,
} from "@/types/design";
import { applyPlacementPreset } from "./applyPlacementPreset";

const THEMES_ORDER: ThemeId[] = Object.keys(PRESETS) as ThemeId[];

type PresetBundle = (typeof PRESETS)[ThemeId];

/** Lowercase lexical tokens for heuristic matching */
function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasAny(text: string, words: string[]) {
  const t = normalize(text);
  return words.some((w) => t.includes(w));
}

export function inferDesignPlan(prompt: string): DesignPlan {
  const t = normalize(prompt);

  let themeGuess: ThemeId | null = null;

  const summer = hasAny(t, ["summer", "sun", "beach", "vacation", "pool", "tropical"]);
  const luxury =
    hasAny(t, ["luxury", "luxe", "premium", "editorial", "skincare ritual", "serum"]);
  const tech = hasAny(t, ["tech", "gadget", "device", "electronics", "app", "software", "ai"]);
  const skincare = hasAny(t, ["skincare", "skin care", "glow", "hydrat", "serum"]);
  const social = hasAny(t, ["instagram", "social", "reel", "tiktok", "feed", "scroll", "story"]);
  const boldText = hasAny(t, ["bold", "big text", "loud"]);
  const clean = hasAny(t, ["clean", "ecommerce", "e-commerce", "white background", "catalog"]);

  let colorMood: DesignPlan["colorMood"] = "neutral";
  if (hasAny(t, ["warm", "golden", "amber", "sunset", "candle"])) colorMood = "warm";
  else if (hasAny(t, ["cool", "ice", "blue", "cyber"])) colorMood = "cool";
  else if (hasAny(t, ["contrast", "pop", "vibrant", "neon"])) colorMood = "high-contrast";
  else if (summer || hasAny(t, ["bright"])) colorMood = "warm";

  let typography: DesignPlan["typography"] = "elegant";
  if (boldText || social) typography = "bold";
  if (
    minimalLike(t, skincare) ||
    hasAny(t, ["minimal", "whisper"]) ||
    (!boldText && hasAny(t, ["quiet"]))
  ) {
    typography = "minimal";
  }

  let layout: DesignPlan["layout"] = "editorial";
  if (social || boldText) layout = "social-ad";
  if (clean || hasAny(t, ["minimal"])) layout = "minimal-product";

  let composition = "floating hero product";
  if (layout === "social-ad") composition = "stacked typography + anchored product";
  if (luxury || editorialLike(t)) composition = "asymmetric margins with editorial pacing";

  let backgroundHint = "soft tonal gradient mesh";
  if (summer) backgroundHint = "sunny radial wash with airy highlights";
  if (luxury || skincare) backgroundHint = "warm dark-to-mocha studio gradient";

  let ctaStyle: DesignPlan["ctaStyle"] = "punchy";
  if (luxury || editorialLike(t)) ctaStyle = "subtle";
  if (hasAny(t, ["pill", "rounded cta"])) ctaStyle = "pill";

  if (clean) themeGuess = "clean-ecommerce";
  else if ((luxury || editorialLike(t)) && !summer) themeGuess = "luxury-editorial";
  else if (summer || hasAny(t, ["promo", "sale", "summertime"])) themeGuess = "summer-promo";
  else if (social || boldText) themeGuess = "bold-social";
  else if (skincare || minimalLike(t, skincare)) themeGuess = "minimal-skincare";
  else if (tech) themeGuess = "modern-tech";
  else {
    let h = 0;
    for (let i = 0; i < t.length; i++) {
      h = (h * 31 + t.charCodeAt(i)) | 0;
    }
    themeGuess = THEMES_ORDER[Math.abs(h) % THEMES_ORDER.length] ?? "clean-ecommerce";
  }

  const summaryParts = [
    `Theme leaning: ${themeGuess.replace("-", " ")}`,
    `Color mood ${colorMood}`,
    typography === "bold" ? "Typography: confident, condensed impact" : "Typography: sculpted hierarchy",
    `Background: ${backgroundHint}`,
    `Composition: ${composition}`,
  ];

  return {
    themeGuess,
    colorMood,
    layout,
    typography,
    composition,
    backgroundHint,
    ctaStyle,
    summary: summaryParts.join(" · "),
  };
}

function editorialLike(text: string) {
  return hasAny(text, ["editorial", "magazine", "lookbook"]);
}

function minimalLike(text: string, skincare: boolean) {
  return hasAny(text, ["minimal", "quiet", "whisper"]) || skincare;
}

/** Merge preset layers + heuristic plan tuning into workspace state. */
export function patchesFromPlan(
  base: WorkspaceSnapshot,
  plan: DesignPlan,
  preset: PresetBundle,
): Partial<WorkspaceSnapshot> {
  const ls = preset.layers;
  const bg: BackgroundStyle = { ...base.background, ...ls.background };

  let headline: TextLayer = {
    ...base.headline,
    ...ls.headline,
    text: preset.headlineText ?? shortenHeadlineFromPrompt(plan.summary, base.headline.text),
  };
  headline = applyPlacementPreset(headline, headline.placementPreset);

  const cta: CtaLayer = { ...base.cta, ...ls.cta, text: preset.ctaText ?? base.cta.text };

  const badge: BadgeLayer = {
    ...base.badge,
    ...ls.badge,
    text: preset.badgeText ?? base.badge.text,
  };

  const effects: Effects = { ...base.effects, ...ls.effects };

  let productPlacement = { ...base.productPlacement, ...ls.productPlacement };

  if (plan.colorMood === "warm") {
    bg.colors = warmShift(bg.colors);
  } else if (plan.colorMood === "cool") {
    bg.colors = coolShift(bg.colors);
  } else if (plan.colorMood === "high-contrast") {
    headline.color = lightenOrDarken(plan.themeGuess ?? "bold-social");
  }

  if (plan.typography === "bold") headline.fontWeight = Math.max(headline.fontWeight, 800);
  if (plan.typography === "minimal") {
    headline.fontWeight = Math.min(headline.fontWeight, 600);
    headline.fontSize = Math.min(headline.fontSize, 34);
  }

  if (plan.ctaStyle === "pill") cta.cornerRadius = Math.max(cta.cornerRadius, 40);
  if (plan.ctaStyle === "subtle") {
    cta.backgroundColor = withAlpha(cta.backgroundColor, 0.85);
    cta.height = Math.min(cta.height, 46);
  }

  if (plan.layout === "minimal-product") {
    productPlacement = {
      ...productPlacement,
      scale: Math.min(productPlacement.scale, 1.05),
      y: productPlacement.y - 14,
    };
  }

  return {
    background: bg,
    headline,
    cta,
    badge,
    effects,
    productPlacement,
    activePreset: preset.activePreset ?? base.activePreset,
    designPlanSummary: plan.summary,
  };
}

function shortenHeadlineFromPrompt(summary: string, fallback: string) {
  const first = summary.split("·")[0]?.trim();
  return first?.length ? first.slice(0, 72) : fallback;
}

function warmShift(colors: string[]) {
  return colors.map((c) =>
    mixHex(c, "#ff9f68", colors.length <= 3 ? 0.12 : 0.06),
  );
}

function coolShift(colors: string[]) {
  return colors.map((c) => mixHex(c, "#38bdf8", 0.1));
}

function mixHex(a: string, b: string, t: number) {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  if (!pa || !pb) return a;
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `#${channel(r)}${channel(g)}${channel(bl)}`;
}

function channel(n: number) {
  return n.toString(16).padStart(2, "0");
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = Number.parseInt(h, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function withAlpha(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function lightenOrDarken(theme: ThemeId) {
  const darkThemes: ThemeId[] = ["luxury-editorial", "modern-tech"];
  return darkThemes.includes(theme) ? "#f8fafc" : "#0f172a";
}

export function summarizePlanAssistantMessage(plan: DesignPlan): Omit<ChatMessage, "role" | "id"> {
  return {
    content: [
      "**Concept locked in.** Here's what AZR inferred:",
      `- **Palette:** tuned for ${plan.colorMood} mood`,
      `- **Layout:** ${plan.layout.replace("-", " ")} with ${plan.composition}`,
      `- **Backdrop:** ${plan.backgroundHint}`,
      `- **Typography:** ${plan.typography}`,
      `\n>${plan.summary}`,
    ].join("\n"),
    timestamp: Date.now(),
  };
}
