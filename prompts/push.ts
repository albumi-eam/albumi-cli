import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const PUSH_PROMPT = `Upload a local workspace JSON file to the Albumi server.

## Instructions

1. Read the workspace JSON file to get \`metadata.workspaceId\` and \`metadata.workspaceName\`.
   - If the user didn't specify a path, use \`./workspace.json\` (the default from pull).
2. Confirm with the user: "Pushing to workspace **{workspaceName}**. Correct?"
   - Wait for confirmation before proceeding.
3. Ask the user which import mode to use (if not already specified):
   - **ACR** (default) — creates an Architecture Change Request with all changes as reviewable drafts. Safe, reversible. Recommended for workspaces with existing data.
   - **Direct** — applies changes immediately. Only for empty/new workspaces.
4. Call the \`push_workspace\` tool with the file path and chosen mode.
   - The workspace_id is read from the file's metadata automatically.
5. Report: mode used, entity counts, ACR ID (if acr mode).
6. If ACR mode — remind the user to review and approve the ACR in the UI before changes take effect.

## Pre-push check

Before pushing, suggest running \`validate\` to catch errors:
\`\`\`bash
jq '.applications | length' workspace.json   # quick sanity check
\`\`\`
Pushing invalid JSON will fail server-side validation.`;

export function registerPushPrompt(server: McpServer) {
  server.prompt(
    'push_workspace',
    'Upload a local workspace JSON file to the server. Creates a reviewable ACR by default, or applies directly.',
    async () => ({
      messages: [
        {
          role: 'user' as const,
          content: { type: 'text' as const, text: PUSH_PROMPT },
        },
      ],
    }),
  );
}
