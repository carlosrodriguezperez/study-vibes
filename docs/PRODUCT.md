# Study Vibes — Product Brief

> **One-liner:** Turn your notes, slides, or photos into a short, entertaining episode about the topic — so you actually want to press play.

**Status:** 48-hour hackathon project (ETSE 2026). Scope is deliberately narrow. No implementation yet.

---

## 1. The only thing we build

Students already have the material. The hard part is **wanting to start**: opening the slides, deciding what matters, and reading passively when tired. A summary does not fix that — it is the same material, compressed, and just as easy to postpone.

Study Vibes does two things:

1. **Turn the topic of the material into a short, entertaining audio/video episode.**
2. **Remove every step between "I should study" and pressing play.**

### What is new

Most tools summarize or chat. We **dramatize the topic**. The uploaded material supplies the syllabus — the concepts that must be covered — and the episode builds something worth three minutes of attention around it: a cold open, a story, an analogy, a surprising but true piece of context, a reason to care.

The episode is **not a read-through of the slides** and not a narrated summary. It covers the same concepts, adds information the slides do not contain, and ends by pointing back to the material ("now go look at definition 2.1"). It does not replace the lecture; it makes the student curious enough to return to it.

Enrichment is the point, and it has one hard limit: **everything added must be true.** See §7.

The product is **laptop-first**. It is a plain responsive web app: no install, no mobile build, no account. A phone still works if the student opens it, but every layout, control, and keyboard shortcut is designed for a 13–15" screen and a trackpad.

### Why this makes you want to study

- **A hook, not a syllabus.** The first 15 seconds create a question the student wants answered, instead of listing what will be covered.
- **Curiosity gap.** The episode withholds the payoff until the concept has earned it.
- **Earned interest.** A true story, a real application, or a counterexample makes a dry definition matter.
- **Tiny start:** press play; no setup, no decisions, no blank page.
- **Small commitment:** 3 minutes feels doable even when tired.
- **A door back to the source:** the recap lands on the slides, not on "thanks for listening".

### Explicit non-goals (do not build now)

- Exams, exam correction, question banks, flashcards, spaced repetition.
- Teacher/classroom tools.
- Full Markdown editor or note-taking workspace.
- Interactive Q&A during playback.
- A full language-learning curriculum.
- Native mobile apps, payments, institutional SSO.
- Fabricated facts, invented quotes, studies, dates, or "fun facts" nobody can stand behind.
- A meme or comedy generator. Entertaining means engaging, not clownish.

These can return later; they are not part of this build.

---

## 2. User and moment

**Persona:** Ana, 20. Exam in three days. She has a 40-slide PDF and 20 minutes between classes. She opens her laptop, already has twelve tabs open, and does not want to organize anything. She does not need another summary; she needs a reason to care.

**Job to be done:** "Make me care about this topic for three minutes."

**Success moment:** She presses play, and forty seconds later she is still listening — slightly surprised that she now wants to know what the slides actually say.

| Metric | Target |
|---|---|
| Time from open to first audio | < 60 seconds |
| Upload/select → play | > 70% |
| Median listening time | > 3 minutes |
| 3-minute episode completion | > 50% |
| Optional 3-question check answered | > 30% |
| Post-episode "open the source" click | > 25% |

---

## 3. Core experience

### The first 60 seconds

- **No signup wall.** The user gets value before creating an account, or uses an anonymous session.
- **No empty dashboard.** The landing page has one upload area and one demo episode.
- **One primary action per screen.** Upload → "Play my episode" → play.
- **The hook comes first.** Segment 1 opens with the hook, never with "in this episode we will cover…".
- **Smart defaults.** Length, voice, tone, and structure are preselected. The user can change them, but does not have to.
- **Micro-session by default.** 3 minutes, not the whole course.
- **Progressive playback.** The first segment starts as soon as it is ready; the rest renders in the background.
- **Laptop-first and keyboard-friendly.** Audio keeps playing while she switches tabs to take notes, and the player is fully usable without a mouse.
- **Resume.** "Continue where you left off" is always one click away.

### The episode

- **Structure:** a cold open (10–15 s) that poses a question or drops into a small story → 3–5 key ideas from the source threaded through that narrative → at least one true enrichment moment → a recap that maps back to the material → optional check.
- **Coverage rule:** every idea in the source's main thread appears. Enrichment may not displace the syllabus.
- **Enrichment rule:** added context must be true, clearly extra, and never attributed to the source. If it cannot be verified, cut it.
- **Default length:** 3 minutes, with options for 10 minutes or full coverage.
- **Tone:** conversational, curious, a little dramatic. Never a dry read-through of bullet points.

A summary and an episode, on the same two pages of notes:

| | Summary (what we do not build) | Episode (what we build) |
|---|---|---|
| Opening | "This document covers sets, subsets, and operations." | "A set with no elements. Does it exist? Mathematics says yes — and that tiny decision breaks half the intuitions you have about collections." |
| Middle | Definitions, in order | The same definitions, but each one answers a question the story raised |
| Added context | None | Why the empty set is defined that way; a real case where the distinction matters |
| Ending | "That is all." | "Go back to slide 2 — you will now read Definition 2.1 differently." |

### The player

- Play/pause, speed, 15-second skip, transcript, captions.
- Keyboard control: `Space` play/pause, `←`/`→` skip 15 s, `T` toggle transcript.
- Two-pane layout on a wide screen: player and transcript side by side.
- Transcript is selectable and copyable, so it doubles as notes.
- Audio-first. Video (slides/diagrams + captions) is a bonus if time allows.
- End screen: **"Keep going"** (next segment/topic) or **"Done for now"**, plus a pointer back to the source.
- Optional **3-question check**: instant feedback and explanations, no grades, no stored scores.
- Generated audio and video are labelled AI-generated.

---

## 4. MVP for the hackathon

### Must have

| # | Capability | Why |
|---|---|---|
| 1 | Upload PDF or image; pick a demo episode | Entry point |
| 2 | Extract text from PDFs and transcribe uploaded images | Source fidelity |
| 3 | Generate an entertaining episode script: hook, 3–5 source ideas, true enrichment, recap | The actual product |
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

- Optional 3-question end-of-episode check with instant feedback.
- Voice selection and a consistent host persona.
- Light sound design: intro sting, segment transitions.
- Simple cover image for the episode.
- "Repeat this segment" control.

### Won't have

- Anything in §1 non-goals.
- A full quiz/exam platform, question banks, or stored grades.
- User accounts, courses, or libraries.
- Editing the generated script in the UI.
- Multi-user or real-time features.
- Narration that reads the slides verbatim.

---

## 5. Demo script (2 minutes)

1. Open on a laptop, full screen. Show the single upload area and the demo button.
2. Click the demo (or upload a real PDF). Narrate the stages: it is reading the slides to find the concepts, then writing an episode around them.
3. The first audio segment starts while the rest is still generating — **play the hook out loud**, so the room hears the tone immediately.
4. If the video is pre-rendered, switch to the video view with a diagram and captions.
5. Switch to another tab and type in it; audio continues.
6. Switch back; show resume. If the check is ready, answer one question.
7. End on "Done for now" with the pointer back to the slides.

**One-line pitch:** "Your notes, turned into an episode you actually want to finish."

---

## 6. Chosen architecture (keep it minimal)

- **One service:** Next.js (App Router) + React + Tailwind — a responsive web app that is laptop-first but still opens on a phone.
- **No Python service.** PDF extraction, the pipeline, and the API routes all run in Node inside the same app, so there is one thing to start, deploy, and debug.
- **Script model:** **DeepSeek V4.1 Flash** through OpenRouter (`deepseek/deepseek-v4.1-flash`) for image transcription cleanup, the episode script, enrichment, and the optional quiz.
- **Speech:** **Gemini TTS** (`gemini-3.8-flash-tts`, one prebuilt voice) for audio. Gemini is used **only** for speech — every word of text comes from DeepSeek. DeepSeek has no audio output, so this split is required, not optional.
- **Pipeline:** `upload → extract/transcribe → topic brief → episode script (+ enrichment + quiz) → TTS per segment → audio + transcript → optional video`.
- **Episode brief, not a summarizer prompt.** The generation step receives a creative brief: hook within 15 s, cover 3–5 source concepts, include at least one true enrichment, close with a pointer to the source, target 3 minutes, target language and tone.
- **Enrichment pass.** A second model call checks every added claim: is it true, and is it attributed to the source? Unverifiable claims are dropped rather than softened.
- **Jobs:** the pipeline runs in-process with a status endpoint; poll from the client. No queue system.
- **Storage:** local disk for the demo, S3-compatible storage if deployed.
- **Database:** SQLite, or a JSON file on disk if that is faster to ship; one `Episode` record is enough.
- **Auth:** none. Anonymous session ID in local storage.
- **Caching:** hash the source file + settings; reuse generated audio for the demo.
- **Cost/latency:** generate segment-by-segment, cap episode length, pre-render the demo.
- **Secrets:** `OPENROUTER_API_KEY` and `GEMINI_API_KEY` live in `.env`; only `.env.example` is committed.

### Minimal data model

| Entity | Fields |
|---|---|
| `Episode` | id, source hash, filename, topic, language, length preset, status, script JSON, quiz JSON (optional), audio URL, transcript, video URL (optional), created_at |

No users, courses, or question-bank tables.

---

## 7. Quality and safety

### Factual policy

The episode contains two kinds of content, held to different standards:

1. **Source facts** — definitions, results, and claims that come from the material. They must match the material. Nothing may be invented and attributed to the lecturer or the document.
2. **Enrichment** — true statements about the world that the material did not contain: history, applications, analogies, counterexamples, consequences. This is what makes the episode worth listening to.

Rules for both:

- Every claim must survive a judge asking "is that true?". If we cannot defend it, it does not ship.
- Enrichment is never attributed to the source or the lecturer.
- Never invent quotes, dates, studies, or numbers.
- Prefer safe, well-established context over a spectacular claim we cannot verify. A duller true episode beats a fun false one.
- Never contradict the source. If the source is ambiguous, say so instead of resolving it with a guess.

### Privacy and labelling

- Keep the source file private by default; delete it after processing if the user asks.
- Do not publish or share the original material without explicit action.
- Mark generated audio/video as AI-generated.
- If extraction fails, show the source page and ask for a clearer file rather than inventing content.
- Only use material the user has permission to upload.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Enrichment is wrong or hallucinated | Verification pass, conservative claims, drop anything unverifiable |
| Episode drifts off the source topic | Topic brief plus a coverage checklist of the source's main ideas |
| Entertainment crowds out the syllabus | Coverage check before an episode counts as ready |
| Episode sounds like a narrated slide deck | Prompt for conversational register; listen to segment 1 on every run |
| Bad PDF extraction or broken layout | Vision-model fallback, show the source page, allow re-upload |
| TTS latency kills the demo | Segment-by-segment generation, pre-rendered demo, cache |
| DeepSeek is slow, rate-limited, or down | Model fallback chain, capped source length, pre-generated demo episode |
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
- **Positioning:** an entertaining episode about the topic, enriched with true extra context — not a faithful summary of the slides.
- **Artifact name:** the generated piece is an **episode**, not a lesson or a lecture.

### Open

1. **Audio-first or video in the live demo?** Recommend audio-first with one pre-rendered video.
2. **PDF only, or images too?** Images are high-value; test image transcription early.
3. **Which TTS voice and host persona?** Pick one voice by ear on the Spanish corpus; decide whether the host has a name and a point of view.
4. **How much enrichment per episode?** Recommend one or two moments, always verified, plus a recap pointer.
5. **Default episode length:** 3 minutes unless testing shows otherwise.
6. **Quiz in the demo:** include the 3-question check, or keep it audio-only? Recommend showing one question.
7. **Sound design:** intro sting and transitions — worth it for the "entertaining" claim, or too risky for the demo?

---

## 10. Deferred ideas (do not build now)

- Exams, exam generator/corrector, question banks, adaptive testing.
- Pause-to-ask Q&A, voice conversation.
- Teacher mode and class analytics.
- Full Markdown editing and version history.
- Language-learning mode with CEFR levels and glossaries.
- Flashcards, spaced repetition, exam planner.
- Multi-host shows, guest voices, or a recurring series.

Keep this list visible when new ideas appear: if it is not in §4, it waits.
