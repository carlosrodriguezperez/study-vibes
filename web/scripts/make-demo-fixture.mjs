// Generates fixtures/demo-episode.json by running a real PDF through the
// pipeline. Requires the dev server to be running.
//
//   node scripts/make-demo-fixture.mjs [path-to.pdf]
//
// The demo never calls an LLM at runtime: it loads this committed script and
// only synthesizes audio. This script exists so the fixture can be refreshed.

import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PDF =
  process.argv[2] ??
  path.join(process.cwd(), "..", "evals", "sources", "math-sets-preliminaries.pdf");

async function main() {
  const bytes = await fs.readFile(PDF);
  const form = new FormData();
  form.set("file", new Blob([bytes], { type: "application/pdf" }), path.basename(PDF));
  form.set("language", "es");

  console.log("submitting", path.basename(PDF), `${(bytes.length / 1024).toFixed(0)} KB`);
  const created = await fetch(`${BASE}/api/episodes`, { method: "POST", body: form });
  const { id, error } = await created.json();
  if (!id) throw new Error(error ?? "no episode id");

  const started = Date.now();
  let episode;
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(`${BASE}/api/episodes/${id}`, { cache: "no-store" });
    episode = await res.json();
    process.stdout.write(`\r${episode.status} — ${episode.stage} (${((Date.now() - started) / 1000).toFixed(1)}s)   `);
    if (episode.status === "ready" || episode.status === "error") break;
  }
  console.log();

  if (episode.status === "error") throw new Error(episode.error);

  const fixture = {
    title: episode.title,
    topic: episode.topic,
    language: episode.language,
    segments: episode.segments.map(({ id: segmentId, heading, text }) => ({
      id: segmentId,
      heading,
      text,
    })),
    quiz: episode.quiz,
  };

  const out = path.join(process.cwd(), "fixtures", "demo-episode.json");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, `${JSON.stringify(fixture, null, 2)}\n`);

  const audio = episode.segments.filter((s) => s.audioUrl).length;
  console.log(`wrote ${out}`);
  console.log(`segments: ${fixture.segments.length}, audio: ${audio}/${fixture.segments.length}, model: ${episode.model}`);
  if (audio < fixture.segments.length) {
    console.log("warning: some segments have no audio; check the server log");
  }
}

main().catch((error) => {
  console.error("\nFAILED:", error.message);
  process.exit(1);
});
