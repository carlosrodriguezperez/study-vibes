// Install check. Run from web/:
//
//   npm run doctor
//
// Verifies runtime, dependencies, secrets, the dev server, and whether the
// demo episode is rendered. Prints no secret values. Exit code 1 means a
// blocking problem.

import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DEMO_ID = "demo-sets-0001";

const problems = [];
const warnings = [];

const ok = (message) => console.log(`  ok    ${message}`);
const warn = (message) => {
  console.log(`  warn  ${message}`);
  warnings.push(message);
};
const fail = (message) => {
  console.log(`  FAIL  ${message}`);
  problems.push(message);
};

function readEnv(raw) {
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

console.log("\nStudy Vibes — install check\n");

/* 1. Runtime ---------------------------------------------------------- */
const major = Number(process.versions.node.split(".")[0]);
if (major >= 20) ok(`Node ${process.versions.node}`);
else fail(`Node ${process.versions.node} is too old; use Node 20 or newer`);

/* 2. Dependencies ----------------------------------------------------- */
try {
  await fs.access(path.join(process.cwd(), "node_modules", "next", "package.json"));
  ok("dependencies installed");
} catch {
  fail("node_modules is missing; run `npm install` in web/");
}

/* 3. Secrets ---------------------------------------------------------- */
const envPath = path.join(process.cwd(), "..", ".env");
let fileEnv = {};
try {
  fileEnv = readEnv(await fs.readFile(envPath, "utf8"));
  ok(".env found at the repo root");
} catch {
  fail(".env is missing; copy .env.example to .env at the repo root");
}

for (const key of ["OPENROUTER_API_KEY", "GEMINI_API_KEY"]) {
  const value = process.env[key] || fileEnv[key];
  if (value) ok(`${key} is set (${value.length} characters)`);
  else fail(`${key} is missing; the demo cannot be generated without it`);
}

/* 4. Dev server ------------------------------------------------------- */
let serverUp = false;
try {
  const res = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
  if (res.ok) {
    ok(`dev server responding at ${BASE}`);
    serverUp = true;
  } else {
    warn(`dev server at ${BASE} returned HTTP ${res.status}`);
  }
} catch {
  warn(`no dev server at ${BASE}; start it with \`npm run dev\` in web/`);
}

/* 5. Demo episode ----------------------------------------------------- */
if (serverUp) {
  try {
    const res = await fetch(`${BASE}/api/episodes/${DEMO_ID}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const episode = await res.json();
      const rendered = episode.segments.filter((segment) => segment.audioUrl).length;
      const total = episode.segments.reduce(
        (sum, segment) => sum + (segment.durationSec ?? 0),
        0,
      );
      if (rendered === episode.segments.length && rendered > 0) {
        ok(
          `demo episode is ready (${rendered}/${episode.segments.length} segments, ${Math.round(total)}s)`,
        );
        console.log(`\n  Open ${BASE}/episode/${DEMO_ID} and press Play.\n`);
      } else {
        warn(
          `demo episode has audio for ${rendered}/${episode.segments.length} segments; run \`npm run demo:prepare\``,
        );
      }
    } else {
      warn(`demo episode ${DEMO_ID} is not rendered yet; run \`npm run demo:prepare\``);
    }
  } catch {
    warn("could not read the demo episode");
  }
}

/* Summary ------------------------------------------------------------- */
console.log("");
if (problems.length > 0) {
  console.log(`${problems.length} blocking problem(s). Fix them and run this again.`);
  process.exit(1);
}
if (warnings.length > 0) {
  console.log(`No blockers. ${warnings.length} warning(s) above.`);
} else {
  console.log("Everything checks out.");
}
