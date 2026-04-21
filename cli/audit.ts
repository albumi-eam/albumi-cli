import { runAudit } from "../lib/commands/audit.js";
import { AnalysisFinding, Category, Severity } from "../lib/analyzer.js";
import { c, die } from "./format.js";

const ALL_CATEGORIES: Category[] = [
  "structural_integrity",
  "data_quality",
  "architecture_consistency",
  "lifecycle_coherence",
  "network_analysis",
  "cross_mapping_consistency",
  "redundancy",
  "organizational_coverage",
  "initiative_alignment",
  "migration_planning",
  "portfolio_health",
  "compliance_risk",
  "technology_risk",
  "data_governance",
  "complexity",
  "strategic_alignment",
];

const SEV_RANK: Record<Severity, number> = { critical: 3, warning: 2, info: 1 };

function prettyCategory(cat: string): string {
  return cat.replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase());
}

function sevLabel(sev: Severity): string {
  if (sev === "critical") return c.red("CRIT");
  if (sev === "warning") return c.yellow("WARN");
  return c.dim("INFO");
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function runAuditCli(argv: string[]): void {
  const { positional, flags } = parseArgs(argv);
  if (flags.help) {
    console.log("Usage: albumi audit <file> [--severity critical|warning|info] [--json]");
    process.exit(0);
  }
  const filePath = positional[0];
  if (!filePath) die("Usage: albumi audit <file> [--severity critical|warning|info] [--json]");

  let result;
  try {
    result = runAudit(filePath);
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }

  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.summary.critical > 0 ? 1 : 0);
  }

  const min = typeof flags.severity === "string" ? flags.severity : "info";
  const threshold = SEV_RANK[min as Severity] ?? 1;

  // Group findings by category, drop anything below threshold
  const byCat = new Map<Category, AnalysisFinding[]>();
  for (const f of result.findings) {
    if ((SEV_RANK[f.severity] ?? 0) < threshold) continue;
    const arr = byCat.get(f.category) ?? [];
    arr.push(f);
    byCat.set(f.category, arr);
  }

  const width = 64;
  const rule = c.dim("─".repeat(width));
  const thick = c.dim("━".repeat(width));

  console.log(c.dim(result.file));
  console.log(thick);
  console.log(
    `${c.bold("Summary:")} ${c.red(plural(result.summary.critical, "critical", "critical"))} · ${c.yellow(plural(result.summary.warning, "warning", "warnings"))} · ${c.dim(plural(result.summary.info, "info", "info"))} · ${result.summary.total} total`,
  );
  console.log(rule);

  // Category matrix — always show all 16, so the reader sees what's clean
  const nameCol = Math.max(...ALL_CATEGORIES.map((c) => prettyCategory(c).length)) + 2;
  for (const cat of ALL_CATEGORIES) {
    const found = byCat.get(cat) ?? [];
    const label = prettyCategory(cat).padEnd(nameCol, " ");
    if (found.length === 0) {
      console.log(`  ${c.green("✓")} ${label}${c.dim("OK")}`);
    } else {
      const crit = found.filter((f) => f.severity === "critical").length;
      const warn = found.filter((f) => f.severity === "warning").length;
      const info = found.filter((f) => f.severity === "info").length;
      const breakdown = [
        crit > 0 ? c.red(`${crit} critical`) : "",
        warn > 0 ? c.yellow(`${warn} warning`) : "",
        info > 0 ? c.dim(`${info} info`) : "",
      ]
        .filter(Boolean)
        .join(", ");
      console.log(
        `  ${c.red("✗")} ${label}${plural(found.length, "issue", "issues").padEnd(12, " ")}${c.dim("(" + breakdown + ")")}`,
      );
    }
  }
  console.log(thick);

  // Detail listing for categories with findings
  const categoriesWithFindings = ALL_CATEGORIES.filter((cat) => (byCat.get(cat)?.length ?? 0) > 0);

  if (categoriesWithFindings.length === 0) {
    console.log("");
    console.log(`${c.green("✓")} No findings at or above ${c.bold(min)} severity — workspace looks clean.`);
    process.exit(result.summary.critical > 0 ? 1 : 0);
  }

  for (const cat of categoriesWithFindings) {
    const findings = byCat.get(cat)!;
    // Sort by severity desc within category
    findings.sort((a, b) => (SEV_RANK[b.severity] ?? 0) - (SEV_RANK[a.severity] ?? 0));

    console.log("");
    console.log(`${c.bold(prettyCategory(cat))} ${c.dim(`(${findings.length})`)}`);
    for (const f of findings) {
      const entity = f.entityName ?? f.entityId;
      const entityPart = f.entityType && entity ? c.dim(` [${f.entityType}: ${entity}]`) : "";
      console.log(`  ${sevLabel(f.severity)} ${c.bold(f.checkId)}${entityPart} — ${f.message}`);
      if (f.relatedEntities && f.relatedEntities.length > 0) {
        const refs = f.relatedEntities.map((e) => `${e.entityType}:${e.entityName ?? e.entityId} (${e.role})`).join(", ");
        console.log(`            ${c.dim("↳ " + refs)}`);
      }
    }
  }

  console.log("");
  if (result.summary.critical > 0) {
    console.log(
      `${c.red("✗")} ${plural(result.summary.critical, "critical finding", "critical findings")} — needs attention before push.`,
    );
    process.exit(1);
  }
  console.log(`${c.yellow("!")} ${plural(result.summary.total, "finding", "findings")} — no criticals, safe to push.`);
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
