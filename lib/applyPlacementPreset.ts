import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import type { TextLayer } from "@/types/design";

const marginX = CANVAS_WIDTH * 0.08;
const headlineTopY = CANVAS_HEIGHT * 0.08;
const headlineCenterY = CANVAS_HEIGHT * 0.42;
const headlineBottomY = CANVAS_HEIGHT * 0.78;

/** Sets headline `(x,y)` from placement preset; keeps horizontal alignment semantics. */
export function applyPlacementPreset(
  headline: TextLayer,
  preset: TextLayer["placementPreset"],
): TextLayer {
  const next = { ...headline, placementPreset: preset };

  switch (preset) {
    case "top":
      next.y = headlineTopY;
      next.maxWidth = CANVAS_WIDTH - marginX * 2;
      if (next.align === "center") next.x = CANVAS_WIDTH / 2;
      else if (next.align === "right") next.x = CANVAS_WIDTH - marginX;
      else next.x = marginX;
      break;
    case "center":
      next.y = headlineCenterY;
      next.maxWidth = CANVAS_WIDTH - marginX * 2;
      next.x = CANVAS_WIDTH / 2;
      next.align = "center";
      break;
    case "bottom":
      next.y = headlineBottomY;
      next.maxWidth = CANVAS_WIDTH - marginX * 2;
      if (next.align === "center") next.x = CANVAS_WIDTH / 2;
      else if (next.align === "right") next.x = CANVAS_WIDTH - marginX;
      else next.x = marginX;
      break;
    default:
      break;
  }
  return next;
}
