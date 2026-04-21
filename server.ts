#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AlbumiApiClient } from "./lib/api-client.js";
import { registerPullTool } from "./mcp/pull.js";
import { registerValidateTool } from "./mcp/validate.js";
import { registerAuditTool } from "./mcp/audit.js";
import { registerPushTool } from "./mcp/push.js";
import { registerPullPrompt } from "./prompts/pull.js";
import { registerValidatePrompt } from "./prompts/validate.js";
import { registerAuditPrompt } from "./prompts/audit.js";
import { registerPushPrompt } from "./prompts/push.js";
import { registerGeneratePrompt } from "./prompts/generate.js";

const server = new McpServer({
  name: "albumi-workspace",
  version: "1.0.0",
});

// Lazy API client — created on first use, so MCP server starts even without credentials
let _apiClient: AlbumiApiClient | null = null;
function getApiClient(): AlbumiApiClient {
  if (!_apiClient) {
    _apiClient = new AlbumiApiClient();
  }
  return _apiClient;
}

// 4 tools: pull → validate → audit → push
registerPullTool(server, getApiClient);
registerValidateTool(server);
registerAuditTool(server);
registerPushTool(server, getApiClient);

// 5 prompts: 4 matching tools + generate
registerPullPrompt(server);
registerValidatePrompt(server);
registerAuditPrompt(server);
registerPushPrompt(server);
registerGeneratePrompt(server);

// Resources: schema + enums (bundled at build time into dist/data/)
const dataDir = path.resolve(__dirname, "data");
const schemaPath = path.join(dataDir, "workspace.v1.schema.json");
const enumsJsonPath = path.join(dataDir, "enums.json");

server.resource(
  "workspace-schema",
  "albumi://schema/workspace.v1",
  {
    description: "JSON Schema for Albumi workspace export/import format (v1)",
    mimeType: "application/json",
  },
  async () => ({
    contents: [
      {
        uri: "albumi://schema/workspace.v1",
        text: fs.readFileSync(schemaPath, "utf-8"),
        mimeType: "application/json",
      },
    ],
  }),
);

server.resource(
  "enums",
  "albumi://enums",
  {
    description:
      "All enum values with human-readable labels used in Albumi workspace data",
    mimeType: "application/json",
  },
  async () => ({
    contents: [
      {
        uri: "albumi://enums",
        text: fs.readFileSync(enumsJsonPath, "utf-8"),
        mimeType: "application/json",
      },
    ],
  }),
);

// CLI router: subcommands run standalone, no args = MCP stdio server
const command = process.argv[2];
const rest = process.argv.slice(3);

if (command === "login") {
  const manual = rest.includes("--manual");
  import("./cli/login.js").then(({ runLogin }) => runLogin(undefined, manual));
} else if (command === "validate") {
  import("./cli/validate.js").then(({ runValidateCli }) =>
    runValidateCli(rest),
  );
} else if (command === "audit") {
  import("./cli/audit.js").then(({ runAuditCli }) => runAuditCli(rest));
} else if (command === "pull") {
  import("./cli/pull.js").then(({ runPullCli }) => runPullCli(rest));
} else if (command === "push") {
  import("./cli/push.js").then(({ runPushCli }) => runPushCli(rest));
} else if (command === "mcp" || command === "server") {
  // Explicit MCP-server mode (same as no args; useful for disambiguating wrappers)
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error("MCP server error:", err);
    process.exit(1);
  });
} else if (command === "--help" || command === "-h" || command === "help") {
  console.log(`albumi — Albumi EAM CLI and MCP server

Usage:
  albumi <command> [options]
  albumi                                   Start MCP stdio server (default when no command)

Authentication:
  login [--manual]                         Authenticate via browser (--manual: skip browser, copy-paste token)

Workspace commands (also exposed as MCP tools):
  pull [--workspace <id>] [-o <file>]      Download workspace as local JSON (lists workspaces if --workspace omitted)
  validate <file> [--json]                 Schema + referential integrity check (deterministic, safe for CI)
  audit <file> [--severity <level>] [--json]
                                           EAM analysis across ~70 checks (deterministic)
  push <file> [--workspace <id>] [--name <acr>]
                                           Upload as an ACR (Architecture Change Request)

MCP server mode (for AI agents):
  mcp | server                             Explicit MCP stdio mode (same as running with no args)

Exit codes:
  0 — success
  1 — validation errors, critical audit findings, or runtime error

Examples:
  albumi login
  albumi pull --workspace 1234-...
  albumi validate ./workspace.json
  albumi audit ./workspace.json --severity warning
  albumi push ./workspace.json --name "Refactor auth boundary"

Claude Code setup:
  albumi login
  claude mcp add albumi -- albumi
`);
} else if (command) {
  console.error(`Unknown command: ${command}\nRun "albumi --help" for usage.`);
  process.exit(1);
} else {
  // Default: start MCP stdio server
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error("MCP server error:", err);
    process.exit(1);
  });
}
