import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runValidate } from "../lib/commands/validate.js";

export function registerValidateTool(server: McpServer) {
  server.tool(
    "validate",
    "Check a local workspace JSON file against the schema and referential integrity rules. Returns all validation errors found. Run this after every edit to catch issues early.",
    {
      file_path: z.string().describe("Path to the workspace JSON file"),
    },
    async ({ file_path }) => {
      try {
        const result = runValidate(file_path);
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
