import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AlbumiApiClient } from "../lib/api-client.js";
import { runPush } from "../lib/commands/push.js";

export function registerPushTool(server: McpServer, getApiClient: () => AlbumiApiClient) {
  server.tool(
    "push_workspace",
    "Upload a local workspace JSON file to the server. Creates an ACR (Architecture Change Request) so changes can be reviewed before applying.",
    {
      file_path: z.string().describe("Path to the workspace JSON file"),
      name: z.string().optional().describe("Name for the ACR"),
      workspace_id: z
        .string()
        .uuid()
        .optional()
        .describe("Target workspace ID. If omitted, reads from metadata.workspaceId in the JSON file."),
    },
    async ({ file_path, name, workspace_id }) => {
      try {
        const result = await runPush({ filePath: file_path, name, workspaceId: workspace_id }, getApiClient());
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          _meta: {},
          annotations: { readOnlyHint: false, destructiveHint: true },
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
