import * as fs from "fs";
import * as path from "path";
import { AlbumiApiClient } from "../api-client.js";

interface ImportResult {
  success: boolean;
  acrId?: string | null;
  acrName?: string;
  counts: Record<string, number>;
}

interface WorkspaceInfo {
  workspaceId: string;
  name: string;
}

export interface PushOptions {
  filePath: string;
  name?: string;
  workspaceId?: string;
}

export interface PushResult extends ImportResult {
  file: string;
  workspace?: { workspaceId: string; name: string };
}

export async function runPush(opts: PushOptions, api: AlbumiApiClient): Promise<PushResult> {
  const resolvedPath = path.resolve(opts.filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (opts.name && typeof data === "object" && data !== null) {
    const ws = data as Record<string, unknown>;
    ws.metadata = { ...((ws.metadata as Record<string, unknown>) || {}), source: opts.name };
  }

  let resolvedWorkspaceId = opts.workspaceId;
  if (!resolvedWorkspaceId && typeof data === "object" && data !== null) {
    const metadata = (data as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
    if (metadata && typeof metadata.workspaceId === "string") {
      resolvedWorkspaceId = metadata.workspaceId;
    }
  }

  const extraHeaders: Record<string, string> = {};
  if (resolvedWorkspaceId) {
    extraHeaders["X-Workspace-Id"] = resolvedWorkspaceId;
  }

  const result = await api.post<ImportResult>("/workspace/import", data, extraHeaders);

  let workspaceInfo: WorkspaceInfo | undefined;
  if (resolvedWorkspaceId) {
    try {
      workspaceInfo = await api.get<WorkspaceInfo>("/workspace", { "X-Workspace-Id": resolvedWorkspaceId });
    } catch {
      // non-critical
    }
  }

  const response: PushResult = { file: resolvedPath, ...result };
  if (workspaceInfo && resolvedWorkspaceId) {
    response.workspace = { workspaceId: resolvedWorkspaceId, name: workspaceInfo.name };
  }
  return response;
}
