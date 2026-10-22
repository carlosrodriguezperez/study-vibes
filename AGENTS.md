# AGENTS.md

Instructions for AI agents working in **study-vibes**. Humans should read `CONTRIBUTING.md`.

## What this is

Study Vibes turns notes, slides, or photos into a short, **entertaining** audio/video episode about the topic, with an optional 3-question check. It is not a summary tool: the material supplies the syllabus, and the episode is built to make the student want to keep listening — then go back to the source. The product bet is **time-to-first-play** and **wanting to keep playing**: the student should be listening in under a minute, with no setup. The product brief is `docs/PRODUCT.md`; it is the scope source of truth.

## Current state

Runnable app in `web/`: upload or demo → episode script → audio → player with transcript, keyboard control, resume, and the optional check. **DeepSeek V4.1 Flash via OpenRouter** writes all text; **Gemini TTS** produces audio only. Required keys are `OPENROUTER_API_KEY` and `GEMINI_API_KEY`, documented in `.env.example` and read from the repo-root `.env`.

## Commands

```bash
cd web
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm start              # serve the build
npm run lint
npm run demo:prepare   # pre-render the demo episode (server running)
npm run demo:fixture   # writes fixtures/demo-episode.generated.json (never the demo script)
npm run draft          # text-only script preview: no audio, no TTS quota
npm run draft -- path/to.pdf
```

The same preview is available at `/draft` in the browser; it never records audio.
```

Gemini's free tier is **10 TTS requests per day per model**, so pre-render the demo before the pitch and let the pipeline skip segments that already have audio.

## Layout

```
web/                the app (Next.js, laptop-first responsive web)
web/lib/            pipeline, providers, storage, env loading
web/scripts/        demo fixture and demo pre-render
web/fixtures/       committed demo script (text only)
docs/PRODUCT.md     narrow MVP, non-goals, demo, architecture
evals/README.md     source corpus and comparison checklist
evals/sources/      real lecture PDFs (committed corpus)
evals/results/      generated outputs (gitignored)
CONTRIBUTING.md     branching, commit, PR, and agent rules
AGENTS.md           this file
```

Code lives in `web/`; run every command from there. Generated audio stays in `web/.data/` and is gitignored.

## Git workflow

Run Git from this directory (`study-vibes/`), never from the workspace root.

```bash
git switch main
git pull --ff-only
git switch -c feat/short-description
# edit
git status
git diff
git add <explicit paths>
git diff --staged
git commit -m "feat(scope): imperative subject"
git push -u origin feat/short-description
```

- Follow **Conventional Commits** exactly as specified in `CONTRIBUTING.md`.
- One logical change per commit. Do not stage with `git add -A` unless you have reviewed everything.
- Use `type(scope): subject`; scopes currently include `web, api, ingest, script, tts, quiz, media, player, auth, db, evals, docs, deps, infra`.
- Update `docs/PRODUCT.md` when behavior or scope changes, and this file when setup/commands change.
- Squash-merge PRs; never force-push `main` or rewrite shared history.

## Hard rules

- Never commit `.env`, keys, tokens, private uploads, student data, voice recordings, or generated media.
- `evals/sources/` is the only committed course-material exception; add only material the team has permission to use. `evals/results/` stays gitignored.
- Never commit `node_modules/`, virtualenvs, build output, caches, or local databases.
- Keep `main` demoable.
- If a secret is committed, rotate it — deleting the line is not enough.
- Do not revert or overwrite user changes you did not make.

## Product guardrails

- The core loop is: **upload → topic → entertaining episode → play**, with an optional 3-question check at the end.
- **Entertainment is the product, not decoration.** The episode must be worth listening to on its own: a hook in the first 15 seconds, a narrative, at least three jokes **about the source's own wording**, true extra context, and a recap that points back to the source. It is never a narrated summary, and it must never sound like a class.
- **Enrichment must be true.** Added context is expected and wanted, but every added claim must be defensible, must never be attributed to the source or lecturer, and must be dropped if it cannot be verified. Never invent quotes, dates, studies, or numbers. A duller true episode beats a fun false one.
- Do not build exams, exam correction, social features, teacher tools, a full note editor, or interactive Q&A. A single optional 3-question check is the only assessment allowed; everything else is deferred in `docs/PRODUCT.md` §1 and §10.
- Optimize the first 60 seconds: no signup wall, no empty dashboard, one primary action, sensible defaults, hook before housekeeping.
- Default to a **3–4 minute episode in three long segments** and **audio-first**; video is optional. Tiny chapters are not the goal — a long, funny, listenable stretch is.
- **Laptop-first, not mobile-first:** design for a 13–15" screen and a keyboard. Full keyboard control, a two-pane player/transcript layout, and background-tab playback are part of the core experience, not polish. It must still render on a phone, but that is not the target.
- **DeepSeek V4.1 Flash is text-only.** Never assume it can produce speech; TTS is always a separate provider, and the demo must not rely on a live provider call.
- Prefer one service and one background worker over a complex architecture.
