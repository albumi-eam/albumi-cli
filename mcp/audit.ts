import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAudit } from "../lib/commands/audit.js";

export function registerAuditTool(server: McpServer) {
  server.tool(
    "audit",
    "Run deterministic architecture analysis on a local workspace JSON file. Checks structural integrity, data quality, lifecycle coherence, data flow consistency, and compliance. Returns findings with severity levels.",
    {
      file_path: z.string().describe("Path to the workspace JSON file"),
    },
    async ({ file_path }) => {
      try {
        const result = runAudit(file_path);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          _meta: {},
          annotations: { readOnlyHint: true, destructiveHint: false },
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }) }],
          isError: true,
        };
      }
    },
  );
}
