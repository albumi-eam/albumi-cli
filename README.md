# albumi-cli

Albumi EAM — CLI, MCP server, and Claude Code plugin in one repo. The command-line tool for [Albumi](https://albumi.app) — Enterprise Architecture Management that AI agents can actually work with.

Bundles:
- An **MCP server** (`albumi`) with four tools: `pull_workspace`, `validate`, `audit`, `push_workspace`.
- A **skill** (`albumi-workspace`) that teaches the agent when to run CLI checks vs. drive the full edit loop through MCP.

Behind both is the [`@albumi/cli`](https://www.npmjs.com/package/@albumi/cli) package — same binary, two modes (MCP stdio server without arguments; CLI with subcommands).

## Prerequisites

- **Node.js 20+** — run `node --version` to check.
- An Albumi account — [sign up](https://my.albumi.app/) if you don't have one.

## Install

Three options depending on your setup.

### Option A — Claude Code plugin (recommended for Claude Code users)

```
/plugin marketplace add albumi-eam/albumi-cli
/plugin install albumi@albumi-cli
/reload-plugins
```

(The last command activates the MCP server and skill for the current session.)

This registers the MCP server and installs the `albumi-workspace` skill. Then:

```bash
albumi login
```

### Option B — Cursor / Claude Desktop / other MCP clients

Install the CLI globally:

```bash
npm install -g @albumi/cli
albumi login
```

Then add the MCP server to your client's config.

**Cursor** — add to `~/.cursor/mcp.json` (or `.cursor/mcp.json` in your project):

```json
{
  "mcpServers": {
    "albumi": {
      "command": "albumi"
    }
  }
}
```

**Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "albumi": {
      "command": "albumi"
    }
  }
}
```

**Any stdio-compatible MCP client** — the binary is `albumi` (or `npx -y @albumi/cli` if you didn't install globally), transport is **stdio**, no arguments.

Restart the client — the `albumi` tools appear in your agent.

### Option C — CLI only (no AI agent, CI use, scripting)

```bash
npm install -g @albumi/cli
albumi login
```

You now have:

```bash
albumi pull --workspace <id>      # download workspace as JSON
albumi validate ./ws.json         # schema + referential integrity (exits 1 on errors)
albumi audit ./ws.json            # ~70 EAM checks (exits 1 on critical findings)
albumi push ./ws.json             # upload as an Architecture Change Request
albumi --help                     # full reference
```

Exit codes make it safe for CI pipelines, pre-commit hooks, Make targets.

For CI without interactive login, set `ALBUMI_API_TOKEN` as a secret.

## What the agent gets

| Tool | What it does |
|------|--------------|
| `pull_workspace` | Download a workspace as JSON (lists workspaces if no ID) |
| `validate` | Schema + referential integrity — deterministic, no LLM |
| `audit` | ~70 EAM checks across 16 categories — deterministic, no LLM |
| `push_workspace` | Upload as an ACR (Architecture Change Request) |

The `albumi-workspace` skill (Claude Code only, via Option A) routes the agent:
- One-shot checks → suggest CLI (`albumi validate <file>`).
- Edit loops → drive MCP tools in sequence (`pull → edit → validate → audit → push`).

Other MCP clients still get the tools; they don't get the routing skill.

## Example prompts

Once connected, just talk to your agent:

> "Pull our Albumi workspace and show me every End-of-Life application."

> "Here's our architecture wiki page. Generate applications, integrations, and data objects. Validate, then push as 'Initial import'."

> "Fix all critical audit findings, then re-audit."

## Documentation

- Full docs: [docs.albumi.app](https://docs.albumi.app/)
- MCP setup: [docs.albumi.app/ai/mcp-setup](https://docs.albumi.app/ai/mcp-setup/)
- CLI reference: `albumi --help`

## License

MIT
