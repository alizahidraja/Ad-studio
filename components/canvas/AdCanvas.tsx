"use client";

import Konva from "konva";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Group,
  Image as KonvaImage,
  Text,
  Rect,
  Ellipse,
  Line,
  Transformer,
  Circle,
} from "react-konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import type { WorkspaceSnapshot } from "@/types/design";
import { buildNoiseCanvas } from "@/lib/noiseTexture";
import type { MutableRefObject } from "react";

export type AdCanvasProps = {
  workspace: WorkspaceSnapshot;
  exportRef?: MutableRefObject<KonvaStage | null>;
  /** Visual scale wrapper; stage coords stay CANVAS_* design space */
  containerScale?: number;
  interactionDisabled?: boolean;
  onPlacementChange?: (next: WorkspaceSnapshot["productPlacement"]) => void;
  onHeadlinePlacement?: (
    coords: Pick<WorkspaceSnapshot["headline"], "x" | "y">,
  ) => void;
  onCtaPlacement?: (coords: Pick<WorkspaceSnapshot["cta"], "x" | "y">) => void;
  onBadgePlacement?: (
    coords: Pick<WorkspaceSnapshot["badge"], "x" | "y">,
  ) => void;
};

function AdCanvasInner({
  workspace,
  exportRef,
  containerScale = 0.7,
  interactionDisabled,
  onPlacementChange,
  onHeadlinePlacement,
  onCtaPlacement,
  onBadgePlacement,
}: AdCanvasProps) {
  const productRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<KonvaStage | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState({ w: CANVAS_WIDTH, h: CANVAS_HEIGHT });

  const bindStage = (stage: KonvaStage | null) => {
    stageRef.current = stage;
    if (exportRef) exportRef.current = stage ?? null;
  };

  useEffect(() => {
    const src = workspace.uploadedImageSrc;
    if (!src) {
      queueMicrotask(() => setImg(null));
      return;
    }
    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => {
      if (cancelled) return;
      setNatural({
        w: image.naturalWidth || CANVAS_WIDTH * 0.6,
        h: image.naturalHeight || CANVAS_HEIGHT * 0.55,
      });
      setImg(image);
    };
    return () => {
      cancelled = true;
    };
  }, [workspace.uploadedImageSrc]);

  useEffect(() => {
    const node = productRef.current;
    if (!node || !workspace.uploadedImageSrc) return;
    node.rotation(workspace.productPlacement.rotation);
    node.position({
      x: workspace.productPlacement.x,
      y: workspace.productPlacement.y,
    });
    const s = workspace.productPlacement.scale;
    node.scale({ x: s, y: s });
    node.getLayer()?.batchDraw();
  }, [
    workspace.productPlacement.rotation,
    workspace.productPlacement.scale,
    workspace.productPlacement.x,
    workspace.productPlacement.y,
    workspace.uploadedImageSrc,
  ]);

  useEffect(() => {
    const tr = trRef.current;
    const node = productRef.current;
    if (!tr || !node) return;
    if (!img || interactionDisabled) {
      tr.nodes([]);
    } else {
      tr.nodes([node]);
    }
    tr.getLayer()?.batchDraw();
  }, [
    img,
    interactionDisabled,
    workspace.uploadedImageSrc,
    workspace.productPlacement.scale,
  ]);

  const noiseCanvas = useMemo(() => buildNoiseCanvas(9241), []);

  const {
    headline,
    cta,
    badge,
    background,
    effects,
    productPlacement,
  } = workspace;

  const fx = CANVAS_WIDTH;
  const fy = CANVAS_HEIGHT;
  const useGradientFill = background.kind !== "solid" && background.colors.length >= 2;
  const deg = (background.gradientAngle * Math.PI) / 180;
  const gradientEnd = { x: fx * Math.cos(deg), y: fy * Math.sin(deg) };

  const handleTransformEnd = () => {
    const node = productRef.current;
    if (!node || !onPlacementChange) return;
    let s = Math.max(node.scaleX(), node.scaleY());
    if (!Number.isFinite(s) || s < 0.05) s = workspace.productPlacement.scale;
    node.scale({ x: s, y: s });
    onPlacementChange({
      x: node.x(),
      y: node.y(),
      scale: s,
      rotation: node.rotation(),
    });
    node.getLayer()?.batchDraw();
  };

  const patternDots = useMemo(() => {
    const nodes: React.ReactElement[] = [];
    const step = 28;
    for (let x = step / 2; x < CANVAS_WIDTH; x += step) {
      for (let y = step / 2; y < CANVAS_HEIGHT; y += step) {
        nodes.push(
          <Circle
            key={`dot-${x}-${y}`}
            listening={false}
            x={x}
            y={y}
            radius={1.25}
            fill="rgba(15,23,42,0.24)"
          />,
        );
      }
    }
    return nodes;
  }, []);

  const diagonalLines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const W = CANVAS_WIDTH;
    const H = CANVAS_HEIGHT;
    for (let i = -H; i < W + H; i += 26) {
      lines.push(
        <Line
          key={`diag-${i}`}
          listening={false}
          points={[i, H, i + H, 0]}
          stroke="rgba(15,23,42,0.08)"
          strokeWidth={2}
          dash={[14, 10]}
          lineCap="round"
        />,
      );
    }
    return lines;
  }, []);

  const stageW = fx;
  const stageH = fy;
  const displayW = stageW * containerScale;
  const displayH = stageH * containerScale;

  const headlineOffsetX =
    headline.align === "center" ? headline.maxWidth / 2 : 0;

  const badgeApproxWidth =
    badge.text.length * Math.max(badge.text.length > 10 ? 12 : 15, 10) + 38;

  return (
    <div
      style={{ width: displayW, height: displayH }}
      className="relative mx-auto overflow-hidden rounded-[22px] border border-white/10 shadow-[0_24px_80px_rgba(4,11,42,0.35)] bg-[#061021]"
    >
      {!workspace.uploadedImageSrc && (
        <p className="pointer-events-none absolute inset-x-8 top-[44%] z-10 text-center text-[13px] leading-relaxed text-slate-300/85">
          Drop a product JPEG/PNG — AZR composites creative layers entirely in-browser.
        </p>
      )}
      <div
        className="-translate-none"
        style={{
          transformOrigin: "top left",
          transform: `scale(${containerScale})`,
          width: stageW,
          height: stageH,
        }}
      >
        <Stage
          width={stageW}
          height={stageH}
          ref={bindStage}
          pixelRatio={
            typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio ?? 2) : 2
          }
        >
          <Layer listening={!interactionDisabled}>
            <Rect listening={false} width={stageW} height={stageH} />
            <Rect
              listening={false}
              width={stageW}
              height={stageH}
              {...(useGradientFill ?
                {
                  fillLinearGradientStartPoint: { x: 0, y: 0 },
                  fillLinearGradientEndPoint: gradientEnd,
                  fillLinearGradientColorStops: [
                    0,
                    background.colors[0] ?? "#ffffff",
                    1,
                    background.colors[background.colors.length - 1] ?? "#e5e7eb",
                  ],
                }
              : { fill: background.solidColor })}
            />
            {background.blurBackdrop && (
              <Rect
                listening={false}
                width={stageW}
                height={stageH}
                fill={background.backdropTint}
                opacity={Math.min(
                  background.backdropBlurStrength *
                    (effects.glow ? 1.06 : 0.94),
                  0.82,
                )}
              />
            )}
            {(background.pattern === "dots" ||
              background.pattern === "mesh") && (
              <Group listening={false} opacity={background.patternOpacity}>
                {patternDots}
              </Group>
            )}
            {background.pattern === "lines" && (
              <Group listening={false} opacity={background.patternOpacity}>
                {diagonalLines}
              </Group>
            )}
            {effects.propsDecor && (
              <Group listening={false} opacity={0.45}>
                <Rect
                  x={stageW * 0.06}
                  y={stageH * 0.72}
                  width={stageW * 0.35}
                  height={stageH * 0.04}
                  fill="#fde68a"
                  rotation={12}
                  cornerRadius={999}
                />
                <Rect
                  x={stageW * 0.62}
                  y={stageH * 0.18}
                  width={stageW * 0.33}
                  height={stageH * 0.04}
                  fill="#38bdf8"
                  rotation={-9}
                  cornerRadius={8}
                />
              </Group>
            )}
            {effects.roundedFrame && (
              <Rect
                listening={false}
                x={effects.frameInset}
                y={effects.frameInset}
                width={stageW - effects.frameInset * 2}
                height={stageH - effects.frameInset * 2}
                cornerRadius={effects.frameCornerRadius}
                stroke="rgba(248,250,252,0.62)"
                strokeWidth={14}
                shadowBlur={effects.productShadow ? 28 : 0}
                shadowOpacity={effects.shadowOpacity ?? 0.35}
                shadowColor="rgba(8,47,73,0.45)"
              />
            )}
          </Layer>

          <Layer listening={!interactionDisabled}>
            {(effects.productShadow || effects.glow) && img && (
              <Ellipse
                listening={false}
                x={productPlacement.x + 14}
                y={
                  productPlacement.y + natural.h * productPlacement.scale * 0.2
                }
                radiusX={(natural.w * productPlacement.scale) / 2.4}
                radiusY={Math.max(effects.shadowBlur / 14, natural.h * 0.038)}
                fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                fillRadialGradientEndPoint={{
                  x: 0,
                  y: effects.shadowBlur * 0.6,
                }}
                fillRadialGradientColorStops={[
                  0,
                  "rgba(7,36,71,0.78)",
                  1,
                  "rgba(15,118,254,0.02)",
                ]}
                opacity={
                  (effects.shadowOpacity ?? 0.42) +
                  (effects.glow ? 0.22 : 0)
                }
                shadowBlur={effects.shadowBlur / 5 + (effects.glow ? 18 : 0)}
                shadowColor="rgba(8,145,247,0.35)"
              />
            )}

            {!img ?
              <Group listening={false}>
                <Ellipse
                  x={stageW / 2}
                  y={stageH / 2 + 58}
                  radiusX={172}
                  radiusY={60}
                  fill="rgba(14,163,239,0.18)"
                  listening={false}
                />
                <Ellipse
                  x={stageW / 2}
                  y={stageH / 2 + 148}
                  radiusX={120}
                  radiusY={32}
                  fill="rgba(15,118,239,0.12)"
                  listening={false}
                />
              </Group>
            : <>
                <Group
                  ref={productRef}
                  x={productPlacement.x}
                  y={productPlacement.y}
                  rotation={productPlacement.rotation}
                  scaleX={productPlacement.scale}
                  scaleY={productPlacement.scale}
                  draggable={!interactionDisabled}
                  shadowBlur={
                    interactionDisabled ?
                      0
                    : effects.productShadow ?
                      effects.shadowBlur / 5 + (effects.glow ? 14 : 0)
                    : 0
                  }
                  shadowColor="rgba(3,43,109,0.55)"
                  shadowOpacity={effects.productShadow ? 0.85 : 0}
                  shadowOffsetY={
                    interactionDisabled ?
                      0
                    : effects.productShadow ?
                      Math.max(effects.shadowBlur / 20, 6)
                    : 0
                  }
                  onDragEnd={(e) =>
                    onPlacementChange?.({
                      x: e.target.x(),
                      y: e.target.y(),
                      scale: productPlacement.scale,
                      rotation: e.target.rotation(),
                    })
                  }
                  onTransformEnd={handleTransformEnd}
                >
                  <KonvaImage
                    listening={!interactionDisabled}
                    image={img}
                    x={-natural.w / 2}
                    y={-natural.h / 2}
                    width={natural.w}
                    height={natural.h}
                    cornerRadius={
                      effects.roundedFrame ?
                        Math.min(effects.frameCornerRadius / 26, 32)
                      : 0
                    }
                  />
                </Group>

                {!interactionDisabled && workspace.uploadedImageSrc && (
                  <Transformer
                    ref={trRef}
                    rotateEnabled
                    enabledAnchors={[
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                    ]}
                    boundBoxFunc={(oldBox, newBox) => {
                      const minSide = Math.max(120, CANVAS_HEIGHT * 0.14);
                      if (newBox.width < minSide || newBox.height < minSide)
                        return oldBox;
                      return newBox;
                    }}
                    borderStroke="#7dd3fc"
                    anchorCornerRadius={6}
                    anchorSize={13}
                    padding={11}
                    borderDash={[11, 4]}
                  />
                )}
              </>
            }

            {headline.text.trim().length > 0 && (
              <Group
                name="headline"
                x={headline.x}
                y={headline.y}
                draggable={!interactionDisabled}
                onDragEnd={(e) =>
                  onHeadlinePlacement?.({
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
              >
                <Text
                  listening={!interactionDisabled}
                  text={headline.text}
                  align={headline.align}
                  verticalAlign="top"
                  width={headline.maxWidth}
                  wrap="word"
                  fontFamily={headline.fontFamily}
                  fontSize={headline.fontSize}
                  fontStyle={
                    headline.fontWeight >= 700 ?
                      "bold"
                    : "normal"
                  }
                  lineHeight={1.08}
                  fill={headline.color}
                  offsetX={headlineOffsetX}
                  shadowBlur={
                    effects.glow ? Math.min(headline.fontSize / 2.4, 40) : 0
                  }
                  shadowOpacity={effects.glow ? 0.32 : 0}
                  shadowColor={headline.color}
                />
              </Group>
            )}

            {cta.visible && (
              <Group
                name="cta"
                x={cta.x}
                y={cta.y}
                draggable={!interactionDisabled}
                onDragEnd={(e) =>
                  onCtaPlacement?.({ x: e.target.x(), y: e.target.y() })
                }
              >
                <Rect
                  width={cta.width}
                  height={cta.height}
                  fill={cta.backgroundColor}
                  cornerRadius={cta.cornerRadius}
                  shadowBlur={
                    effects.glow ? 18 : effects.productShadow ? 12 : 0
                  }
                  shadowOpacity={effects.glow ? 0.4 : 0.22}
                  shadowColor="rgba(4,61,154,0.45)"
                  listening={!interactionDisabled}
                />
                <Text
                  text={cta.text}
                  width={cta.width}
                  height={cta.height}
                  align="center"
                  verticalAlign="middle"
                  fontSize={
                    cta.height > 54 ?
                      20
                    : Math.max(16, Math.round(cta.height * 0.33))
                  }
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill={cta.color}
                  listening={false}
                />
              </Group>
            )}

            {badge.visible && badge.text.trim().length > 0 && (
              <Group
                name="badge"
                x={badge.x}
                y={badge.y}
                rotation={
                  workspace.activePreset === "summer-promo" ? -7
                  : workspace.activePreset === "bold-social" ? 10
                  : 0
                }
                draggable={!interactionDisabled}
                onDragEnd={(e) =>
                  onBadgePlacement?.({ x: e.target.x(), y: e.target.y() })
                }
              >
                <Rect
                  listening={false}
                  width={badgeApproxWidth}
                  height={46}
                  fill={badge.backgroundColor}
                  cornerRadius={workspace.activePreset === "luxury-editorial" ?
                    4
                  : 18}
                />
                <Text
                  listening={false}
                  align="center"
                  text={badge.text}
                  width={badgeApproxWidth}
                  height={46}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fontSize={
                    badge.text.length > 9 ? 13.5 :
                    badge.text.length > 5 ?
                      16.5
                    : 21
                  }
                  letterSpacing={
                    workspace.activePreset === "modern-tech" ?
                      2.6
                    : workspace.activePreset === "luxury-editorial" ?
                      1.2
                    : 0.4
                  }
                  fill={badge.color}
                  verticalAlign="middle"
                  y={
                    badge.text.length > 9 ?
                      11
                    : badge.text.length > 5 ?
                      12
                    : 13
                  }
                />
              </Group>
            )}

            {effects.grain && noiseCanvas && (
              <Rect
                listening={false}
                width={stageW}
                height={stageH}
                fillPatternImage={
                  noiseCanvas as unknown as HTMLImageElement
                }
                fillPatternRepeat="repeat"
                globalCompositeOperation="multiply"
                opacity={effects.grainOpacity + (effects.glow ? 0.04 : 0)}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default memo(AdCanvasInner);
