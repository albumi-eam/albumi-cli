import * as fs from "fs";
import * as path from "path";
import * as os from "os";

interface Credentials {
  apiUrl: string;
  token: string;
  email?: string;
  createdAt?: string;
}

/**
 * HTTP client for communicating with the Albumi API.
 *
 * Credential resolution order:
 * 1. Env vars: ALBUMI_API_URL + ALBUMI_API_TOKEN (explicit token, e.g. CI/CD)
 * 2. Env vars: ALBUMI_API_URL + ALBUMI_AUTH_HEADER + ALBUMI_AUTH_SECRET (dev mode, X-Test-Mode)
 * 3. Credential file: ~/.albumi/credentials.json (from CLI login)
 */
export class AlbumiApiClient {
  private readonly apiUrl: string;
  private readonly headers: Record<string, string>;

  constructor() {
    const resolved = this.resolveCredentials();
    this.apiUrl = resolved.apiUrl;
    this.headers = resolved.headers;
  }

  private resolveCredentials(): { apiUrl: string; headers: Record<string, string> } {
    // 1. Explicit token (CI/CD, manual config)
    const apiUrl = process.env.ALBUMI_API_URL;
    const apiToken = process.env.ALBUMI_API_TOKEN;
    if (apiUrl && apiToken) {
      return {
        apiUrl,
        headers: { Authorization: `Bearer ${apiToken}` },
      };
    }

    // 2. Dev mode (X-Test-Mode header)
    const authHeader = process.env.ALBUMI_AUTH_HEADER;
    const authSecret = process.env.ALBUMI_AUTH_SECRET;
    if (apiUrl && authHeader && authSecret) {
      return {
        apiUrl,
        headers: { [authHeader]: authSecret },
      };
    }

    // 3. Credential file from CLI login
    const configDir = process.env.ALBUMI_CONFIG_DIR || path.join(os.homedir(), ".albumi");
    const credPath = path.join(configDir, "credentials.json");
    if (fs.existsSync(credPath)) {
      const creds = JSON.parse(fs.readFileSync(credPath, "utf-8")) as Credentials;
      if (creds.apiUrl && creds.token) {
        return {
          apiUrl: creds.apiUrl,
          headers: { Authorization: `Bearer ${creds.token}` },
        };
      }
    }

    throw new Error("Not authenticated. Run: albumi login");
  }

  async get<T>(endpoint: string, extraHeaders?: Record<string, string>): Promise<T> {
    const url = `${this.apiUrl}/api${endpoint}`;
    const res = await fetch(url, { headers: { ...this.headers, ...extraHeaders } });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GET ${endpoint} failed (${res.status}): ${body}`);
    }
    return res.json() as Promise<T>;
  }

  async post<T>(endpoint: string, body: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    const url = `${this.apiUrl}/api${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${endpoint} failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<T>;
  }
}
