import * as fs from "fs";
import * as path from "path";
import { WorkspaceValidator, ValidationResult } from "../validator.js";

export interface ValidateResult extends ValidationResult {
  file: string;
}

export function runValidate(filePath: string): ValidateResult {
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

  const result = new WorkspaceValidator().validateWorkspaceData(data);
  return { file: resolvedPath, ...result };
}
