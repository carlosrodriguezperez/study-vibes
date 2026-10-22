# Contributing to Study Vibes

These rules apply to humans and AI agents. The goal is a clean, reviewable history that still moves fast during the hackathon.

## 1. Core rules

- `main` must always be demoable.
- One logical change per commit. Do not mix refactors, formatting, and features.
- Commit messages and PR titles follow **Conventional Commits** (section 4).
- Never commit secrets, credentials, `.env` files, private student material, or large generated media.
- Update documentation in the same commit when behavior, setup, or architecture changes.
- If a check fails, fix it. Do not bypass hooks with `--no-verify` unless you document why.

## 2. Branching

`main` is the default branch. Work on short-lived branches and merge back quickly.

```
<type>/<short-kebab-slug>
```

Examples:

```
feat/pdf-to-audio
feat/desktop-player
fix/ocr-page-order
docs/commit-conventions
chore/repo-setup
```

Rules:

- Branch from an up-to-date `main`.
- Keep branches under one day old when possible.
- Rebase on `main` before opening or updating a PR; avoid merge commits inside the branch.
- Delete the branch after merge.
- Direct commits to `main` are acceptable only for trivial docs/setup during the hackathon. Anything functional goes through a branch + PR.

## 3. Daily workflow

```bash
cd study-vibes

git switch main
git pull --ff-only
git switch -c feat/short-description

# ... make changes ...

git status
git diff
git add path/to/file another/file
git commit -m "feat(ingest): extract diagrams from PDF pages"

git push -u origin feat/short-description
```

Then open a PR. Use **Squash and merge**; the PR title becomes the commit on `main`. Delete the branch.

Before committing, once the stack exists, run the project checks (lint, typecheck, tests). Until then, at minimum verify the files you changed and that no secret or generated artifact is staged.

## 4. Commit message convention

Format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **Subject:** imperative mood, lowercase after the colon, no trailing period, max 72 characters.
- **Body:** optional; explain *why* and any non-obvious trade-offs. Wrap at 72 characters.
- **Footer:** optional; breaking changes, issue references, co-authors.
- Write in English.

### Types

| Type | Use for |
|---|---|
| `feat` | User-visible feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace, no behavior change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Tests or test fixtures |
| `build` | Build system, dependencies, packaging |
| `ci` | CI/CD configuration |
| `chore` | Maintenance, repo setup, tooling |
| `revert` | Revert a previous commit |

### Scopes

Use the area that changed. Omit the scope only when the change is repo-wide.

```
web, api, ingest, script, tts, quiz, media, player, auth, db, evals, docs, deps, infra
```

Add new scopes in this file when a new area appears.

### Examples

```
feat(ingest): extract text and figures from a PDF
feat(script): generate a three-minute lesson script
feat(media): synthesize audio segment by segment
feat(quiz): generate three questions from a lesson
fix(player): resume playback after screen lock
docs: narrow the MVP to audio/video lessons
refactor(api): isolate model provider behind an adapter
chore(deps): add PDF parsing dependencies
```

Breaking change:

```
feat(api)!: replace lesson payload with versioned schema

BREAKING CHANGE: clients must read `lesson.schemaVersion` and migrate
to the v2 media URLs.
```

Issue reference:

```
fix(auth): refresh expired session before upload

Refs: #42
```

### Avoid

- `update`, `changes`, `fix stuff`, `wip` as the whole message.
- Mixing unrelated changes in one commit.
- Emoji prefixes unless the team explicitly adopts them.
- AI attribution footers ("Generated with ...") unless the user asks for them.
- Committing commented-out code or debug prints.

## 5. What must never be committed

- `.env`, `.env.*` (except `.env.example`), API keys, tokens, cookies, private URLs.
- `node_modules/`, virtual environments, caches, build output, coverage reports.
- Uploaded course material, student data, voice recordings, or generated audio/video unless it is a small, intentionally curated demo fixture.
- Database dumps, local SQLite files, logs.
- OS/editor junk (`.DS_Store`, `.idea/`, `.vscode/` unless the team shares a config intentionally).

If a secret is committed, rotate it immediately; removing it from the latest commit is not enough because it remains in history.

## 6. Pull requests

- Title uses the same Conventional Commit format; it becomes the squash commit.
- Description covers: **what**, **why**, **how it was tested**, and known limitations.
- Include screenshots or a short recording for UI changes.
- Keep PRs small enough to review in one sitting.
- Link related issues with `Refs: #<number>` or `Closes: #<number>`.
- Do not merge with failing checks or unresolved review comments.
- Prefer **Squash and merge**. Do not create merge commits on `main`.

## 7. Releases and tags

- Use semantic versioning once the app is runnable: `vMAJOR.MINOR.PATCH`.
- Tag the hackathon demo as `v0.1.0-demo`.
- Annotated tags only: `git tag -a v0.1.0-demo -m "Hackathon demo"`.
- Generate release notes from Conventional Commit history.
- Never move or delete a published tag; cut a new patch instead.

## 8. Agent-specific rules

- Run Git commands inside `study-vibes/`, not the workspace root.
- Read `docs/PRODUCT.md` before changing scope; keep it current.
- Stage explicit paths (`git add <path>`), not `git add -A` or `git add .`, unless you have just reviewed the full status and diff.
- Inspect `git diff --staged` before every commit.
- Never force-push `main`. On your own feature branch use `--force-with-lease` only after a rebase.
- Do not rewrite history that has already been pushed and shared.
- Do not amend a commit that someone else may have based work on.
- Do not create empty or "wip" commits on a shared branch.
- Do not commit on behalf of the user without being asked.
- If the repository has uncommitted user changes, leave them alone unless they are part of the requested task.
- When the stack is chosen, add the exact lint/typecheck/test commands to `AGENTS.md` and `README.md`, and run them before committing.

## 9. Definition of done

A change is done when:

- It does what the task asked, without unrelated edits.
- It is committed with a valid Conventional Commit message.
- No secrets, generated artifacts, or private data are included.
- Relevant docs (`README.md`, `docs/PRODUCT.md`, `AGENTS.md`) are updated.
- Available checks pass, or the PR states why they could not run.
- The branch is mergeable into `main` without conflicts.
