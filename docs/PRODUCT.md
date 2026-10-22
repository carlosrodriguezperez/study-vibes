# Study Vibes — Product Brief

> **One-liner:** Upload your class slides and get an editable study guide, a story-driven audio/video lesson you can interrupt and question, and a quiz that proves you learned it — then make studying social.

**Status:** Hackathon concept (ETSE 2026). No implementation yet. This document refines the original brainstorm into a buildable product definition.

---

## 1. Vision

### Problem

- Students receive dense PDFs, slide decks, scanned notes, and photos, then waste hours re-reading them passively.
- Knowledge is locked in presentation formats: diagrams cannot be searched, corrected, or reused.
- Generic AI summarizers produce fluent but ungrounded text. Students cannot tell what came from the source and what was invented.
- Studying alone is boring, while social apps compete for the same attention without teaching anything.

### Insight

The atomic unit of studying should not be a summary — it should be **a source-grounded, editable study artifact** that can be read, listened to, questioned, practiced, and shared. Markdown is the right canonical format because it is open, diffable, portable, and easy for both humans and models to edit.

### Solution

A study companion with one pipeline:

```
source material → structured Markdown + diagrams → story → audio/video
      → interactive Q&A → quiz/exam → feedback → social motivation
```

### Product principles

1. **Grounded first.** Every generated claim links back to a source section or is explicitly labeled as added context.
2. **Open by default.** The core artifact is Markdown with local assets; users can export and leave.
3. **Low floor, high ceiling.** A non-technical student finishes in three clicks; a technical student can edit every block and prompt.
4. **Active over passive.** Listening is interrupted by questions, checkpoints, and retrieval practice.
5. **Social without leaking.** Share results, clips, and streaks — not private course material unless explicitly chosen.
6. **Accessible and local.** Galician, Spanish, and English; captions, transcripts, keyboard navigation, dyslexia-friendly reading mode.

---

## 2. Personas and jobs

| Persona | Context | Job to be done | What success looks like |
|---|---|---|---|
| **Ana, 20 — non-technical student** | Exam in 3 days, 200 slides | "Turn this into something I can listen to on the bus and actually remember." | First lesson in under 5 minutes; passes end quiz. |
| **Xoán, 22 — CS student** | Wants control and diagrams | "Give me clean Markdown I can fix, link, and study from." | Edits notes, keeps cropped diagrams, exports to his own tools. |
| **Uxía, 21 — creator / social learner** | Studies with friends | "Make studying competitive and shareable." | Shares a clip, challenges friends, keeps a streak. |
| **Professor / TA (added)** | Prepares class material | "Generate practice and grade consistently." | Builds a quiz/exam from their slides; reviews AI grading. |

---

## 3. End-to-end journey

1. **Create a course** (e.g., "Mathematics II") and upload PDFs, slides, photos, or notes.
2. **Watch the conversion** with visible stages: extracting → OCR → detecting diagrams → structuring → validating.
3. **Review and edit** the generated Markdown side-by-side with the original page; fix OCR, reorder sections, annotate.
4. **Choose a learning experience**: narrator/persona, story style, length, language, difficulty, and which concepts are mandatory.
5. **Generate media** (audio first, video optional) and read the editable story/script.
6. **Study interactively**: listen/watch, pause to ask by voice or text, get cited answers and diagrams.
7. **Practice**: answer checkpoint and end-of-lesson questions; receive explanations and a weak-topic map.
8. **Consolidate**: auto-generate a Markdown lecture, flashcards, and a spaced-review plan.
9. **Compete and share**: post a short clip or result, challenge a friend, keep the streak alive.

**Three-minute demo path:** one real slide deck → corrected Markdown with a cropped diagram → Gauss-narrated audio → interrupt with a spoken question → end quiz with an image question → shareable result card.

---

## 4. Feature specification

### 4.1 Source ingestion and PDF → Markdown

**Goal:** Convert heterogeneous class material into a clean, editable, source-linked Markdown bundle without losing diagrams or meaning.

**Inputs**

- PDF (native text and scanned), PPTX, DOCX, plain text, Markdown.
- Images: photos of slides, whiteboards, handwritten notes (JPG/PNG/HEIC).
- Pasted text and URLs (added).
- Audio recordings of lectures (added, phase 2).

**Conversion pipeline**

1. **Validate and normalize** — file type, page/size limits, malware scan, duplicate detection.
2. **Extract** — native text where available; OCR only where needed. Preserve slide notes and hidden slides.
3. **Analyze layout** — detect titles, bullets, columns, tables, formulas, code, figures, and captions.
4. **Crop and describe diagrams** — save each figure as a separate asset with bounding box, caption, alt text, and a link to its source page. Deduplicate repeated images.
5. **Chunk semantically** — by slide or section, with stable IDs used later for citations.
6. **Structure with an LLM** — normalize heading hierarchy, merge fragments, expand abbreviations, fix OCR noise, preserve formulas as LaTeX. **Never invent missing content**; mark gaps as `[missing / unclear]`.
7. **Validate** — coverage check against source pages, unresolved-reference check, confidence scores per block.
8. **Emit a bundle**:
   ```
   note.md
   assets/diagram-001.png
   manifest.json   # source hash, page map, block confidence, model/version
   source.pdf      # private, original
   ```

**Editing experience**

- Split view: source page on the left, Markdown on the right; clicking a paragraph highlights its source region.
- Markdown toolbar: headings, lists, tables, code, LaTeX, image insert, callouts.
- Edit image alt text and captions; recrop diagrams; replace an image.
- Protect sections from regeneration; lock manually corrected blocks.
- Version history with diff and restore.
- Export: Markdown zip, PDF, HTML, Anki/Quizlet (added).

**Quality rules**

- Low-confidence OCR/formula blocks are visibly flagged for review.
- A "coverage" indicator shows which source pages are represented.
- Regeneration only touches changed sections and never silently overwrites user edits.

**Acceptance criteria**

- A 30-slide text PDF becomes a structured note with headings and at least the major diagrams in under 2 minutes.
- Every generated section maps to a source page.
- User edits survive regeneration.

---

### 4.2 Study workspace

**Goal:** Organize material by course and turn notes into an active study system.

- Courses, folders, tags, full-text and semantic search.
- **Concept map**: extracted concepts and prerequisite links; color-coded mastery.
- **Multi-length summaries**: one-line, one-minute, ten-minute, full notes.
- **Flashcards and glossary** generated from notes, with source links.
- **Formula sheet** and **code snippets** views for technical subjects.
- **Spaced repetition** (FSRS/SM-2) with a daily review queue.
- **Exam planner**: enter the exam date and available hours; the app schedules coverage and review.
- **Teach-back mode** (added): the student explains a concept aloud; the AI grades understanding and names gaps.
- **Socratic mode** (added): the AI asks questions instead of giving answers.
- **Diagram explainer** (added): click any figure to get a labeled, interactive explanation.

---

### 4.3 Story and narrative generation

**Goal:** Turn dry notes into a memorable narrative without sacrificing accuracy.

**Parameters**

- Persona/narrator (see below), tone (funny, dramatic, calm, exam-focused), audience level, length, language, and mandatory concepts.
- Optional web research for context, always with separate citations.
- Serialized chapters with a "series bible" for consistent characters and callbacks.

**Flagship persona: "Gauss narrates the story"**

- Gauss acts as a first-person guide through the history of the concepts.
- Connects each idea to the problem it was invented to solve, with anecdotes and analogies.
- Clearly labels historical dramatization and invented dialogue; never fabricates quotes attributed to real people.
- Other templates: detective mystery, sports commentary, space mission, courtroom debate, dialogue between concepts, ELI5.

**Grounding**

- Each paragraph carries citations to source blocks; added analogies are marked as `context` rather than `source`.
- A fact-check pass can flag unsupported claims and optionally verify with web sources.
- The generated story is **editable Markdown**, not a black-box audio file. Users can fix a sentence and regenerate only that scene.

**Outputs**

- `story.md`, a scene/storyboard list, and diagram references per scene.
- Optional learning objectives and a "what you should be able to explain" checklist.

---

### 4.4 Audio and video generation

**Goal:** Produce engaging study media from the story, async and at controlled cost.

**Audio**

- TTS with selectable voices, speed, pauses, and pronunciation lexicon for Galician/Spanish terms.
- Chapter markers, transcript, and background music with ducking.
- Offline download and playback.

**Video**

- Scene composition from headings, diagrams, and narration: slide/ken-burns visuals, captions, optional presenter avatar.
- Two formats: 16:9 lesson and 9:16 short clip.
- Auto-generated **shorts**: hook, three key points, and a call-to-action to take the quiz.
- Localization/dubbing for gl/es/en; human review for pronunciation-critical content.

**Generation behavior**

- Long jobs run asynchronously with stage progress, ETA, cancel, and retry.
- Cache by content hash + voice/style settings; regenerate only changed scenes.
- Show an estimated cost/time before generating; enforce per-user quotas.
- Every media item has captions and a transcript; diagrams have audio descriptions.

---

### 4.5 Interactive playback and Q&A

**Goal:** Make passive media active.

- Player with synced transcript, chapters, and diagrams.
- **Pause to ask** by text or push-to-talk; speech-to-text; answer is grounded in the current lesson, the course, and optionally the web.
- Answers include citations and can show the relevant diagram; "take me to that part" seeks the audio.
- Intent shortcuts: *explain simpler*, *give an example*, *why does this matter*, *is this on the exam*, *translate*.
- **Checkpoint questions** every few minutes; a wrong answer rewinds to the relevant segment.
- **Hands-free voice conversation** with barge-in (added).
- Questions and answers can be appended to notes; recurring confusion becomes a weak-topic entry.
- Resume across devices; playback speed; offline/PWA.
- Microphone audio is processed transiently and not retained unless the user opts in.

---

### 4.6 Assessment: quizzes, exams, and correction

**Goal:** Close the loop with retrieval practice and credible grading.

**Lesson quizzes**

- Generated from learning objectives, not just from sentences.
- Question types: multiple choice, true/false, short answer, numeric, ordering, matching, label-the-diagram, oral answer.
- Image-based questions reuse cropped diagrams.
- Distractors encode plausible misconceptions; explanations link to source blocks.
- Adaptive difficulty based on concept mastery; spaced review of missed items.

**Exam generator**

- Blueprint controls: topics, coverage, Bloom levels, difficulty mix, number of questions, points, time limit.
- Produces variants A/B, answer key, grading rubric, and a coverage report showing unused topics.
- Optional import of past exams to infer style ("exam radar") — clearly a prediction, not a leak.

**Exam corrector**

- Upload photos/PDFs of handwritten or typed answers.
- OCR + per-question rubric grading with partial credit and confidence.
- Human review/override; feedback and model answer per question.
- Batch grading, class analytics, CSV export.
- Integrity note: self-study mode is open; graded mode can enable lockdown, but this is not the MVP.

**End-of-session Markdown lecture**

- Auto-generated lecture notes combining the source, the story, questions asked, corrections, and weak topics.
- Open Markdown, downloadable, editable, and appendable to the course.
- Includes "questions you still get wrong" and a next-review date.

---

### 4.7 Social and gamification

**Goal:** Use social motivation without turning studying into a popularity contest.

- **Study feed** (TikTok-style, opt-in): vertical clips generated from lessons, with likes, comments, reposts, and "study with me" posts.
- **Challenges**: async 1v1 quiz duels; friend and class championships; weekly leaderboards.
- **Streaks ("racha")**: daily study, lessons completed, quizzes; timezone-aware; freeze tokens.
- **Study hours and XP**: visible personal dashboard; badges such as *Diagram Detective*, *7-day Streak*, *Exam Ace*.
- **Results sharing**: friends see quiz/exam results only with explicit consent; anonymous mode available.
- **Group study rooms** (added): synchronized playback, shared notes, live quiz.
- **Anti-toxicity**: no public ranking by grades by default; report/block; rate limits; private-by-default courses.
- **Class invite codes** for teachers and study groups.

---

### 4.8 Web interface and UX

**Goal:** One coherent app that a non-technical student can use without a tutorial.

- **Landing/demo**: try a sample deck without signing up.
- **Onboarding**: goal (exam date), subject, language, level, upload.
- **Dashboard**: continue studying, courses, streak, upcoming exams, weak topics.
- **Project tabs**: Source · Notes · Story · Media · Practice · Analytics.
- **Editor**: split source/notes, slash commands, preview, version history.
- **Generation panel**: style presets, estimated time/cost, progress, cancel.
- **Player**, **quiz**, **exam builder**, and **grading queue** as first-class pages.
- **Teacher mode** (added): classes, assignments, anonymous confusion heatmap, cohort analytics.
- **Settings**: language, accessibility, privacy, export/delete all data, connected accounts.
- Responsive/PWA, dark mode, WCAG 2.2 AA, keyboard shortcuts, screen-reader labels, dyslexia-friendly font option.
- Empty states and a seeded demo course so the app never looks broken during a demo.

---

### 4.9 Added high-value ideas

- **Learning profile ("study DNA")**: preferred modality, session length, best time of day, recurring mistakes.
- **Study buddy agent**: proactive plan, reminders, and accountability check-ins.
- **Lecture recorder**: record a class (with consent), transcribe, align to slides, and generate notes.
- **Formula lab / code walkthrough**: interactive variables, graphs, or step-through execution for technical material.
- **Citation-first mode**: every sentence can reveal its source, with an "unsupported" filter.
- **Offline exam-week pack**: download lessons, transcripts, and quizzes for unreliable internet.
- **Integrity-aware sharing**: share notes and clips, never the copyrighted source deck by default.
- **Import/export bridges** (added): Google Drive, Notion, Anki, Quizlet, plain Markdown zip.
- **Collaborative notes** (added): comment, suggest, and merge edits with friends.

---

## 5. MVP for a 48-hour hackathon

### Must have (demo-critical)

| # | Capability | Why |
|---|---|---|
| 1 | Upload PDF and convert to editable Markdown with page links | Core promise and differentiator |
| 2 | Crop at least one diagram and reference it in the note | Proves diagram-aware conversion |
| 3 | Generate a story script with a selectable persona (Gauss default) | Memorable, demo-friendly |
| 4 | Text-to-speech audio lesson with transcript | Multi-modal payoff |
| 5 | Player with pause-to-ask (text; voice if time allows) and cited answers | The "wow" interaction |
| 6 | End-of-lesson quiz with explanations | Learning loop closure |
| 7 | Minimal dashboard + seeded demo course | Usable narrative |
| 8 | Shareable result card or clip | Social hook |

### Should have

- Voice input for questions.
- One short vertical clip.
- Streak/leaderboard for a single class group.
- Export Markdown zip.

### Could have

- Video scenes (slides + narration).
- Exam generator.
- Teacher mode.

### Won't have (explicitly cut)

- Full exam corrector with handwritten OCR.
- Global social network, moderation at scale.
- Multi-user real-time collaboration.
- Native mobile apps.
- Payment, institutional SSO.

### Demo script (3 minutes)

1. Upload a real class PDF; show conversion stages and a corrected diagram.
2. Edit one paragraph and regenerate only that scene.
3. Play the Gauss narration; pause and ask a spoken question; show the citation and diagram.
4. Take the end quiz; answer one image question wrong; show the explanation and rewound segment.
5. Show the generated Markdown lecture + share card.

---

## 6. Proposed architecture (to confirm with the team)

### Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; PDF.js for source view; WaveSurfer for audio.
- **Backend:** FastAPI (Python) for document/AI pipeline; Postgres + pgvector; Redis + Celery/RQ for jobs; S3/MinIO for files.
- **Alternative:** a single Next.js app with route handlers if the team is JavaScript-only. Choose one early; do not split the pipeline across both.
- **AI:** provider-agnostic adapter; structured JSON outputs; embeddings for RAG; citations stored per generated block.
- **Documents:** PyMuPDF/pdfplumber, python-pptx, Tesseract, vision-model fallback for hard scans.
- **Media:** TTS provider with a Galician voice; FFmpeg or Remotion for video; render worker separate from the web process.
- **Auth:** Auth.js or Clerk; email magic link plus OAuth.
- **Deploy:** Docker Compose locally; frontend on Vercel; API/worker on Fly.io/Render; managed object storage.

### Processing flow

```
upload → validate → extract/OCR → layout + figures → chunk
       → LLM structure → validate → note.md + manifest
       → story generation → scene split → TTS/render jobs
       → player + RAG index → quiz generation → attempts → mastery
```

### Core data model

| Entity | Key fields |
|---|---|
| `User` | id, locale, preferences, consent flags |
| `Course` | id, owner, title, exam date, language |
| `SourceDocument` | id, course, filename, hash, page count, status |
| `Block` | id, document, page, bbox, text, confidence, source type |
| `Note` | id, course, markdown, version, protected ranges |
| `Asset` | id, note, kind (diagram/audio/video), path, alt text |
| `Story` | id, note, persona, parameters, markdown, citations |
| `MediaJob` | id, story, kind, status, progress, cost, error |
| `Lesson` | id, story, audio/video asset, transcript, chapters |
| `Quiz` / `Question` / `Attempt` | objectives, type, options, answer, rubric, mastery delta |
| `Exam` / `Submission` | blueprint, variant, answers, grades, review status |
| `Group` / `Challenge` / `Streak` | members, results, visibility, timezone |

### Engineering guardrails

- One `.env.example`; never commit keys. Server-side provider keys by default.
- Every long operation is a job with status, retries, and idempotency.
- Store model name/version and prompt version with generated artifacts for reproducibility.
- Cost and latency budgets per generation; cache aggressively.
- Add a tiny evaluation set of real slides to catch conversion regressions.

---

## 7. Privacy, copyright, and trust

- Course material is **private by default**; public sharing is opt-in and excludes the original file.
- Users must own or have permission to upload material; provide a takedown path.
- Export and delete-all-data must work; no training on user content without explicit consent.
- Voice recordings are transient by default; clear consent before recording a lecture or a friend.
- Generated content is labeled; citations are always one click away.
- Leaderboards and grade sharing are opt-in to avoid pressure and harassment.

---

## 8. Success metrics

| Area | Metric | Target for demo |
|---|---|---|
| Activation | Upload → first playable lesson | > 70% |
| Time to value | 30-slide deck → first lesson | < 5 min |
| Engagement | Lessons completed per active user | > 1 per session |
| Active learning | Questions asked per lesson | > 2 |
| Learning | Pre/post quiz improvement | Measurable in demo |
| Trust | Generated claims with citations | > 95% |
| Social | Shares or challenges per demo user | > 1 |
| Cost | Cost per 10-minute lesson | Within budget |

---

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Hallucinated content | Source-grounded generation, citations, "unsupported" flags, fact-check pass |
| Poor OCR / broken formulas | Confidence scores, review queue, vision-model fallback, easy manual fixes |
| Diagrams lost or mis-cropped | Layout detection, manual recrop, alt text, coverage report |
| TTS quality in Galician | Test providers early; fallback Spanish; pronunciation lexicon |
| Long generation times | Async jobs, previews, scene-level regeneration, caching |
| Runaway API cost | Quotas, estimates before generation, caching, small demo scope |
| Copyright concerns | Private by default, no public source sharing, takedown process |
| Scope creep in 48h | Hard MVP cut list; audio before video; text questions before voice |
| Social toxicity | Opt-in sharing, no grade leaderboards by default, report/block |
| Privacy of recordings | Consent, transient processing, retention controls |
| Demo failure | Seeded demo course, pre-generated fallback assets, offline recording |

---

## 10. Open decisions

1. **Demo subject:** mathematics (Gauss persona fits) or computer science (strong diagrams/code)?
2. **Demo language:** Galician-first, Spanish-first, or English-first? Which TTS provider actually supports it?
3. **MVP media:** audio only, or audio + one pre-rendered video clip?
4. **Auth:** real accounts or a single demo session? Accounts add realism but cost time.
5. **Social depth:** one class leaderboard/challenge, or a full feed? Recommend one challenge only.
6. **Stack:** Python pipeline + Next frontend, or all-TypeScript? Decide before scaffolding.
7. **Model/provider budget and keys:** who owns them, and what is the hard cap?

---

## Appendix: Traceability to the original notes

| Original idea | Where refined |
|---|---|
| PDF slides → editable Markdown | §4.1 |
| Web interface for tech and non-tech users | §4.8 |
| Markdown with cropped diagrams for later media | §4.1, §4.4 |
| Markdown → short story for engagement | §4.3 |
| Story → audio/video, web research, images | §4.3, §4.4 |
| Markdown → audio/video for studying | §4.4, §4.5 |
| Pause to ask by text or microphone, image answers | §4.5 |
| End-of-media quiz with images | §4.6 |
| Markdown lecture at the end, open format | §4.6 |
| Quiz from notes | §4.6 |
| Exam generator and corrector | §4.6 |
| "Gauss narrates the story" | §4.3 |
| Song / TikTok feed / comments / friends | §4.7 |
| Championship against friends | §4.7 |
| Streak, study hours, friends see results, reposts | §4.7 |
