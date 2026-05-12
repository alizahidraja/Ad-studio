import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import type { WorkspaceSnapshot } from "@/types/design";
import { mergeWorkspacePatch } from "./mergeWorkspacePatch";

/** Flat “clean plate” overlay for Before/after comparison without touching store. */
export function minimalPreview(workspace: WorkspaceSnapshot): WorkspaceSnapshot {
  return mergeWorkspacePatch(workspace, {
    background: {
      kind: "gradient",
      gradientAngle: 180,
      colors: ["#fefefe", "#f1f5f9", "#e2e8f0"],
      solidColor: "#ffffff",
      pattern: "none",
      patternOpacity: 0,
      backdropTint: "#ffffff",
      blurBackdrop: false,
      backdropBlurStrength: 0,
    },
    headline: {
      ...workspace.headline,
      text: "",
    },
    cta: {
      ...workspace.cta,
      visible: false,
    },
    badge: {
      ...workspace.badge,
      visible: false,
    },
    effects: {
      ...workspace.effects,
      glow: false,
      grain: false,
      propsDecor: false,
      roundedFrame: false,
      productShadow: false,
      shadowBlur: 8,
    },
    productPlacement: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT * 0.5,
      scale: Math.min(workspace.productPlacement.scale, 0.86),
      rotation: 0,
    },
  });
}
