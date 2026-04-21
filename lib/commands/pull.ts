import * as fs from "fs";
import * as path from "path";
import { AlbumiApiClient } from "../api-client.js";

export interface WorkspaceListItem {
  workspaceId: string;
  name: string;
  role: string;
}

interface WorkspaceInfo {
  workspaceId: string;
  name: string;
}

export interface PullListResult {
  action: "select_workspace";
  workspaces: WorkspaceListItem[];
}

export interface PullFileResult {
  action: "pulled";
  file: string;
  workspace: { workspaceId: string; name: string };
  sizeBytes: number;
  entities: Record<string, number>;
}

export type PullResult = PullListResult | PullFileResult;

export interface PullOptions {
  workspaceId?: string;
  filePath?: string;
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

export async function runPull(opts: PullOptions, api: AlbumiApiClient): Promise<PullResult> {
  if (!opts.workspaceId) {
    const workspaces = await api.get<WorkspaceListItem[]>("/workspaces");
    return {
      action: "select_workspace",
      workspaces: workspaces.map((w) => ({ workspaceId: w.workspaceId, name: w.name, role: w.role })),
    };
  }

  const wsHeaders = { "X-Workspace-Id": opts.workspaceId };
  const [data, workspaceInfo] = await Promise.all([
    api.get<Record<string, unknown>>("/workspace/export", wsHeaders),
    api.get<WorkspaceInfo>("/workspace", wsHeaders),
  ]);

  const targetPath = opts.filePath
    ? path.resolve(opts.filePath)
    : path.resolve(process.cwd(), `albumi-${sanitizeName(workspaceInfo.name || "workspace")}-${formatTimestamp()}.json`);

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(targetPath, json, "utf-8");

  const countEntities = (key: string) =>
    Array.isArray((data as Record<string, unknown>)[key]) ? ((data as Record<string, unknown>)[key] as unknown[]).length : 0;

  return {
    action: "pulled",
    file: targetPath,
    workspace: { workspaceId: opts.workspaceId, name: workspaceInfo.name },
    sizeBytes: Buffer.byteLength(json),
    entities: {
      organizations: countEntities("organizations"),
      businessCapabilities: countEntities("businessCapabilities"),
      dataObjects: countEntities("dataObjects"),
      itComponents: countEntities("itComponents"),
      applications: countEntities("applications"),
      integrations: countEntities("integrations"),
      initiatives: countEntities("initiatives"),
    },
  };
}
