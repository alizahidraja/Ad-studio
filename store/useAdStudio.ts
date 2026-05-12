import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ThemeId } from "@/types/design";
import type { WorkspaceSnapshot } from "@/types/design";
import type { ChatMessage } from "@/types/design";
import type { PromptHistoryItem } from "@/types/design";
import type { ExportStatus } from "@/types/design";
import type { DesignPlan } from "@/types/design";
import { cloneWorkspace } from "@/lib/cloneWorkspace";
import {
  createInitialWorkspace,
  mergeWorkspacePatch,
} from "@/lib/mergeWorkspacePatch";
import {
  inferDesignPlan,
  patchesFromPlan,
  summarizePlanAssistantMessage,
} from "@/lib/planFromPrompt";
import { PRESETS } from "@/constants/presets";
import { interpretChatMessage } from "@/lib/chatInterpreter";
import { applyPlacementPreset } from "@/lib/applyPlacementPreset";

const HISTORY_CAP = 32;

type StoreExtras = {
  exportStatus: ExportStatus;
  showBeforeAfter: boolean;
  loadingInterpret: boolean;
  lastPlan: DesignPlan | null;
  past: WorkspaceSnapshot[];
  future: WorkspaceSnapshot[];
};

export type StoreState = WorkspaceSnapshot & StoreExtras;

type Actions = {
  resetWorkspace: () => void;
  setUploadedImageSrc: (src: string | null, recordHistory?: boolean) => void;
  applyWorkspacePatch: (patch: Partial<WorkspaceSnapshot>, recordHistory?: boolean) => void;
  applyPreset: (theme: ThemeId) => void;
  submitPrimaryPrompt: (prompt: string) => Promise<void>;
  appendChatMessages: (...messages: ChatMessage[]) => void;
  submitChatIteration: (message: string) => void;
  markMessageApplied: (id: string) => void;
  setExportStatus: (status: ExportStatus) => void;
  toggleBeforeAfter: (value?: boolean) => void;
  setLoadingInterpret: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
};

export type FullStore = StoreState & Actions;

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `tmp-${Math.random().toString(36).slice(2, 10)}`;
}

export function toWorkspace(s: StoreState): WorkspaceSnapshot {
  return {
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
  };
}

const initialWorkspace = createInitialWorkspace();

const extraDefaults: StoreExtras = {
  exportStatus: "idle",
  showBeforeAfter: false,
  loadingInterpret: false,
  lastPlan: null,
  past: [],
  future: [],
};

export const useAdStudio = create<FullStore>()(
  persist(
    (set) => ({
      ...initialWorkspace,
      ...extraDefaults,

      resetWorkspace: () =>
        set({
          ...createInitialWorkspace(),
          ...extraDefaults,
        }),

      setUploadedImageSrc: (uploadedImageSrc, recordHistory = true) =>
        set((s) => ({
          ...s,
          uploadedImageSrc,
          past:
            recordHistory ?
              [...s.past, cloneWorkspace(toWorkspace(s))].slice(-HISTORY_CAP)
            : s.past,
          future: recordHistory ? [] : s.future,
        })),

      applyWorkspacePatch: (patch, recordHistory = true) =>
        set((s) => {
          const ws = toWorkspace(s);
          const merged = mergeWorkspacePatch(ws, patch);
          return {
            ...s,
            ...merged,
            past: recordHistory ? [...s.past, cloneWorkspace(ws)].slice(-HISTORY_CAP) : s.past,
            future: recordHistory ? [] : s.future,
          };
        }),

      applyPreset: (theme) =>
        set((s) => {
          const ws = toWorkspace(s);
          const preset = PRESETS[theme];
          const plan = inferDesignPlan(`${preset.description} preset`);
          let merged = mergeWorkspacePatch(ws, patchesFromPlan(ws, plan, preset));
          merged = mergeWorkspacePatch(merged, {
            headline: { ...merged.headline, text: preset.headlineText },
            cta: {
              ...merged.cta,
              text: preset.ctaText,
            },
            badge: {
              ...merged.badge,
              text: preset.badgeText ?? merged.badge.text,
            },
          });
          const assistant: ChatMessage = {
            id: uuid(),
            role: "assistant",
            content: `**${preset.label}** applied — ${preset.description}.`,
            timestamp: Date.now(),
            applied: true,
          };
          return {
            ...s,
            ...merged,
            activePreset: theme,
            lastPlan: plan,
            chatHistory: [...s.chatHistory, assistant],
            past: [...s.past, cloneWorkspace(ws)].slice(-HISTORY_CAP),
            future: [],
          };
        }),

      appendChatMessages: (...messages) =>
        set((s) => ({
          ...s,
          chatHistory: [...s.chatHistory, ...messages],
        })),

      submitPrimaryPrompt: async (prompt) => {
        const item: PromptHistoryItem = {
          id: uuid(),
          prompt,
          timestamp: Date.now(),
        };
        const userMsg: ChatMessage = {
          id: uuid(),
          role: "user",
          content: prompt,
          timestamp: Date.now(),
        };

        set((s) => ({
          ...s,
          loadingInterpret: true,
          promptHistory: [item, ...s.promptHistory].slice(0, 40),
          chatHistory: [...s.chatHistory, userMsg],
        }));

        await new Promise((r) => setTimeout(r, 460));

        set((s) => {
          const ws = toWorkspace(s);
          const plan = inferDesignPlan(prompt);
          const themeUse: ThemeId = plan.themeGuess ?? ws.activePreset;
          let merged = mergeWorkspacePatch(ws, patchesFromPlan(ws, plan, PRESETS[themeUse]));
          merged = mergeWorkspacePatch(merged, {
            headline: applyPlacementPreset(merged.headline, merged.headline.placementPreset),
          });

          const planMsg: ChatMessage = {
            id: uuid(),
            role: "assistant",
            ...summarizePlanAssistantMessage(plan),
            timestamp: Date.now(),
            proposedPatch: patchesFromPlan(ws, plan, PRESETS[themeUse]),
            applied: true,
          };

          return {
            ...s,
            ...merged,
            past: [...s.past, cloneWorkspace(ws)].slice(-HISTORY_CAP),
            future: [],
            activePreset: themeUse,
            lastPlan: plan,
            loadingInterpret: false,
            chatHistory: [...s.chatHistory, planMsg],
          };
        });
      },

      submitChatIteration: (message) =>
        set((s) => {
          const userMsg: ChatMessage = {
            id: uuid(),
            role: "user",
            content: message,
            timestamp: Date.now(),
          };
          const ws = toWorkspace(s);
          const { reply, patch } = interpretChatMessage(ws, message);
          const merged = mergeWorkspacePatch(ws, patch);

          const assistant: ChatMessage = {
            id: uuid(),
            role: "assistant",
            content: reply,
            timestamp: Date.now(),
            proposedPatch: patch,
            applied: true,
          };

          return {
            ...s,
            ...merged,
            past: [...s.past, cloneWorkspace(ws)].slice(-HISTORY_CAP),
            future: [],
            chatHistory: [...s.chatHistory, userMsg, assistant],
          };
        }),

      markMessageApplied: (id) =>
        set((s) => ({
          ...s,
          chatHistory: s.chatHistory.map((m) =>
            m.id === id ? { ...m, applied: true } : m,
          ),
        })),

      setExportStatus: (exportStatus) => set({ exportStatus }),
      toggleBeforeAfter: (value) =>
        set((s) => ({
          ...s,
          showBeforeAfter: value ?? !s.showBeforeAfter,
        })),
      setLoadingInterpret: (loadingInterpret) => set({ loadingInterpret }),

      undo: () =>
        set((s) => {
          if (s.past.length === 0) return s;
          const prev = s.past[s.past.length - 1]!;
          const ws = toWorkspace(s);
          return {
            ...s,
            ...prev,
            past: s.past.slice(0, -1),
            future: [cloneWorkspace(ws), ...s.future].slice(0, HISTORY_CAP),
            exportStatus: "idle",
          };
        }),

      redo: () =>
        set((s) => {
          if (s.future.length === 0) return s;
          const next = s.future[0]!;
          const ws = toWorkspace(s);
          return {
            ...s,
            ...next,
            future: s.future.slice(1),
            past: [...s.past, cloneWorkspace(ws)].slice(-HISTORY_CAP),
            exportStatus: "idle",
          };
        }),
    }),
    {
      name: "azr-ad-studio-v1",
      storage:
        typeof window !== "undefined" ?
          createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          })),
      partialize: (s): WorkspaceSnapshot => ({
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
      version: 1,
    },
  ),
);
