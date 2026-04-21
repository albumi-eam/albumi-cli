import { AlbumiApiClient } from "../lib/api-client.js";
import { runPush } from "../lib/commands/push.js";
import { c, die } from "./format.js";

export async function runPushCli(argv: string[]): Promise<void> {
  const { positional, flags } = parseArgs(argv);
  if (flags.help) {
    console.log("Usage: albumi push <file> [--workspace <id>] [--name <acr-name>] [--json]");
    process.exit(0);
  }
  const filePath = positional[0];
  if (!filePath) die("Usage: albumi push <file> [--workspace <id>] [--name <acr-name>]");

  const workspaceId = typeof flags.workspace === "string" ? flags.workspace : undefined;
  const name = typeof flags.name === "string" ? flags.name : undefined;

  let api: AlbumiApiClient;
  try {
    api = new AlbumiApiClient();
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }

  let result;
  try {
    result = await runPush({ filePath, workspaceId, name }, api);
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }

  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.success ? 0 : 1);
  }

  if (!result.success) {
    console.log(`${c.red("✗")} Push failed.`);
    process.exit(1);
  }

  console.log(`${c.green("✓")} Pushed ${c.bold(result.file)}`);
  if (result.workspace) console.log(`  ${c.dim("workspace:")} ${result.workspace.name}`);
  if (result.acrId) console.log(`  ${c.dim("acr:")}       ${result.acrName ?? result.acrId}`);
  const counts = Object.entries(result.counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${k}`)
    .join(", ");
  if (counts) console.log(`  ${c.dim("imported:")}  ${counts}`);
  process.exit(0);
}

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, string | boolean> } {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") {
      flags.help = true;
    } else if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}
