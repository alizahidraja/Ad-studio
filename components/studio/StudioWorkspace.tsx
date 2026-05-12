"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Loader2,
  Download,
  SunMedium,
  Sparkles,
  RotateCcw,
  Redo2,
  Undo2,
  ImagePlus,
  SplitSquareHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";

import AdCanvasInner from "@/components/canvas/AdCanvas";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROMPTS } from "@/constants/samplePrompts";
import { PRESET_ORDER, PRESETS } from "@/constants/presets";
import { exportStageToFile } from "@/lib/exportKonvaStage";
import { minimalPreview } from "@/lib/minimalPreview";
import { cn } from "@/lib/cn";
import { useAdStudio } from "@/store/useAdStudio";
import type { WorkspaceSnapshot } from "@/types/design";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import type { ThemeId } from "@/types/design";

export default function StudioWorkspace() {
  const stageRef = useRef<KonvaStage | null>(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [chatDraft, setChatDraft] = useState("");

  const workspaceLive = useAdStudio(
    useShallow(
      (s): WorkspaceSnapshot => ({
        uploadedImageSrc: s.uploadedImageSrc,
        productPlacement: s.productPlacement,
        background: s.background,
        headline: s.headline,
        cta: s.cta,
        badge: s.badge,
        effects: s.effects,
        activePreset: s.activePreset,
        promptHistory: s.promptHistory,
        chatHistory: s.chatHistory,
        designPlanSummary: s.designPlanSummary,
      }),
    ),
  );

  const showBeforeAfter = useAdStudio((s) => s.showBeforeAfter);
  const loadingInterpret = useAdStudio((s) => s.loadingInterpret);
  const exportStatus = useAdStudio((s) => s.exportStatus);
  const chatHistory = useAdStudio((s) => s.chatHistory);

  const applyPreset = useAdStudio((s) => s.applyPreset);
  const submitPrimaryPrompt = useAdStudio((s) => s.submitPrimaryPrompt);
  const submitChatIteration = useAdStudio((s) => s.submitChatIteration);
  const setUploadedImageSrc = useAdStudio((s) => s.setUploadedImageSrc);
  const applyWorkspacePatch = useAdStudio((s) => s.applyWorkspacePatch);
  const toggleBeforeAfter = useAdStudio((s) => s.toggleBeforeAfter);
  const undo = useAdStudio((s) => s.undo);
  const redo = useAdStudio((s) => s.redo);
  const setExportStatus = useAdStudio((s) => s.setExportStatus);
  const resetWorkspace = useAdStudio((s) => s.resetWorkspace);

  const displayWorkspace =
    showBeforeAfter ? minimalPreview(workspaceLive) : workspaceLive;

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (!f?.type.startsWith("image")) return;
      const url = URL.createObjectURL(f);
      setUploadedImageSrc(url, true);
    },
    [setUploadedImageSrc],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    disabled: loadingInterpret,
  });

  async function handleExport() {
    setExportStatus("exporting");
    try {
      await exportStageToFile(stageRef.current, "azr-ad-export.png");
      setExportStatus("done");
      setTimeout(() => setExportStatus("idle"), 1600);
    } catch {
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2200);
    }
  }

  return (
    <div className="relative min-h-[100vh] overflow-x-hidden bg-[#050915] pb-24 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-95">
        <div className="absolute -left-[16%] top-[-20%] h-[420px] w-[420px] rounded-full bg-sky-600/35 blur-[130px]" />
        <div className="absolute right-[-10%] top-[12%] h-[380px] w-[380px] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute bottom-[-12%] left-[30%] h-[360px] w-[360px] rounded-full bg-fuchsia-500/18 blur-[110px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#050915]/70 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/30">
              <Sparkles className="h-[18px] w-[18px] text-[#081225]" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold tracking-tight md:text-[17px]">
                  AZR Ad Studio
                </h1>
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-[2px] text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                  Client-only
                </span>
              </div>
              <p className="text-[13px] text-slate-400">
                Compose scroll-stopping product ads with conversational art direction · no API keys · no servers
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-xs uppercase tracking-[0.12em]"
              onClick={() => undo()}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" aria-hidden /> Undo
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-xs uppercase tracking-[0.12em]"
              onClick={() => redo()}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" aria-hidden /> Redo
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "text-xs",
                showBeforeAfter && "border-sky-300/40 bg-white/15",
              )}
              onClick={() => toggleBeforeAfter()}
            >
              <SplitSquareHorizontal className="mr-2 h-4 w-4" aria-hidden />
              Compare
            </Button>
            <Button
              type="button"
              variant="muted"
              onClick={() => resetWorkspace()}
              className="text-xs"
              title="Reset project"
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Reset
            </Button>
            <Button
              type="button"
              onClick={() => void handleExport()}
              disabled={
                !workspaceLive.uploadedImageSrc || exportStatus === "exporting"
              }
            >
              {exportStatus === "exporting" ?
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              : <Download className="mr-2 h-4 w-4" aria-hidden />}
              {exportStatus === "done" ? "Saved PNG" : "Download PNG"}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-8 lg:flex-row">
        <motion.section
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex min-h-[38vh] w-full flex-shrink-0 flex-col gap-4 lg:w-[330px]"
        >
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-4 shadow-xl shadow-black/25 backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-3 text-[12px] font-semibold uppercase tracking-[0.11em] text-slate-300">
              Hero unit
              {workspaceLive.uploadedImageSrc && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold lowercase tracking-normal text-emerald-200">
                  Locked in
                </span>
              )}
            </div>
            <button
              type="button"
              {...getRootProps()}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-dashed border-white/[0.12] px-6 py-9 text-center text-sm outline-none ring-sky-300/55 transition-[border,color,shadow] hover:border-sky-300/65 hover:bg-sky-950/25 focus-visible:border-sky-200/85 focus-visible:bg-sky-950/35 focus-visible:ring-2 disabled:opacity-55",
                isDragActive && "border-emerald-200/85 bg-emerald-500/[0.12]",
              )}
            >
              <input {...getInputProps()} aria-label="Upload product image" />
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-sky-500/[0.12] text-sky-200">
                {workspaceLive.uploadedImageSrc && (
                  <motion.span
                    className="pointer-events-none absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,#38bdf8_0%,transparent_60%)] opacity-65"
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
                  />
                )}
                <ImagePlus className="relative z-[1]" aria-hidden />
              </div>
              <div className="space-y-1">
                <p className="text-[15px] font-semibold text-white">
                  {workspaceLive.uploadedImageSrc ?
                    "Swap product imagery"
                  : "Drop or tap to upload"}
                </p>
                <p className="text-[12px] text-slate-400">
                  JPG / PNG transparent OK · Runs fully in-browser
                </p>
              </div>
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-white/[0.037] px-4 py-4 backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-300">
              Creative brief
              {loadingInterpret && (
                <Loader2 className="h-[15px] w-[15px] animate-spin text-sky-400" aria-hidden />
              )}
            </div>
            <textarea
              value={promptDraft}
              placeholder="Summer Instagram promo with luminous gradients & bold serif..."
              disabled={loadingInterpret}
              rows={6}
              onChange={(e) => setPromptDraft(e.target.value)}
              className="mb-4 w-full resize-none rounded-xl border border-white/[0.08] bg-[#081224]/92 px-3 py-3 text-[14px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/85 focus:bg-[#08162c]/94 focus:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.4)] disabled:opacity-65"
            />
            <Button
              className="mb-6 w-full"
              type="button"
              disabled={loadingInterpret}
              onClick={() => {
                const p = promptDraft.trim() || SAMPLE_PROMPTS[0]!;
                void submitPrimaryPrompt(p);
                setPromptDraft("");
              }}
            >
              <SunMedium className="mr-2 h-5 w-5 shrink-0" aria-hidden /> Generate concepts
            </Button>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Try a seed prompt
              </p>
              <div className="flex flex-col gap-2">
                {SAMPLE_PROMPTS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={loadingInterpret}
                    className="cursor-pointer rounded-lg border border-white/[0.05] px-3 py-2 text-left text-[13px] text-slate-300 transition hover:bg-white/[0.05]"
                    onClick={() => void submitPrimaryPrompt(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl">
            <header className="border-b border-white/[0.08] px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-sky-300/92">
              Iterative review
            </header>
            <div className="flex max-h-[320px] min-h-[180px] flex-col gap-3 overflow-auto px-3 py-4 text-[13px]">
              {chatHistory.length === 0 && (
                <p className="text-center text-slate-400">
                  Co-pilot reacts to tonal cues—try “lift contrast” or “punchier CTA.”
                </p>
              )}
              {chatHistory.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  className={cn(
                    "max-w-[95%] rounded-2xl border px-3 py-3 leading-relaxed",
                    msg.role === "user" ?
                      "ml-auto border-sky-500/25 bg-[#08243d]/94 text-sky-50"
                    : "mr-auto border-white/[0.08] bg-[#0b1327]/93 text-slate-200",
                  )}
                >
                  <p className="whitespace-pre-wrap text-[13px]">{msg.content}</p>
                  {Boolean(msg.proposedPatch) && Boolean(msg.applied) && msg.role === "assistant" && (
                    <span className="mt-2 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/[0.12] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                      Applied onto canvas
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            <form
              className="gap-3 border-t border-white/[0.08] p-4"
              onSubmit={(ev) => {
                ev.preventDefault();
                const t = chatDraft.trim();
                if (!t) return;
                submitChatIteration(t);
                setChatDraft("");
              }}
            >
              <textarea
                value={chatDraft}
                placeholder="Warm the palette · larger headline · reposition CTA"
                rows={2}
                disabled={loadingInterpret}
                onChange={(e) => setChatDraft(e.target.value)}
                className="mb-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#081224]/93 px-3 py-2 text-[13px] outline-none placeholder:text-slate-500 focus:border-emerald-300/95"
              />
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={loadingInterpret || !chatDraft.trim()}
              >
                Update creative
              </Button>
            </form>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0.3, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative flex min-h-[62vh] flex-1 flex-col items-center rounded-[26px] border border-white/[0.075] bg-gradient-to-br from-[#070f22]/95 via-[#050c1b]/93 to-black/93 px-3 py-6 shadow-inner shadow-black/60 backdrop-blur-2xl lg:py-12"
        >
          <AdCanvasInner
            workspace={displayWorkspace}
            exportRef={stageRef}
            containerScale={0.665}
            onPlacementChange={(p) =>
              applyWorkspacePatch({ productPlacement: p }, false)
            }
            onHeadlinePlacement={(coords) =>
              applyWorkspacePatch(
                { headline: { ...workspaceLive.headline, ...coords } },
                false,
              )
            }
            onCtaPlacement={(coords) =>
              applyWorkspacePatch(
                { cta: { ...workspaceLive.cta, ...coords } },
                false,
              )
            }
            onBadgePlacement={(coords) =>
              applyWorkspacePatch(
                { badge: { ...workspaceLive.badge, ...coords } },
                false,
              )
            }
            interactionDisabled={
              Boolean(showBeforeAfter) || Boolean(loadingInterpret)
            }
          />
          <footer className="mt-10 max-w-xl text-center text-[12px] text-slate-400">
            <span className="font-semibold text-slate-200">Active studio layer stack:</span>
            {" "}
            cinematic gradient · tonal mesh · kinetic props · luminous shadow bed · draggable hero /
            typography / commerce controls.
          </footer>
          {loadingInterpret && (
            <div className="pointer-events-none absolute inset-10 z-[2] rounded-3xl border border-sky-500/25 bg-black/72 px-12 py-9 text-center text-sm text-white shadow-2xl shadow-sky-500/35 backdrop-blur-xl">
              <Sparkles className="mx-auto mb-3 h-[23px] w-[23px] text-sky-300" aria-hidden />
              Parsing prompt intent · mixing palettes · staging composition…
              <motion.div className="mx-auto mt-5 flex h-[3px] w-48 rounded-full bg-slate-900/92">
                <motion.span
                  className="rounded-full bg-sky-300"
                  initial={{ flexBasis: "0%" }}
                  animate={{ flexBasis: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.05,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </motion.div>
            </div>
          )}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[320px]"
        >
          <div className="rounded-2xl border border-white/[0.095] bg-white/[0.037] px-4 py-4 backdrop-blur-2xl">
            <header className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Preset gallery
            </header>
            <div className="grid grid-cols-1 gap-2">
              {(PRESET_ORDER as ThemeId[]).map((id) => {
                const preset = PRESETS[id];
                const selected = workspaceLive.activePreset === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyPreset(id)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-[13px] transition-opacity",
                      selected ?
                        "border-sky-300/72 bg-[#08202f]/93 text-white opacity-100"
                      : "border-transparent bg-white/[0.05] opacity-94 hover:bg-white/[0.08]",
                    )}
                  >
                    <div className="font-semibold text-slate-100">{preset.label}</div>
                    <div className="mt-1 text-[12px] text-slate-400">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.096] bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
            <header className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Properties
            </header>
            <InspectorToggle
              label="Product shadow studio"
              active={workspaceLive.effects.productShadow}
              onClick={() =>
                applyWorkspacePatch(
                  {
                    effects: {
                      ...workspaceLive.effects,
                      productShadow: !workspaceLive.effects.productShadow,
                    },
                  },
                  true,
                )
              }
            />
            <InspectorToggle
              label="Edge glow halo"
              active={workspaceLive.effects.glow}
              onClick={() =>
                applyWorkspacePatch(
                  {
                    effects: {
                      ...workspaceLive.effects,
                      glow: !workspaceLive.effects.glow,
                    },
                  },
                  true,
                )
              }
            />
            <InspectorToggle
              label="Film grain / texture"
              active={workspaceLive.effects.grain}
              onClick={() =>
                applyWorkspacePatch(
                  {
                    effects: {
                      ...workspaceLive.effects,
                      grain: !workspaceLive.effects.grain,
                    },
                  },
                  true,
                )
              }
            />
            <InspectorToggle
              label="Poster frame softness"
              active={workspaceLive.effects.roundedFrame}
              onClick={() =>
                applyWorkspacePatch(
                  {
                    effects: {
                      ...workspaceLive.effects,
                      roundedFrame: !workspaceLive.effects.roundedFrame,
                    },
                  },
                  true,
                )
              }
            />
            <InspectorToggle
              label="Kinetic props"
              active={workspaceLive.effects.propsDecor}
              onClick={() =>
                applyWorkspacePatch(
                  {
                    effects: {
                      ...workspaceLive.effects,
                      propsDecor: !workspaceLive.effects.propsDecor,
                    },
                  },
                  true,
                )
              }
            />
            <InspectorToggle
              label="Backdrop depth wash"
              active={workspaceLive.background.blurBackdrop}
              onClick={() =>
                applyWorkspacePatch(
                  {
                    background: {
                      ...workspaceLive.background,
                      blurBackdrop: !workspaceLive.background.blurBackdrop,
                      backdropBlurStrength:
                        workspaceLive.background.backdropBlurStrength || 0.35,
                    },
                  },
                  true,
                )
              }
            />

            <div className="mt-4 space-y-4 pt-4 text-[13px] border-t border-white/[0.07]">
              <div>
                <p className="mb-2 flex justify-between gap-4 text-[12px] text-slate-400">
                  <span>Grain intensity</span>
                  <span className="text-sky-200">
                    {(workspaceLive.effects.grainOpacity * 100).toFixed(0)}%
                  </span>
                </p>
                <input
                  aria-label="grain intensity slider"
                  type="range"
                  min={4}
                  max={22}
                  value={workspaceLive.effects.grainOpacity * 100}
                  onChange={(ev) =>
                    applyWorkspacePatch(
                      {
                        effects: {
                          ...workspaceLive.effects,
                          grainOpacity: Number(ev.target.value) / 100,
                          grain: true,
                        },
                      },
                      false,
                    )
                  }
                  className="w-full accent-sky-400"
                />
              </div>
              <div>
                <p className="mb-2 text-[12px] text-slate-400">
                  Shadow altitude · {workspaceLive.effects.shadowBlur}
                </p>
                <input
                  aria-label="shadow blur slider"
                  type="range"
                  min={8}
                  max={88}
                  value={workspaceLive.effects.shadowBlur}
                  onChange={(ev) =>
                    applyWorkspacePatch(
                      {
                        effects: {
                          ...workspaceLive.effects,
                          shadowBlur: Number(ev.target.value),
                          productShadow: true,
                        },
                      },
                      false,
                    )
                  }
                  className="w-full accent-emerald-300"
                />
              </div>
            </div>
          </div>
        </motion.aside>
      </main>

      <div className="pointer-events-none fixed bottom-8 right-7 hidden xl:block">
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/72 px-3 py-2 text-[11px] text-white/76 backdrop-blur-lg">
          <Image src="/globe.svg" alt="" aria-hidden height={26} width={48} />
          <span>Vercel / Netlify static deploy ✓ — zero infra</span>
        </div>
      </div>
    </div>
  );
}

function InspectorToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-2 flex w-full items-center justify-between rounded-xl border border-white/[0.07] px-3 py-[10px] text-left text-[13px] hover:bg-white/[0.05]",
        active && "border-sky-400/45 bg-[#08203f]/88",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.11em]",
          active ? "text-emerald-200" : "text-slate-500",
        )}
      >
        {active ? "On" : "Off"}
      </span>
    </button>
  );
}
