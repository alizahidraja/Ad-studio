export type ThemeId =
  | "clean-ecommerce"
  | "luxury-editorial"
  | "summer-promo"
  | "bold-social"
  | "minimal-skincare"
  | "modern-tech";

export interface ProductPlacement {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export type BackgroundKind = "gradient" | "solid" | "pattern";

export interface BackgroundStyle {
  kind: BackgroundKind;
  gradientAngle: number;
  colors: string[];
  solidColor: string;
  pattern: "dots" | "lines" | "mesh" | "none";
  patternOpacity: number;
  backdropTint: string;
  blurBackdrop: boolean;
  backdropBlurStrength: number;
}

export interface TextLayer {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  x: number;
  y: number;
  maxWidth: number;
  align: "left" | "center" | "right";
  placementPreset: "top" | "center" | "bottom";
}

export interface CtaLayer {
  text: string;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
  cornerRadius: number;
}

export interface BadgeLayer {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  backgroundColor: string;
  color: string;
}

export interface Effects {
  productShadow: boolean;
  shadowBlur: number;
  shadowOpacity: number;
  glow: boolean;
  grain: boolean;
  grainOpacity: number;
  roundedFrame: boolean;
  frameCornerRadius: number;
  frameInset: number;
  propsDecor: boolean;
}

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
}

export type ExportStatus = "idle" | "exporting" | "done" | "error";

export interface DesignPlan {
  themeGuess: ThemeId | null;
  colorMood: "warm" | "cool" | "neutral" | "high-contrast";
  layout: "social-ad" | "editorial" | "minimal-product";
  typography: "bold" | "elegant" | "minimal";
  composition: string;
  backgroundHint: string;
  ctaStyle: "punchy" | "subtle" | "pill";
  summary: string;
}

/** Persisted workspace (no transient UI flags). */
export interface WorkspaceSnapshot {
  uploadedImageSrc: string | null;
  productPlacement: ProductPlacement;
  background: BackgroundStyle;
  headline: TextLayer;
  cta: CtaLayer;
  badge: BadgeLayer;
  effects: Effects;
  activePreset: ThemeId;
  promptHistory: PromptHistoryItem[];
  chatHistory: ChatMessage[];
  designPlanSummary: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  proposedPatch?: Partial<WorkspaceSnapshot>;
  applied?: boolean;
}

export interface AdStudioState extends WorkspaceSnapshot {
  exportStatus: ExportStatus;
  showBeforeAfter: boolean;
  loadingInterpret: boolean;
  lastPlan: DesignPlan | null;
}
