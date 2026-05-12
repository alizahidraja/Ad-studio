import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import type { WorkspaceSnapshot } from "@/types/design";
import { applyPlacementPreset } from "./applyPlacementPreset";
import { inferDesignPlan, patchesFromPlan } from "./planFromPrompt";
import { PRESETS } from "@/constants/presets";

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export interface InterpretedChatTurn {
  reply: string;
  patch: Partial<WorkspaceSnapshot>;
  /** When true UI can show Apply — here we apply immediately anyway */
}

export function interpretChatMessage(
  workspace: WorkspaceSnapshot,
  raw: string,
): InterpretedChatTurn {
  const t = normalize(raw);
  const patch: Partial<WorkspaceSnapshot> = {};
  const replyPieces: string[] = [];

  if (mentions(t, ["warmer", "warm up", "sunset"])) {
    patch.background = {
      ...workspace.background,
      gradientAngle: (workspace.background.gradientAngle + 25) % 360,
      colors: bumpWarm(workspace.background.colors),
    };
    replyPieces.push("Shifted gradients toward amber / sunset warmth.");
  }
  if (mentions(t, ["cooler", "cool tone", "ice"])) {
    patch.background = {
      ...workspace.background,
      ...(patch.background ?? workspace.background),
      colors: bumpCool(patch.background?.colors ?? workspace.background.colors),
    };
    replyPieces.push("Tempered hues with airy cool highlights.");
  }
  if (
    mentions(t, ["dark background", "darker backdrop", "darker bg", "deep background"])
  ) {
    patch.background = {
      ...(patch.background ?? workspace.background),
      kind: "gradient",
      gradientAngle: 220,
      colors: ["#020617", "#0f172a", "#334155"],
    };
    patch.headline = {
      ...(patch.headline ?? workspace.headline),
      ...workspace.headline,
      color: "#f8fafc",
    };
    replyPieces.push("Switched to a twilight studio gradient and lifted type contrast.");
  }
  if (mentions(t, ["light background", "lighter", "airy", "white bg"])) {
    patch.background = {
      ...(patch.background ?? workspace.background),
      kind: "gradient",
      colors: ["#ffffff", "#f1f5f9", "#e2e8f0"],
    };
    patch.headline = {
      ...(patch.headline ?? workspace.headline),
      ...workspace.headline,
      color: "#0f172a",
    };
    replyPieces.push("Opened up the canvas with a porcelain wash.");
  }
  if (mentions(t, ["headline", "title", "add text"]) && extractQuoted(t)) {
    const q = extractQuoted(t);
    if (q) {
      patch.headline = { ...workspace.headline, text: q };
      replyPieces.push(`Headline now reads “${q}”.`);
    }
  } else if (mentions(t, ["headline", "bigger text", "larger type"])) {
    patch.headline = {
      ...workspace.headline,
      fontSize: Math.min(workspace.headline.fontSize + 8, 64),
      fontWeight: Math.max(workspace.headline.fontWeight, 800),
    };
    replyPieces.push("Amplified headline scale for feed-stopping posture.");
  }
  if (
    mentions(t, ["premium", "luxe"]) &&
    workspace.activePreset !== "luxury-editorial"
  ) {
    const plan = inferDesignPlan("luxury editorial warm minimal headline");
    const lux = PRESETS["luxury-editorial"];
    Object.assign(patch, patchesFromPlan(workspace, plan, lux));
    replyPieces.push("Borrowed cues from Luxury Editorial — tonal depth + serif cadence.");
  }
  if (mentions(t, ["bold", "loud"])) {
    patch.headline = {
      ...(patch.headline ?? workspace.headline),
      ...workspace.headline,
      fontWeight: 900,
    };
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      glow: true,
      productShadow: true,
      shadowBlur: Math.max(workspace.effects.shadowBlur, 24),
    };
    replyPieces.push("Juiced typography weight and sculpted shadow bloom.");
  }
  if (
    mentions(t, ["minimal", "quiet", "subtract"]) &&
    !mentions(t, ["premium"])
  ) {
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      propsDecor: false,
      grain: workspace.effects.grain,
      glow: false,
    };
    replyPieces.push("Paired back garnish layers for quieter negative space.");
  }
  if (mentions(t, ["cta", "button", "call to action"])) {
    patch.cta = { ...workspace.cta, ...(patch.cta ?? {}), visible: true };
    const q = extractQuoted(t);
    if (q) patch.cta = { ...workspace.cta, ...patch.cta, text: q };
    replyPieces.push(q ? `CTA now says “${q}” and snaps to prominence.` : "CTA block is surfaced.");
  }
  if (mentions(t, ["badge", "sticker", "tag"])) {
    patch.badge = { ...workspace.badge, visible: true };
    const q = extractQuoted(t);
    if (q) patch.badge = { ...workspace.badge, visible: true, text: q };
    replyPieces.push(q ? `Badge stitched with “${q}”.` : "Badge vignette activated.");
  }
  if (mentions(t, ["shadow"])) {
    const off = mentions(t, ["more", "heavier", "deeper"]);
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      productShadow: true,
      shadowBlur: off
        ? workspace.effects.shadowBlur + 12
        : Math.max(12, workspace.effects.shadowBlur - 6),
    };
    replyPieces.push(off ? "Deepened the hero shadow pool." : "Softened pedestal shadow curvature.");
  }
  if (
    mentions(t, ["grain", "noise"]) ||
    (mentions(t, ["texture"]) && mentions(t, ["more"]))
  ) {
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      grain: true,
      grainOpacity: Math.min(workspace.effects.grainOpacity + 0.04, 0.22),
    };
    replyPieces.push("Printed subtle film grain for tactile realism.");
  }
  if (
    mentions(t, ["grain off", "no grain", "no noise"]) ||
    mentions(t, ["texture off"])
  ) {
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      grain: false,
    };
    replyPieces.push("Grain layer lifted for glossy clarity.");
  }
  if (
    mentions(t, ["rounded", "pill frame", "card frame"]) ||
    mentions(t, ["poster frame"])
  ) {
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      roundedFrame: true,
      frameCornerRadius: Math.min((patch.effects ?? workspace.effects).frameCornerRadius + 8, 48),
      frameInset: Math.max(workspace.effects.frameInset, 14),
    };
    replyPieces.push("Introduced softened frame geometry around the artwork.");
  }
  if (
    mentions(t, ["blur backdrop", "bokeh", "backdrop blur"]) ||
    mentions(t, ["depth", "premium bg"])
  ) {
    patch.background = {
      ...(patch.background ?? workspace.background),
      ...workspace.background,
      blurBackdrop: true,
      backdropBlurStrength: Math.min(
        workspace.background.backdropBlurStrength + 0.15,
        0.92,
      ),
    };
    replyPieces.push("Pushed atmospheric depth blur behind the hero silhouette.");
  }
  if (
    mentions(t, ["pattern"]) &&
    mentions(t, ["off", "no pattern", "remove pattern"])
  ) {
    patch.background = {
      ...(patch.background ?? workspace.background),
      ...workspace.background,
      pattern: "none",
      patternOpacity: 0,
    };
    replyPieces.push("Muted pattern mesh for breathable negative space.");
  }
  if (mentions(t, ["props", "shapes"])) {
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      propsDecor: !mentions(t, ["hide", "off", "remove"]),
    };
    replyPieces.push(patch.effects!.propsDecor ? "Layered kinetic props." : "Stripped illustrative props.");
  }
  if (mentions(t, ["center product", "re-center"])) {
    patch.productPlacement = {
      ...workspace.productPlacement,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT * 0.48,
    };
    replyPieces.push("Normalized hero centroid to editorial safe-area.");
  }
  if (
    mentions(t, ["layout", "headline top", "text top", "move text up"]) ||
    mentions(t, ["text at the top"])
  ) {
    const h = applyPlacementPreset(
      { ...(patch.headline ?? workspace.headline) },
      "top",
    );
    patch.headline = h;
    replyPieces.push("Raised typographic band to the upper third.");
  }
  if (mentions(t, ["text bottom", "headline bottom", "move text down"])) {
    const h = applyPlacementPreset(
      { ...(patch.headline ?? workspace.headline) },
      "bottom",
    );
    patch.headline = h;
    replyPieces.push("Anchored copy to the lower rail.");
  }
  if (mentions(t, ["center text", "headline center"])) {
    const h = applyPlacementPreset(
      { ...(patch.headline ?? workspace.headline) },
      "center",
    );
    patch.headline = h;
    replyPieces.push("Center-locked headline for symmetry.");
  }
  if (mentions(t, ["glow"])) {
    patch.effects = {
      ...(patch.effects ?? workspace.effects),
      ...workspace.effects,
      glow: !mentions(t, ["off", "remove"]),
    };
    replyPieces.push(patch.effects!.glow ? "Ignited edge bloom." : "Glow dissipated for matte finish.");
  }

  if (Object.keys(patch).length === 0) {
    const plan = inferDesignPlan(raw);
    const preset = PRESETS[plan.themeGuess ?? workspace.activePreset];
    Object.assign(patch, patchesFromPlan(workspace, plan, preset));
    replyPieces.push(
      "Translated that direction into refreshed art direction primitives.",
    );
    replyPieces.push(plan.summary);
  }

  const reply =
    replyPieces.length > 0
      ? replyPieces.join(" ")
      : "Design language nudged with micro-adjustments.";
  return {
    reply,
    patch,
  };
}

function mentions(text: string, needles: string[]) {
  return needles.some((n) => text.includes(n));
}

function bumpWarm(colors: string[]) {
  return colors.map((c) => mixToward(c, "#fb923c", 0.14));
}

function bumpCool(colors: string[]) {
  return colors.map((c) => mixToward(c, "#38bdf8", 0.12));
}

function mixToward(from: string, to: string, t: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  if (!a || !b) return from;
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${hx(r)}${hx(g)}${hx(bl)}`;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = Number.parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hx(n: number) {
  return n.toString(16).padStart(2, "0");
}

function extractQuoted(text: string) {
  const m = text.match(/["“](.+?)["”]/);
  return m?.[1]?.trim();
}
