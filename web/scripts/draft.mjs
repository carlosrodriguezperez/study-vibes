// Prints a text-only episode draft. No audio, no TTS quota.
//
//   npm run draft                 # uses the demo PDF
//   npm run draft -- path/to.pdf  # uses another PDF

import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const arg = process.argv[2];
const PDF =
  arg && arg !== "demo"
    ? path.resolve(arg)
    : path.join(process.cwd(), "..", "evals", "sources", "math-sets-preliminaries.pdf");

async function main() {
  const form = new FormData();
  form.set("language", "es");
  if (arg && arg !== "demo") {
    const bytes = await fs.readFile(PDF);
    form.set("file", new Blob([bytes], { type: "application/pdf" }), path.basename(PDF));
  }

  const started = Date.now();
  const res = await fetch(`${BASE}/api/draft`, { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

  const { draft, model, words } = json;
  const seconds = (Date.now() - started) / 1000;

  console.log(`\n${draft.title}`);
  console.log(`${draft.topic}  ·  ${model}  ·  ${words} words  ·  ${seconds.toFixed(1)}s\n`);

  for (const segment of draft.segments) {
    const count = segment.text.split(/\s+/).length;
    console.log("─".repeat(72));
    console.log(`${segment.id}. ${segment.heading}   (${count} words)\n`);
    console.log(segment.text);
    console.log();
  }

  console.log("─".repeat(72));
  console.log("QUIZ");
  draft.quiz.forEach((question, index) => {
    console.log(`\n${index + 1}. ${question.question}`);
    question.options.forEach((option, optionIndex) => {
      const mark = optionIndex === question.answerIndex ? "✓" : " ";
      console.log(`   ${mark} ${option}`);
    });
    console.log(`   → ${question.explanation}`);
  });
  console.log();
}

main().catch((error) => {
  console.error("\nFAILED:", error.message);
  console.error("Is the dev server running?");
  process.exit(1);
});
