import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const VALIDATE_PROMPT = `Validate a local workspace JSON file against the schema and referential integrity rules.

## Instructions

1. Call the \`validate\` tool with the file path.
   - If the user didn't specify a path, use \`./workspace.json\` (the default from pull).
2. If valid — confirm and suggest running \`/albumi-workspace:audit\` for deeper analysis.
3. If errors found:
   - List each error with its path and message.
   - Suggest specific fixes for each error.
   - After the user makes fixes, they can re-run this command to verify.

## Working with the file

Use \`jq\` via Bash to inspect and fix specific sections instead of reading the entire JSON:
\`\`\`bash
jq '.applications[2]' workspace.json                    # inspect the problematic entity
jq '.applications[2].organizationId' workspace.json     # check a specific reference
jq '.organizations[] | .id' workspace.json              # list valid org IDs
\`\`\`
For edits, use the Edit tool on the JSON file targeting the specific line, or \`jq\` for structural changes:
\`\`\`bash
jq '.applications[2].organizationId = "correct-uuid"' workspace.json > tmp.json && mv tmp.json workspace.json
\`\`\``;

export function registerValidatePrompt(server: McpServer) {
  server.prompt(
    'validate',
    'Check a local workspace JSON file for schema and referential integrity errors.',
    async () => ({
      messages: [
        {
          role: 'user' as const,
          content: { type: 'text' as const, text: VALIDATE_PROMPT },
        },
      ],
    }),
  );
}
