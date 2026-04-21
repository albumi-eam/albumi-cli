---
name: albumi-workspace
description: Use when the user asks to pull, edit, validate, audit, or push an Albumi workspace file — or mentions working with workspace JSON, running EAM analysis, or CI checks against architecture data. Routes between the albumi CLI (deterministic checks, one-off operations) and the albumi MCP server (agent-driven edit loops).
---

# Albumi Workspace Operations

`@albumi/cli` is **both** a CLI (`albumi <cmd>`) and an MCP server (`albumi` with no args) — same binary, two modes.

- **CLI:** `albumi <command>` — when the user wants to run one thing from the terminal.
- **MCP tools:** `pull_workspace`, `validate`, `audit`, `push_workspace` — when you (the agent) are orchestrating an edit cycle.

Same underlying code path. Choosing between them is about who's driving, not about capabilities.

## Routing rules

| User intent | Use |
|-------------|-----|
| "Validate this workspace file" (one-shot) | **CLI:** `albumi validate <file>` |
| "Check the workspace in CI" / "pre-commit" | **CLI** — exit codes, no API calls |
| "Run the audit and show me findings" | **CLI:** `albumi audit <file>` |
| "Pull my workspace so I can edit it" | **CLI:** `albumi pull --workspace <id>` |
| "Edit this workspace — add X, change Y, then push" | **MCP tools** — pull → edit → validate (MCP) → push loop |
| "Fix the critical findings and re-check" | **MCP tools** — keep validating between edits without subprocess round-trips |

**Rule of thumb:** if the user invokes you to do something and wants a result, use MCP tools. If they're asking how to do something themselves, tell them the CLI command.

## Deterministic vs stateful

- `validate` — pure function over local JSON. No network. Safe to re-run constantly.
- `audit` — pure function over local JSON. No network. ~70 EAM checks.
- `pull` — reads from server (needs auth).
- `push` — writes to server as an ACR (needs auth, reviewable).

Since validate/audit are deterministic, prefer running them through the CLI when showing output to the user — output is nicer and exit codes are meaningful.

## Edit workflow (when driving via MCP)

1. `pull_workspace` with a `workspace_id` (or call without one to list available workspaces).
2. Edit the local JSON file directly.
3. `validate` — fix schema errors.
4. `audit` — decide which findings to address.
5. `push_workspace` — creates an ACR for review.

## Exit codes (CLI)

- `0` — success, no errors
- `1` — validation failed, critical audit findings, or runtime error

## Prerequisites

Before any operation that hits the server (pull/push), the user must have logged in:

```bash
albumi login
```

Credentials land in `~/.albumi/credentials.json`. For CI/CD, set `ALBUMI_API_TOKEN` as a secret instead.

## Setup (when user asks how to install)

**Claude Code (preferred):**

```
/plugin marketplace add albumi-eam/albumi-cli
/plugin install albumi@albumi-cli
/reload-plugins
```

Then `albumi login`. The plugin auto-registers the MCP server and installs this skill.

**Other MCP clients (Cursor, Claude Desktop, etc.):** point the user to the [README](https://github.com/albumi-eam/albumi-cli#install) — manual `mcpServers` config + `npm install -g @albumi/cli`.
