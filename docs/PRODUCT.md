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

Most tools summarize or chat. We turn the student's own material into a lean-back audio/video experience that can start in under a minute, on a laptop, with no setup — and optionally end with a quick check that makes progress feel real.

The product is **laptop-first**. It is a plain responsive web app: no install, no mobile build, no account. A phone still works if the student opens it, but every layout, control, and keyboard shortcut is designed for a 13–15" screen and a trackpad.

### Why this makes you want to study

- **Tiny start:** press play; no setup, no decisions, no blank page.
- **Immediate reward:** the first segment plays while the rest is still generating.
- **Small commitment:** a 3-minute lesson feels doable even when tired.
- **Lean-back:** listen while typing notes, eating, or between classes.
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

**Persona:** Ana, 20. Exam in three days. She has a 40-slide PDF and 20 minutes between classes. She opens her laptop, already has twelve tabs open, and does not want to organize anything.

**Job to be done:** "Turn this into something I can press play on right now."

**Success moment:** She uploads or picks a sample, clicks once, and hears a useful lesson before she has time to get distracted.

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
- **Laptop-first and keyboard-friendly.** Audio keeps playing while she switches tabs to take notes, and the player is fully usable without a mouse.
- **Resume.** "Continue where you left off" is always one click away.

### The lesson

- A short script: a hook, 3–5 key ideas, and a closing recap.
- Faithful to the source; no invented facts. Diagrams and slide images are used when available.
- Default structure: **3 minutes**, with options for 10 minutes or full coverage.
- Tone: clear and conversational, not a dry read-through of bullet points.

### The player

- Play/pause, speed, 15-second skip, transcript, captions.
- Keyboard control: `Space` play/pause, `←`/`→` skip 15 s, `T` toggle transcript.
- Two-pane layout on a wide screen: player and transcript side by side.
- Transcript is selectable and copyable, so it doubles as notes.
- Audio-first. Video (slides/diagrams + captions) is a bonus if time allows.
- End screen: **"Keep going"** with the next segment/topic, or **"Done for now."**
- Optional **3-question check** after the lesson: instant feedback and explanations, no grades, no stored scores.

---

## 4. MVP for the hackathon

### Must have

| # | Capability | Why |
|---|---|---|
| 1 | Upload PDF or image; pick a demo lesson | Entry point |
| 2 | Extract text from PDFs and transcribe uploaded images | Source fidelity |
| 3 | Generate a short lesson script with segments | The actual content |
| 4 | Text-to-speech audio with transcript | Core output |
| 5 | Laptop player with speed, keyboard control, and resume | Core experience |
| 6 | Progressive generation: play segment 1 while the rest renders | Makes "under 60 seconds" real |
| 7 | Seeded demo + pre-generated fallback | Demo safety |
| 8 | Clear error/fallback state | Avoid dead ends |

### Should have

- Video: slide/diagram visuals with captions.
- Length presets: 3 min / 10 min / full.
- Output-language selector, including one target language for listening practice.
- Download audio + transcript.
- Background-tab playback while she takes notes in another window.

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

1. Open on a laptop, full screen. Show the single upload area and the demo button.
2. Click the demo (or upload a real PDF). Show the conversion stages.
3. The first audio segment starts while the rest is still generating.
4. If the video is pre-rendered, switch to the video view with a diagram and captions.
5. Switch to another tab and type in it; audio continues.
6. Switch back; show resume. If the check is ready, answer one question from the optional 3-question check.
7. End on the "Done for now" state.

**One-line pitch:** "Your notes, turned into something you can press play on in under a minute."

---

## 6. Chosen architecture (keep it minimal)

- **One service:** Next.js (App Router) + React + Tailwind — a responsive web app that is laptop-first but still opens on a phone.
- **No Python service.** PDF extraction, the pipeline, and the API routes all run in Node inside the same app, so there is one thing to start, deploy, and debug.
- **Script model:** **DeepSeek V4.1 Flash** through OpenRouter (`deepseek/deepseek-v4.1-flash`) for image transcription cleanup, the lesson script, and the optional quiz.
- **Speech:** **Gemini TTS** (`gemini-3.8-flash-tts`, one prebuilt voice) for audio. Gemini is used **only** for speech — every word of text comes from DeepSeek. DeepSeek has no audio output, so this split is required, not optional.
- **Pipeline:** `upload → extract/OCR → script JSON (+ optional quiz) → TTS per segment → audio + transcript → optional video`.
- **Jobs:** the pipeline runs in-process with a status endpoint; poll from the client. No queue system.
- **Storage:** local disk for the demo, S3-compatible storage if deployed.
- **Database:** SQLite, or a JSON file on disk if that is faster to ship; one `Lesson` record is enough.
- **Auth:** none. Anonymous session ID in local storage.
- **Caching:** hash the source file + settings; reuse generated audio for the demo.
- **Cost/latency:** generate segment-by-segment, cap lesson length, pre-render the demo.
- **Secrets:** `OPENROUTER_API_KEY` and `GEMINI_API_KEY` live in `.env`; only `.env.example` is committed.

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
- If OCR or extraction fails, show the source page and ask for a clearer image rather than inventing content.
- Only use material the user has permission to upload.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Bad PDF extraction or broken layout | Vision-model fallback, show the source page, allow re-upload |
| TTS latency kills the demo | Segment-by-segment generation, pre-rendered demo, cache |
| DeepSeek is slow, rate-limited, or down | Model fallback chain, capped source length, pre-generated demo lesson |
| TTS provider quota or key missing | Pre-rendered demo audio, browser speech synthesis as last resort |
| Video rendering is too slow | Audio-first; video optional; render only one scene if needed |
| Scope creep | The non-goals list is a hard gate |
| Demo failure | Seeded demo, pre-generated assets, offline recording |
| Cost blowup | Length caps, caching, one voice, one model |

---

## 9. Decisions

### Settled

- **DeepSeek access:** OpenRouter (`https://openrouter.ai/api/v1`), model `deepseek/deepseek-v4.1-flash`, key in `OPENROUTER_API_KEY`.
- **Speech:** Gemini TTS, model `gemini-3.8-flash-tts`, one prebuilt voice, key in `GEMINI_API_KEY`. Gemini is used only for audio; all text comes from DeepSeek.
- **Stack:** one Next.js app in Node. No FastAPI, no second backend.
- **Form factor:** laptop-first responsive web app; a phone still renders but is not the target.
- **Auth:** anonymous session, no signup.

### Open

1. **Audio-first or video in the live demo?** Recommend audio-first with one pre-rendered video.
2. **PDF only, or images too?** Images are high-value; test image transcription early.
3. **Which TTS voice?** Pick one prebuilt voice by ear on the Spanish corpus.
4. **Default lesson length:** 3 minutes unless testing shows otherwise.
5. **Quiz in the demo:** include the 3-question check, or keep the demo purely audio/video? Recommend showing one question.

---

## 10. Deferred ideas (do not build now)

- Exams, exam generator/corrector, question banks, adaptive testing.
- Pause-to-ask Q&A, voice conversation.
- Teacher mode and class analytics.
- Full Markdown editing and version history.
- Language-learning mode with CEFR levels and glossaries.
- Flashcards, spaced repetition, exam planner.

Keep this list visible when new ideas appear: if it is not in §4, it waits.
