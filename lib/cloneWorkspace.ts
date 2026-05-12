import type { WorkspaceSnapshot } from "@/types/design";

export function cloneWorkspace(workspace: WorkspaceSnapshot): WorkspaceSnapshot {
  return structuredClone(workspace);
}
