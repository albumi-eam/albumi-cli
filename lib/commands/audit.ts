import * as fs from "fs";
import * as path from "path";
import { analyzeWorkspace, AnalysisFinding } from "../analyzer.js";

export interface AuditSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
}

export interface AuditResult {
  file: string;
  summary: AuditSummary;
  findings: AnalysisFinding[];
}

export function runAudit(filePath: string): AuditResult {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  const findings = analyzeWorkspace(data);
  const summary: AuditSummary = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  return { file: resolvedPath, summary, findings };
}
