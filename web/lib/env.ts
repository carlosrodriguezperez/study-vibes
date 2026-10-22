import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Next only loads env files from the app directory (`web/`), but this repo
 * keeps a single `.env` at the repository root. Read it once, at runtime,
 * without overwriting anything already set by the real environment.
 */
let loaded = false;

export function loadRootEnv(): void {
  if (loaded) return;
  loaded = true;

  const file = process.env.ENV_FILE ?? path.join(process.cwd(), "..", ".env");
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return; // No .env: rely on the real environment.
  }

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
  }
}
