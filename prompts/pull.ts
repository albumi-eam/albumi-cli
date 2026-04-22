import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const PULL_PROMPT = `Download a workspace from the Albumi server and save it as a local JSON file.

## Instructions

1. Call the \`pull_workspace\` tool **without** \`workspace_id\` to get the list of available workspaces.
2. Show the list to the user and ask which workspace they want to pull.
3. Call \`pull_workspace\` **again** with the chosen \`workspace_id\`.
   - If the user specified a file path, pass it as \`file_path\`.
   - Otherwise the default is \`./workspace.json\`.
4. Report: file path, workspace name, size, entity counts.
5. Remind the user of the next steps:
   - Edit the file as needed
   - Run \`/mcp__albumi__validate\` to check for errors
   - Run \`/mcp__albumi__audit\` for architecture analysis
   - When ready, run \`/mcp__albumi__push_workspace\` to send changes back to the server

## Working with the file

Use \`jq\` via Bash to inspect and edit specific sections instead of reading the entire JSON into context:
\`\`\`bash
jq '.applications | length' workspace.json          # count apps
jq '.applications[] | {name, id}' workspace.json    # list app names
jq '.integrations[] | select(.sourceApplicationId == "ID")' workspace.json  # filter
jq '.applications[0].dataObjects' workspace.json    # inspect nested array
\`\`\`
This keeps context small — workspace files can be thousands of lines.`;

export function registerPullPrompt(server: McpServer) {
  server.prompt(
    "pull_workspace",
    "Download the workspace from the server to a local file. Starting point of the edit workflow.",
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text: PULL_PROMPT },
        },
      ],
    }),
  );
}
