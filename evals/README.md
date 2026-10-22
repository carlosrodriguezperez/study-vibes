# Evaluation sources

Real lecture material used to compare conversion and audio/video generation. Keep the corpus small, varied, and easy to reason about.

Script and quiz are generated with **DeepSeek V4.1 Flash** (OpenRouter); speech audio with **Gemini TTS**. Record which model and voice produced each result.

## Files

| File | Subject | Language | Pages | Size |
|---|---|---|---|---|
| `sources/ai-transformers-attention.pdf` | AI — Transformers and attention | Galician | 69 | 3.7 MB |
| `sources/biology-darwinism.pdf` | Biology — Darwinism | Spanish | 147 | 44 MB |
| `sources/journalism-interview.pdf` | Journalism — Audiovisual genres: the interview | Galician | 6 | 469 KB |
| `sources/math-multivariable-differentiation.pdf` | Mathematics — Multivariable differentiation | Spanish | 11 | 371 KB |
| `sources/math-sets-preliminaries.pdf` | Mathematics — Sets | Spanish | 2 | 134 KB |

The set covers dense text, formulas, diagrams, scanned-looking pages, and two languages.

## Rules

- `sources/` is committed so teammates can run the demo and develop against real material. Keep it small, and only add material the team has permission to use.
- `results/` is gitignored. Generated scripts, audio, video, and measurements stay out of Git.
- Add a row to the table when adding a source.
- Name files `subject-topic.pdf` in kebab-case, with no spaces.
- Only add material the team has permission to use.

## What to compare

For each source, check:

1. **Extraction** — text coverage, page order, formulas, tables, and diagrams.
2. **Script** — factual accuracy, coverage of the main ideas, and whether it sounds like a lesson rather than a read-through.
3. **Audio** — pronunciation, pacing, and whether it is useful at 1× speed.
4. **Video** — diagram relevance, caption timing, and readability at laptop distance.
5. **Speed** — time to first playable segment and total generation time.
6. **Cost** — tokens, TTS characters, and render time per lesson.

Record results per file, not just an average; the biology scan and the math formulas will fail differently.
