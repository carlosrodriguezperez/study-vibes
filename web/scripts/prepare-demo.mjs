// Pre-renders the demo episode so the stage demo never waits on a model.
//
//   npm run demo:prepare
//
// Run this before the pitch. It reuses the committed fixture script and
// synthesizes audio into .data/ (gitignored). The demo route then serves the
// finished episode instantly and offline.

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  console.log("preparing the demo episode against", BASE);
  const started = Date.now();

  const form = new FormData();
  form.set("demo", "1");
  const created = await fetch(`${BASE}/api/episodes`, { method: "POST", body: form });
  const { id, error } = await created.json();
  if (!id) throw new Error(error ?? "no episode id");

  let episode;
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await fetch(`${BASE}/api/episodes/${id}`, { cache: "no-store" });
    episode = await res.json();
    const done = episode.segments.filter((segment) => segment.audioUrl).length;
    process.stdout.write(
      `\r${episode.status} — ${done}/${episode.segments.length} segments (${((Date.now() - started) / 1000).toFixed(0)}s)   `,
    );
    if (episode.status === "ready" || episode.status === "error") break;
  }
  console.log();

  if (episode.status === "error") throw new Error(episode.error);

  const total = episode.segments.reduce(
    (sum, segment) => sum + (segment.durationSec ?? 0),
    0,
  );
  console.log(`demo ready: ${episode.title}`);
  console.log(`episode id: ${episode.id}`);
  console.log(`audio: ${total.toFixed(0)}s across ${episode.segments.length} segments`);
  console.log(`\nopen ${BASE}/episode/${episode.id}`);
}

main().catch((error) => {
  console.error("\nFAILED:", error.message);
  console.error("Is the dev server running?");
  process.exit(1);
});
