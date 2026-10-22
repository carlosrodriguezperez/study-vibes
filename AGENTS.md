# AGENTS.md

Instructions for AI agents working in **study-vibes**. Humans should read `CONTRIBUTING.md`.

## What this is

Study Vibes turns class slides/notes into editable Markdown, story-driven audio/video lessons, interactive Q&A, and quizzes. The product brief is `docs/PRODUCT.md`; treat it as the scope source of truth and update it when scope changes.

## Current state

Greenfield hackathon project. No application code, package manifest, tests, or CI yet. The first commit is an empty scaffold. Do not invent or assume framework commands — add the real ones here as soon as the stack exists.

## Layout

```
docs/PRODUCT.md     product brief, MVP, architecture proposal
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
- Use `type(scope): subject`; scopes currently include `web, api, ingest, notes, story, media, player, quiz, exam, social, auth, db, docs, deps, infra`.
- Update `docs/PRODUCT.md` when behavior or scope changes, and this file when setup/commands change.
- Squash-merge PRs; never force-push `main` or rewrite shared history.

## Hard rules

- Never commit `.env`, keys, tokens, uploaded course material, student data, voice recordings, or generated media.
- Never commit `node_modules/`, virtualenvs, build output, caches, or local databases.
- Keep `main` demoable.
- If a secret is committed, rotate it — deleting the line is not enough.
- Do not revert or overwrite user changes you did not make.

## Product guardrails

- Markdown + cropped assets is the canonical artifact; keep it exportable.
- Generated claims must be source-grounded and citable; label added context.
- Course material is private by default.
- The hackathon MVP is PDF → editable Markdown → story/audio → pause-to-ask → quiz. Do not expand scope without checking `docs/PRODUCT.md` §5.
