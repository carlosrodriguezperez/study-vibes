# AGENTS.md

Instructions for AI agents working in **study-vibes**. Humans should read `CONTRIBUTING.md`.

## What this is

Study Vibes turns notes, slides, or photos into a short audio/video lesson. The product bet is **time-to-first-play**: the student should be listening in under a minute, with no setup. The product brief is `docs/PRODUCT.md`; it is the scope source of truth.

## Current state

Greenfield hackathon project. No application code, package manifest, tests, or CI yet. The first commit is an empty scaffold. Do not invent or assume framework commands — add the real ones here as soon as the stack exists.

## Layout

```
docs/PRODUCT.md     narrow MVP, non-goals, demo, architecture
evals/README.md     source corpus and comparison checklist
evals/sources/      real lecture PDFs (committed corpus)
evals/results/      generated outputs (gitignored)
CONTRIBUTING.md     branching, commit, PR, and agent rules
AGENTS.md           this file
```

When code is added, put it under a clear top-level app/package directory and document the entrypoint here.

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
- Use `type(scope): subject`; scopes currently include `web, api, ingest, script, media, player, auth, db, docs, deps, infra`.
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

- The core loop is: **upload → short script → audio/video → play**. Do not add features outside it.
- Do not build quizzes, exams, social features, teacher tools, a full note editor, or interactive Q&A. They are explicitly deferred in `docs/PRODUCT.md` §1 and §10.
- Optimize the first 60 seconds: no signup wall, no empty dashboard, one primary action, sensible defaults.
- Default to a **3-minute lesson** and **audio-first**; video is optional.
- Mobile-first, screen-off playback, and resume are part of the core experience, not polish.
- Prefer one service and one background worker over a complex architecture.
