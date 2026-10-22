# Study Vibes

Turn notes, slides, or photos into a short, **entertaining** audio/video episode about the topic — with as few steps as possible between opening the app and pressing play, plus an optional quick check.

It is deliberately **not a summary tool**. Your material decides *what* the episode covers; the script decides *why you want to keep listening*. Expect a hook, a story, a true piece of context your slides did not have, and a recap that sends you back to the source.

Built **laptop-first**: a plain responsive web app, no install and no account. It still opens on a phone, but the layout, controls, and keyboard shortcuts target a 13–15" screen.

**Status:** 48-hour hackathon project (ETSE 2026). Early development; the app is not runnable yet.

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

## Documentation

- [Product brief](docs/PRODUCT.md) — the narrow MVP, non-goals, demo, and architecture.
- [Evaluation corpus](evals/README.md) — real lecture sources and the comparison checklist.
- [Contributing](CONTRIBUTING.md) — branch, commit, PR, and security rules.
- [Agent guidelines](AGENTS.md) — operating instructions for AI agents.

## Repository layout

```
web/                the app (Next.js); not created yet
docs/PRODUCT.md
evals/README.md
evals/sources/      committed lecture PDFs
evals/results/      (gitignored)
CONTRIBUTING.md
AGENTS.md
```

Setup, run, test, and lint commands will be documented here once the app is committed.
