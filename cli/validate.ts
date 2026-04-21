import { runValidate } from "../lib/commands/validate.js";
import { c, die } from "./format.js";

export function runValidateCli(argv: string[]): void {
  const { positional, flags } = parseArgs(argv);
  const filePath = positional[0];
  if (!filePath) die("Usage: albumi validate <file> [--json]");

  let result;
  try {
    result = runValidate(filePath);
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }

  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.valid ? 0 : 1);
  }

  console.log(c.dim(result.file));
  if (result.valid) {
    console.log(`${c.green("✓")} Valid — schema + referential integrity checks passed.`);
    process.exit(0);
  }

  console.log(`${c.red("✗")} ${result.errors.length} error${result.errors.length === 1 ? "" : "s"}:`);
  for (const err of result.errors) {
    console.log(`  ${c.red("•")} ${c.bold(err.path)} — ${err.message}`);
  }
  process.exit(1);
}

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, boolean> } {
  const positional: string[] = [];
  const flags: Record<string, boolean> = {};
  for (const a of argv) {
    if (a.startsWith("--")) flags[a.slice(2)] = true;
    else positional.push(a);
  }
  return { positional, flags };
}
