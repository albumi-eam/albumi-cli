import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AlbumiApiClient } from "../lib/api-client.js";
import { runPull } from "../lib/commands/pull.js";

export function registerPullTool(server: McpServer, getApiClient: () => AlbumiApiClient) {
  server.tool(
    "pull_workspace",
    "Download the current workspace from the server and save it as a local JSON file. This is the starting point of the edit workflow: pull → edit → validate → audit → push.",
    {
      file_path: z
        .string()
        .optional()
        .describe("Where to save the file. If omitted, generates a smart name from workspace name and timestamp."),
      workspace_id: z
        .string()
        .uuid()
        .optional()
        .describe("Workspace ID to pull. If omitted, returns a list of available workspaces to choose from."),
    },
    async ({ file_path, workspace_id }) => {
      try {
        const result = await runPull({ filePath: file_path, workspaceId: workspace_id }, getApiClient());
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          _meta: {},
          annotations: { readOnlyHint: result.action === "select_workspace", destructiveHint: false },
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
