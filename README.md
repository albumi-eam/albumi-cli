# @albumi/cli

**The CLI and MCP server for [Albumi](https://albumi.app)** — AI-powered Enterprise Architecture Management. One binary (`albumi`) in two modes: command-line tool for your terminal and CI, and a Model Context Protocol server for AI agents like Claude Code, Cursor, and Claude Desktop.

[📖 Documentation](https://docs.albumi.app/ai/mcp-setup/) · [🌐 albumi.app](https://albumi.app) · [📦 npm](https://www.npmjs.com/package/@albumi/cli) · [🐛 Issues](https://github.com/albumi-eam/albumi-cli/issues)

## Prerequisites

- **Node.js 24+** recommended (20 minimum).
- An Albumi account — [sign up](https://my.albumi.app/) if you don't have one.

## Install

```bash
npm install -g @albumi/cli
albumi login
```

Then, in Claude Code, register the plugin (MCP server + routing skill in one step):

```
/plugin marketplace add albumi-eam/albumi-cli
/plugin install albumi@albumi-cli
/reload-plugins
```

For **Cursor**, **Claude Desktop**, or other MCP clients — see the [MCP Setup Guide](https://docs.albumi.app/ai/mcp-setup/) for per-client configuration.

## What it does

Four operations, exposed both as CLI subcommands and as MCP tools:

| Tool | CLI | What |
|------|-----|------|
| `pull_workspace` | `albumi pull` | Download an Albumi workspace as local JSON |
| `validate` | `albumi validate` | Schema + referential-integrity check. Deterministic, no LLM. |
| `audit` | `albumi audit` | ~70 EAM architecture checks across 16 categories. Deterministic, no LLM. |
| `push_workspace` | `albumi push` | Upload changes as a reviewable Architecture Change Request |

CLI exits `0` on success, `1` on failure — safe for CI pipelines and pre-commit hooks. Run `albumi --help` for the full reference.

Plus a Claude Code skill (`albumi-workspace`, invoked as `/albumi-workspace`) that teaches the agent when to use CLI vs. MCP tool calls.

## Documentation

- **[MCP Setup Guide](https://docs.albumi.app/ai/mcp-setup/)** — per-client configuration (Claude Code, Cursor, Claude Desktop, other), environment variables, troubleshooting.
- **[The Edit Loop](https://docs.albumi.app/ai/the-edit-loop/)** — the full `pull → edit → validate → audit → push` workflow with real prompts and examples.
- **[Quick Start](https://docs.albumi.app/getting-started/quick-start/)** — first-hour onboarding from sign-up to a reviewed landscape.

## License

MIT
