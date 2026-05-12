import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { PRESETS } from "@/constants/presets";
import type { WorkspaceSnapshot } from "@/types/design";
import { applyPlacementPreset } from "./applyPlacementPreset";

export function createInitialWorkspace(): WorkspaceSnapshot {
  const base = PRESETS["clean-ecommerce"];
  const ls = base.layers;
  const headline = applyPlacementPreset(
    {
      text: base.headlineText,
      fontFamily: ls.headline.fontFamily!,
      fontSize: ls.headline.fontSize!,
      fontWeight: ls.headline.fontWeight!,
      color: ls.headline.color!,
      x: 0,
      y: 0,
      maxWidth: CANVAS_WIDTH * 0.84,
      align: ls.headline.align!,
      placementPreset: ls.headline.placementPreset!,
    },
    ls.headline.placementPreset!,
  );

  return {
    uploadedImageSrc: null,
    productPlacement: {
      x: ls.productPlacement.x!,
      y: ls.productPlacement.y!,
      scale: ls.productPlacement.scale!,
      rotation: ls.productPlacement.rotation!,
    },
    background: {
      kind: ls.background.kind!,
      gradientAngle: ls.background.gradientAngle!,
      colors: [...ls.background.colors!],
      solidColor: ls.background.solidColor!,
      pattern: ls.background.pattern!,
      patternOpacity: ls.background.patternOpacity!,
      backdropTint: ls.background.backdropTint!,
      blurBackdrop: ls.background.blurBackdrop!,
      backdropBlurStrength: ls.background.backdropBlurStrength!,
    },
    headline,
    cta: {
      text: base.ctaText,
      visible: ls.cta.visible!,
      x: CANVAS_WIDTH / 2 - (ls.cta.width ?? 220) / 2,
      y: CANVAS_HEIGHT * 0.82,
      width: ls.cta.width ?? 220,
      height: ls.cta.height ?? 52,
      backgroundColor: ls.cta.backgroundColor!,
      color: ls.cta.color!,
      cornerRadius: ls.cta.cornerRadius!,
    },
    badge: {
      visible: ls.badge.visible!,
      text: base.badgeText ?? "NEW",
      x: CANVAS_WIDTH - 124,
      y: CANVAS_HEIGHT * 0.1,
      backgroundColor: ls.badge.backgroundColor!,
      color: ls.badge.color!,
    },
    effects: {
      productShadow: ls.effects.productShadow!,
      shadowBlur: ls.effects.shadowBlur!,
      shadowOpacity: 0.42,
      glow: ls.effects.glow!,
      grain: ls.effects.grain!,
      grainOpacity: ls.effects.grainOpacity!,
      roundedFrame: ls.effects.roundedFrame!,
      frameCornerRadius: ls.effects.frameCornerRadius!,
      frameInset: ls.effects.frameInset!,
      propsDecor: ls.effects.propsDecor!,
    },
    activePreset: base.activePreset,
    promptHistory: [],
    chatHistory: [],
    designPlanSummary: null,
  };
}

/** Deep-merge workspace fields so partial patches never drop nested keys. */
export function mergeWorkspacePatch(
  base: WorkspaceSnapshot,
  patch: Partial<WorkspaceSnapshot>,
): WorkspaceSnapshot {
  const merged: WorkspaceSnapshot = {
    ...base,
    ...patch,
    productPlacement: {
      ...base.productPlacement,
      ...(patch.productPlacement ?? {}),
    },
    background: {
      ...base.background,
      ...(patch.background ?? {}),
      colors: patch.background?.colors ?? [...base.background.colors],
    },
    headline: { ...base.headline, ...(patch.headline ?? {}) },
    cta: { ...base.cta, ...(patch.cta ?? {}) },
    badge: { ...base.badge, ...(patch.badge ?? {}) },
    effects: { ...base.effects, ...(patch.effects ?? {}) },
    promptHistory: patch.promptHistory ?? base.promptHistory,
    chatHistory: patch.chatHistory ?? base.chatHistory,
    designPlanSummary:
      patch.designPlanSummary ?? base.designPlanSummary,
    uploadedImageSrc:
      patch.uploadedImageSrc === undefined ? base.uploadedImageSrc : patch.uploadedImageSrc,
    activePreset: patch.activePreset ?? base.activePreset,
  };
  return merged;
}
