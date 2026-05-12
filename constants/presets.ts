import type { ThemeId } from "@/types/design";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./canvas";

/** Default center position for hero product — design space coords. */
const cx = CANVAS_WIDTH / 2;
const cy = CANVAS_HEIGHT * 0.48;

export interface PresetOverride {
  label: string;
  description: string;
  headlineText: string;
  ctaText: string;
  badgeText?: string;
  activePreset: ThemeId;
}

export interface PresetLayerPatch {
  background: Partial<{
    kind: "gradient" | "solid" | "pattern";
    gradientAngle: number;
    colors: string[];
    solidColor: string;
    pattern: "dots" | "lines" | "mesh" | "none";
    patternOpacity: number;
    backdropTint: string;
    blurBackdrop: boolean;
    backdropBlurStrength: number;
  }>;
  headline: Partial<{
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    placementPreset: "top" | "center" | "bottom";
    align: "left" | "center" | "right";
  }>;
  cta: Partial<{
    visible: boolean;
    backgroundColor: string;
    color: string;
    cornerRadius: number;
    width: number;
    height: number;
  }>;
  badge: Partial<{
    visible: boolean;
    text: string;
    backgroundColor: string;
    color: string;
  }>;
  effects: Partial<{
    productShadow: boolean;
    shadowBlur: number;
    glow: boolean;
    grain: boolean;
    grainOpacity: number;
    roundedFrame: boolean;
    frameCornerRadius: number;
    frameInset: number;
    propsDecor: boolean;
  }>;
  productPlacement: Partial<{
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>;
}

export const PRESETS: Record<
  ThemeId,
  PresetOverride & { layers: PresetLayerPatch }
> = {
  "clean-ecommerce": {
    activePreset: "clean-ecommerce",
    label: "Clean ecommerce",
    description: "Bright catalog energy, crisp type, lots of whitespace",
    headlineText: "New drop — built for everyday",
    ctaText: "Shop now",
    badgeText: "NEW",
    layers: {
      background: {
        kind: "gradient",
        gradientAngle: 165,
        colors: ["#f8fafc", "#e2e8f0", "#cbd5f5"],
        solidColor: "#ffffff",
        pattern: "dots",
        patternOpacity: 0.08,
        backdropTint: "#ffffff",
        blurBackdrop: false,
        backdropBlurStrength: 0,
      },
      headline: {
        fontFamily: "Inter, ui-sans-serif, system-ui",
        fontSize: 38,
        fontWeight: 800,
        color: "#0f172a",
        placementPreset: "top",
        align: "center",
      },
      cta: {
        visible: true,
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        cornerRadius: 999,
        width: 220,
        height: 52,
      },
      badge: { visible: true, backgroundColor: "#22c55e", color: "#052e16" },
      effects: {
        productShadow: true,
        shadowBlur: 22,
        glow: false,
        grain: false,
        roundedFrame: true,
        frameCornerRadius: 28,
        frameInset: 18,
        propsDecor: false,
      },
      productPlacement: { x: cx, y: cy + 28, scale: 0.85, rotation: 0 },
    },
  },
  "luxury-editorial": {
    activePreset: "luxury-editorial",
    label: "Luxury editorial",
    description: "Warm tones, restrained serif headline, tactile shadow",
    headlineText: "Skin ritual, elevated.",
    ctaText: "Discover",
    badgeText: "ÉDITÉ",
    layers: {
      background: {
        kind: "gradient",
        gradientAngle: 210,
        colors: ["#1c1410", "#3d2f28", "#7c5e4f"],
        solidColor: "#2a2420",
        pattern: "none",
        patternOpacity: 0,
        backdropTint: "#251c18",
        blurBackdrop: true,
        backdropBlurStrength: 0.65,
      },
      headline: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 40,
        fontWeight: 500,
        color: "#f5f0e8",
        placementPreset: "top",
        align: "left",
      },
      cta: {
        visible: true,
        backgroundColor: "#f5f0e8",
        color: "#211a16",
        cornerRadius: 4,
        width: 200,
        height: 48,
      },
      badge: { visible: true, backgroundColor: "#c9a87c", color: "#1a120c" },
      effects: {
        productShadow: true,
        shadowBlur: 42,
        glow: false,
        grain: true,
        grainOpacity: 0.12,
        roundedFrame: false,
        frameCornerRadius: 0,
        frameInset: 0,
        propsDecor: false,
      },
      productPlacement: { x: cx, y: cy, scale: 0.92, rotation: 0 },
    },
  },
  "summer-promo": {
    activePreset: "summer-promo",
    label: "Summer promo",
    description: "Sunny gradients, kinetic social energy",
    headlineText: "SUN OUT. SALE ON.",
    ctaText: "Grab the deal",
    badgeText: "HOT",
    layers: {
      background: {
        kind: "gradient",
        gradientAngle: 135,
        colors: ["#ff9a56", "#ff6a88", "#ffc371"],
        solidColor: "#ffa04d",
        pattern: "mesh",
        patternOpacity: 0.15,
        backdropTint: "#fff4e0",
        blurBackdrop: true,
        backdropBlurStrength: 0.4,
      },
      headline: {
        fontFamily: "Inter, ui-sans-serif, system-ui",
        fontSize: 44,
        fontWeight: 900,
        color: "#1e0a3d",
        placementPreset: "top",
        align: "center",
      },
      cta: {
        visible: true,
        backgroundColor: "#1e0a3d",
        color: "#fff7ed",
        cornerRadius: 14,
        width: 240,
        height: 56,
      },
      badge: { visible: true, backgroundColor: "#fef08a", color: "#422006" },
      effects: {
        productShadow: true,
        shadowBlur: 18,
        glow: true,
        grain: true,
        grainOpacity: 0.06,
        roundedFrame: true,
        frameCornerRadius: 32,
        frameInset: 12,
        propsDecor: true,
      },
      productPlacement: { x: cx, y: cy + 12, scale: 0.88, rotation: -4 },
    },
  },
  "bold-social": {
    activePreset: "bold-social",
    label: "Bold social ad",
    description: "High contrast blocks and loud type for the feed",
    headlineText: "STOP SCROLLING.",
    ctaText: "Learn more",
    badgeText: "AD",
    layers: {
      background: {
        kind: "gradient",
        gradientAngle: 90,
        colors: ["#0ea5e9", "#6366f1", "#ec4899"],
        solidColor: "#111827",
        pattern: "lines",
        patternOpacity: 0.2,
        backdropTint: "#020617",
        blurBackdrop: false,
        backdropBlurStrength: 0,
      },
      headline: {
        fontFamily: "Inter, ui-sans-serif, system-ui",
        fontSize: 48,
        fontWeight: 900,
        color: "#ffffff",
        placementPreset: "center",
        align: "center",
      },
      cta: {
        visible: true,
        backgroundColor: "#fef08a",
        color: "#0f172a",
        cornerRadius: 999,
        width: 260,
        height: 60,
      },
      badge: { visible: true, backgroundColor: "#f97316", color: "#431407" },
      effects: {
        productShadow: true,
        shadowBlur: 12,
        glow: false,
        grain: false,
        roundedFrame: true,
        frameCornerRadius: 20,
        frameInset: 8,
        propsDecor: false,
      },
      productPlacement: { x: cx, y: cy + 40, scale: 0.82, rotation: 3 },
    },
  },
  "minimal-skincare": {
    activePreset: "minimal-skincare",
    label: "Minimal skincare",
    description: "Spa-toned serenity, breathable layout",
    headlineText: "gentle potency.",
    ctaText: "View routine",
    badgeText: "VEGAN",
    layers: {
      background: {
        kind: "gradient",
        gradientAngle: 185,
        colors: ["#f4fbf7", "#e8f3ec", "#d7eae1"],
        solidColor: "#f4fdf8",
        pattern: "dots",
        patternOpacity: 0.05,
        backdropTint: "#ecfdf5",
        blurBackdrop: false,
        backdropBlurStrength: 0,
      },
      headline: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 36,
        fontWeight: 500,
        color: "#064e3b",
        placementPreset: "top",
        align: "center",
      },
      cta: {
        visible: true,
        backgroundColor: "#064e3b",
        color: "#ecfdf5",
        cornerRadius: 999,
        width: 210,
        height: 48,
      },
      badge: { visible: true, backgroundColor: "#a7f3d0", color: "#022c22" },
      effects: {
        productShadow: true,
        shadowBlur: 28,
        glow: false,
        grain: true,
        grainOpacity: 0.05,
        roundedFrame: true,
        frameCornerRadius: 40,
        frameInset: 24,
        propsDecor: false,
      },
      productPlacement: { x: cx, y: cy + 8, scale: 0.9, rotation: 0 },
    },
  },
  "modern-tech": {
    activePreset: "modern-tech",
    label: "Modern tech",
    description: "Nocturnal gradient glow and precision geometry",
    headlineText: "Precision. Portable. Pro.",
    ctaText: "Pre-order",
    badgeText: "GEN-2",
    layers: {
      background: {
        kind: "gradient",
        gradientAngle: 315,
        colors: ["#020617", "#0f172a", "#334155"],
        solidColor: "#0b1120",
        pattern: "mesh",
        patternOpacity: 0.25,
        backdropTint: "#020617",
        blurBackdrop: true,
        backdropBlurStrength: 0.55,
      },
      headline: {
        fontFamily: "Inter, ui-sans-serif, system-ui",
        fontSize: 36,
        fontWeight: 800,
        color: "#e2e8f0",
        placementPreset: "top",
        align: "center",
      },
      cta: {
        visible: true,
        backgroundColor: "#38bdf8",
        color: "#082f49",
        cornerRadius: 12,
        width: 230,
        height: 52,
      },
      badge: { visible: true, backgroundColor: "#22d3ee", color: "#083344" },
      effects: {
        productShadow: true,
        shadowBlur: 38,
        glow: true,
        grain: true,
        grainOpacity: 0.08,
        roundedFrame: false,
        frameCornerRadius: 24,
        frameInset: 0,
        propsDecor: true,
      },
      productPlacement: { x: cx, y: cy + 4, scale: 0.9, rotation: 0 },
    },
  },
};

export const PRESET_ORDER: ThemeId[] = [
  "clean-ecommerce",
  "luxury-editorial",
  "summer-promo",
  "bold-social",
  "minimal-skincare",
  "modern-tech",
];
