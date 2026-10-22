# Study Vibes

Turn notes, slides, or photos into a short, **entertaining** audio/video episode about the topic — with as few steps as possible between opening the app and pressing play, plus an optional quick check.

It is deliberately **not a summary tool**. Your material decides *what* the episode covers; the script decides *why you want to keep listening*. Expect a hook, a joke that actually lands, a story, a true piece of context your slides did not have, and a recap that sends you back to the source.

Built **laptop-first**: a plain responsive web app, no install and no account. It still opens on a phone, but the layout, controls, and keyboard shortcuts target a 13–15" screen.

**Status:** 48-hour hackathon project (ETSE 2026). Runs locally, end to end. Not deployed.

## Stack

- **One app:** Next.js (App Router) + React + Tailwind. The API routes run the pipeline in Node, so there is no separate backend to start.
- **Episode script + quiz:** DeepSeek V4.1 Flash via OpenRouter (`deepseek/deepseek-v4.1-flash`), text only. Enrichment claims get a verification pass.
- **Speech:** Gemini TTS (`gemini-3.8-flash-tts`), audio only. DeepSeek cannot synthesize speech, so the two providers split the pipeline by modality.
- **Storage:** local disk; one episode record is enough.

See [docs/PRODUCT.md §6](docs/PRODUCT.md) for the pipeline and data model.

## Environment

Copy `.env.example` to `.env` and fill in both keys. `.env` is gitignored; never commit real keys.

| Variable | Used for |
|---|---|
| `OPENROUTER_API_KEY` | DeepSeek V4.1 Flash — script, quiz, and image transcription |
| `GEMINI_API_KEY` | Gemini TTS — audio only |

## Run

```bash
cd web
npm install
npm run dev            # http://localhost:3000
```

Production: `npm run build && npm start`. Lint: `npm run lint`.

## Demo

The demo episode is pre-rendered on purpose, so the stage demo makes no live model calls.

```bash
npm run demo:prepare   # renders demo audio into .data/ (server must be running)
npm run demo:fixture   # writes fixtures/demo-episode.generated.json (never the demo script)
npm run draft          # text-only preview of the script (no audio, no quota)
```

Or open **`/draft`** in the browser to read the script, regenerate it, or try another PDF — it never records audio.

Run `demo:prepare` once before the pitch, with the dev server up. After that, "Try the demo episode" is instant and works even if the providers are down.

> **Quota:** Gemini's free tier allows **10 TTS requests per day per model**. Each episode costs one request per segment. Pre-render early, and do not regenerate finished audio — the pipeline skips segments that already have audio.

## Documentation

- [Product brief](docs/PRODUCT.md) — the narrow MVP, non-goals, demo, and architecture.
- [Demo runbook](docs/DEMO.md) — pre-flight checklist, the 2-minute script, and fallbacks.
- [Evaluation corpus](evals/README.md) — real lecture sources and the comparison checklist.
- [Contributing](CONTRIBUTING.md) — branch, commit, PR, and security rules.
- [Agent guidelines](AGENTS.md) — operating instructions for AI agents.

## Repository layout

```
web/                the app (Next.js); run it from here
web/lib/            pipeline, providers, storage
web/scripts/        demo:fixture and demo:prepare
web/fixtures/       committed demo script (text only)
docs/PRODUCT.md
evals/README.md
evals/sources/      committed lecture PDFs
evals/results/      (gitignored)
CONTRIBUTING.md
AGENTS.md
```

Generated audio lives in `web/.data/` and is gitignored.
