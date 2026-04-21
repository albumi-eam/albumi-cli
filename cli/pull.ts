import { AlbumiApiClient } from "../lib/api-client.js";
import { runPull } from "../lib/commands/pull.js";
import { c, die } from "./format.js";

export async function runPullCli(argv: string[]): Promise<void> {
  const { flags } = parseArgs(argv);
  if (flags.help) {
    console.log("Usage: albumi pull [--workspace <id>] [-o <file>] [--json]");
    process.exit(0);
  }

  const workspaceId = typeof flags.workspace === "string" ? flags.workspace : undefined;
  const filePath = typeof flags.o === "string" ? flags.o : typeof flags.out === "string" ? flags.out : undefined;

  let api: AlbumiApiClient;
  try {
    api = new AlbumiApiClient();
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }

  let result;
  try {
    result = await runPull({ workspaceId, filePath }, api);
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }

  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(0);
  }

  if (result.action === "select_workspace") {
    console.log(c.bold("Available workspaces:"));
    for (const w of result.workspaces) {
      console.log(`  ${c.dim(w.workspaceId)}  ${c.bold(w.name)}  ${c.dim(`(${w.role})`)}`);
    }
    console.log(`\nRe-run with: ${c.bold("--workspace <id>")}`);
    process.exit(0);
  }

  console.log(`${c.green("✓")} Pulled ${c.bold(result.workspace.name)}`);
  console.log(`  ${c.dim("file:")}   ${result.file}`);
  console.log(`  ${c.dim("size:")}   ${(result.sizeBytes / 1024).toFixed(1)} KB`);
  const entityLine = Object.entries(result.entities)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${k}`)
    .join(", ");
  if (entityLine) console.log(`  ${c.dim("entities:")} ${entityLine}`);
  process.exit(0);
}

function parseArgs(argv: string[]): { flags: Record<string, string | boolean> } {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o") {
      flags.o = argv[++i];
    } else if (a === "-h" || a === "--help") {
      flags.help = true;
    } else if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--") && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return { flags };
}
