#!/usr/bin/env tsx
/**
 * CLI Login Flow for Albumi MCP Server.
 *
 * Usage: tsx tools/workspace-mcp/cli/login.ts <api-url>
 * Example: tsx tools/workspace-mcp/cli/login.ts http://localhost:4000
 *
 * Flow:
 * 1. Starts a local HTTP server on a random port
 * 2. Opens the browser to the MCP authorization page
 * 3. User authenticates
 * 4. Backend redirects to local callback with account-scoped token
 * 5. Token is stored in ~/.albumi/credentials.json
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";
import { exec } from "child_process";

interface CallbackParams {
  token?: string;
  email?: string;
  error?: string;
}

function getConfigDir(): string {
  return process.env.ALBUMI_CONFIG_DIR || path.join(os.homedir(), ".albumi");
}

function openBrowser(url: string): void {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  if (process.platform === "win32") {
    exec(`${cmd} "" "${url}"`);
  } else {
    exec(`${cmd} "${url}"`);
  }
}

async function login(apiUrl: string): Promise<void> {
  // Normalize API URL (remove trailing slash)
  apiUrl = apiUrl.replace(/\/+$/, "");

  console.log(`\nAuthenticating with ${apiUrl}...\n`);

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", `http://localhost`);

      if (url.pathname === "/callback") {
        const params: CallbackParams = {
          token: url.searchParams.get("token") || undefined,
          email: url.searchParams.get("email") || undefined,
          error: url.searchParams.get("error") || undefined,
        };

        if (params.error) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html><body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h2 style="color: #dc2626;">Authentication Failed</h2>
              <p>${params.error}</p>
              <p style="color: #666;">You can close this window.</p>
            </body></html>
          `);
          server.close();
          reject(new Error(params.error));
          return;
        }

        if (!params.token) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html><body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h2 style="color: #dc2626;">Invalid Response</h2>
              <p>Missing token in callback.</p>
              <p style="color: #666;">You can close this window.</p>
            </body></html>
          `);
          server.close();
          reject(new Error("Missing token"));
          return;
        }

        // Save credentials
        const configDir = getConfigDir();
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }

        const credentials = {
          apiUrl,
          token: params.token,
          email: params.email || "",
          createdAt: new Date().toISOString(),
        };

        fs.writeFileSync(path.join(configDir, "credentials.json"), JSON.stringify(credentials, null, 2));

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html><body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h2 style="color: #16a34a;">Authenticated!</h2>
            <p>Logged in as <strong>${params.email || "user"}</strong></p>
            <p style="color: #666;">You can close this window.</p>
          </body></html>
        `);

        server.close();

        console.log(`  Authenticated as ${params.email || "user"}`);
        console.log(`  Credentials saved to ${path.join(configDir, "credentials.json")}`);
        console.log();

        resolve();
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    // Listen on random port
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to start local server"));
        return;
      }

      const callbackUrl = `http://127.0.0.1:${addr.port}/callback`;
      const authorizeUrl = `${apiUrl}/auth/mcp-authorize?callback=${encodeURIComponent(callbackUrl)}`;

      console.log(`  Opening browser for authorization...`);
      console.log(`  If the browser doesn't open, visit:`);
      console.log(`  ${authorizeUrl}\n`);

      openBrowser(authorizeUrl);
    });

    // Timeout after 5 minutes
    setTimeout(
      () => {
        server.close();
        reject(new Error("Authorization timed out (5 minutes)"));
      },
      5 * 60 * 1000,
    );
  });
}

function isSSH(): boolean {
  return !!(process.env.SSH_CONNECTION || process.env.SSH_CLIENT || process.env.SSH_TTY);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

async function loginManual(apiUrl: string): Promise<void> {
  apiUrl = apiUrl.replace(/\/+$/, "");

  const authorizeUrl = `${apiUrl}/auth/mcp-authorize?callback=manual`;

  console.log(`\nAuthenticating with ${apiUrl}...\n`);
  console.log(`  Open this URL in your browser:\n`);
  console.log(`  ${authorizeUrl}\n`);
  console.log(`  After authorizing, copy the token from the page.\n`);

  const token = await prompt("Paste token: ");

  if (!token.startsWith("alb_")) {
    throw new Error("Invalid token — must start with alb_");
  }

  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const credentials = {
    apiUrl,
    token,
    email: "",
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(configDir, "credentials.json"), JSON.stringify(credentials, null, 2));

  console.log(`\n  Credentials saved to ${path.join(configDir, "credentials.json")}\n`);
}

const DEFAULT_API_URL = "https://my.albumi.app";

export function runLogin(apiUrlArg?: string, manual?: boolean): void {
  const apiUrl = apiUrlArg || DEFAULT_API_URL;
  const useManual = manual || isSSH();

  const loginFn = useManual ? loginManual(apiUrl) : login(apiUrl);

  loginFn
    .then(() => process.exit(0))
    .catch((err: Error) => {
      console.error(`\nError: ${err.message}`);
      process.exit(1);
    });
}
