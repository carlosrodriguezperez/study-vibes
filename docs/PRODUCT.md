# Study Vibes — Product Brief

> **One-liner:** Turn your notes, slides, or photos into a short audio/video lesson — and make pressing play the easiest part of studying.

**Status:** 48-hour hackathon project (ETSE 2026). Scope is deliberately narrow. No implementation yet.

---

## 1. The only thing we build

Students usually have the material. The hard part is **starting**: opening the slides, deciding what matters, and reading passively when tired.

Study Vibes does two things:

1. **Convert raw material into a short, listenable/watchable lesson.**
2. **Remove every step between "I should study" and pressing play.**

### What is new

Most tools summarize or chat. We turn the student's own material into a lean-back audio/video experience that can start in under a minute, on a phone, with no setup — and optionally end with a quick check that makes progress feel real.

### Why this makes you want to study

- **Tiny start:** press play; no setup, no decisions, no blank page.
- **Immediate reward:** the first segment plays while the rest is still generating.
- **Small commitment:** a 3-minute lesson feels doable even when tired.
- **Lean-back:** listen or watch on the bus, while walking, or lying down.
- **Clear finish:** a recap and an optional 3-question check, then "Done for now."

### Explicit non-goals (do not build now)

- Exams, exam correction, question banks, flashcards, spaced repetition.
- Teacher/classroom tools.
- Full Markdown editor or note-taking workspace.
- Interactive Q&A during playback.
- A full language-learning curriculum.
- Native mobile apps, payments, institutional SSO.

These can return later; they are not part of this build.

---

## 2. User and moment

**Persona:** Ana, 20. Exam in three days. She has a 40-slide PDF and 20 minutes on the bus. She is tired, opens her phone, and does not want to organize anything.

**Job to be done:** "Turn this into something I can press play on right now."

**Success moment:** She uploads or picks a sample, taps once, and hears a useful lesson before she has time to get distracted.

| Metric | Target |
|---|---|
| Time from open to first audio | < 60 seconds |
| Upload/select → play | > 70% |
| Median listening time | > 3 minutes |
| 3-minute lesson completion | > 50% |
| Optional 3-question check answered | > 30% |

---

## 3. Core experience

### The first 60 seconds

- **No signup wall.** The user gets value before creating an account, or uses an anonymous session.
- **No empty dashboard.** The landing page has one upload area and one demo lesson.
- **One primary action per screen.** Upload → "Start studying" → play.
- **Smart defaults.** Length, voice, and structure are preselected. The user can change them, but does not have to.
- **Micro-session by default.** Start with a 3-minute lesson, not the whole course.
- **Progressive playback.** The first segment starts as soon as it is ready; the rest renders in the background.
- **Mobile-first and screen-off friendly.** Audio keeps playing when the phone is locked.
- **Resume.** "Continue where you left off" is always one tap away.

### The lesson

- A short script: a hook, 3–5 key ideas, and a closing recap.
- Faithful to the source; no invented facts. Diagrams and slide images are used when available.
- Default structure: **3 minutes**, with options for 10 minutes or full coverage.
- Tone: clear and conversational, not a dry read-through of bullet points.

### The player

- Play/pause, speed, 15-second skip, transcript, captions.
- Audio-first. Video (slides/diagrams + captions) is a bonus if time allows.
- End screen: **"Keep going"** with the next segment/topic, or **"Done for now."**
- Optional **3-question check** after the lesson: instant feedback and explanations, no grades, no stored scores.

---

## 4. MVP for the hackathon

### Must have

| # | Capability | Why |
|---|---|---|
| 1 | Upload PDF or image; pick a demo lesson | Entry point |
| 2 | Extract text and OCR photos | Source fidelity |
| 3 | Generate a short lesson script with segments | The actual content |
| 4 | Text-to-speech audio with transcript | Core output |
| 5 | Mobile-first player with speed and resume | Core experience |
| 6 | Progressive generation: play segment 1 while the rest renders | Makes "under 60 seconds" real |
| 7 | Seeded demo + pre-generated fallback | Demo safety |
| 8 | Clear error/fallback state | Avoid dead ends |

### Should have

- Video: slide/diagram visuals with captions.
- Length presets: 3 min / 10 min / full.
- Output-language selector, including one target language for listening practice.
- Download audio + transcript.
- Background/lock-screen audio.

### Could have

- Optional 3-question end-of-lesson check with instant feedback.
- Voice selection.
- Simple cover image for the lesson.
- "Repeat this segment" control.

### Won't have

- Anything in §1 non-goals.
- A full quiz/exam platform, question banks, or stored grades.
- User accounts, courses, or libraries.
- Editing the generated script in the UI.
- Multi-user or real-time features.

---

## 5. Demo script (2 minutes)

1. Open on a phone. Show the single upload area and the demo button.
2. Tap the demo (or upload a real PDF). Show the conversion stages.
3. The first audio segment starts while the rest is still generating.
4. If the video is pre-rendered, switch to the video view with a diagram and captions.
5. Lock the phone; audio continues.
6. Reopen; show resume. If the check is ready, answer one question from the optional 3-question check.
7. End on the "Done for now" state.

**One-line pitch:** "Your notes, turned into something you can press play on in under a minute."

---

## 6. Proposed architecture (keep it minimal)

- **Frontend:** Next.js/React + Tailwind, mobile-first PWA.
- **Backend:** FastAPI (Python) for PDF/OCR/LLM/TTS; one service.
- **Pipeline:** `upload → extract/OCR → script JSON (+ optional quiz) → TTS per segment → audio + transcript → optional video`.
- **Jobs:** one background worker with a status endpoint; poll from the client. Do not build a queue system unless needed.
- **Storage:** local disk for the demo, S3-compatible storage if deployed.
- **Database:** SQLite for MVP; one `Lesson` row is enough.
- **Auth:** none for MVP. Anonymous session ID in local storage.
- **Caching:** hash the source file + settings; reuse generated audio for the demo.
- **Cost/latency:** generate segment-by-segment, cap lesson length, pre-render the demo.

### Minimal data model

| Entity | Fields |
|---|---|
| `Lesson` | id, source hash, filename, language, length preset, status, script JSON, quiz JSON (optional), audio URL, transcript, video URL (optional), created_at |

No users, courses, or question-bank tables.

---

## 7. Quality and safety

- Keep the source file private by default; delete it after processing if the user asks.
- Do not publish or share the original material without explicit action.
- Mark generated audio/video as AI-generated.
- If OCR or extraction fails, show the source page and ask for a clearer photo rather than inventing content.
- Only use material the user has permission to upload.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Bad OCR or broken layout | Vision-model fallback, show source page, allow re-upload |
| TTS latency kills the demo | Segment-by-segment generation, pre-rendered demo, cache |
| Video rendering is too slow | Audio-first; video optional; render only one scene if needed |
| Scope creep | The non-goals list is a hard gate |
| Demo failure | Seeded demo, pre-generated assets, offline recording |
| Cost blowup | Length caps, caching, one voice, one model |

---

## 9. Open decisions

1. **Audio-first or video in the live demo?** Recommend audio-first with one pre-rendered video.
2. **PDF only, or phone photos too?** Photos are high-value; test OCR early.
3. **Login or anonymous?** Recommend anonymous for the demo.
4. **Which TTS voice and language?** Pick one that sounds good and supports the demo language.
5. **Stack:** use what the team already knows; do not split across two backends.
6. **Default lesson length:** 3 minutes unless testing shows otherwise.
7. **Quiz in the demo:** include the 3-question check, or keep the demo purely audio/video? Recommend showing one question.

---

## 10. Deferred ideas (do not build now)

- Exams, exam generator/corrector, question banks, adaptive testing.
- Pause-to-ask Q&A, voice conversation.
- Teacher mode and class analytics.
- Full Markdown editing and version history.
- Language-learning mode with CEFR levels and glossaries.
- Flashcards, spaced repetition, exam planner.

Keep this list visible when new ideas appear: if it is not in §4, it waits.
