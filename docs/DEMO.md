# Demo runbook

**Status: rehearsal-ready.** The whole 2-minute path is built and measured. The gaps are listed at the bottom; none of them block the demo.

## What is proven

| Thing | Measured |
|---|---|
| Demo episode (pre-rendered) | 170 ms, no provider call, 1:17 of audio |
| First playable segment on a live upload | ~20 s (target is under 60 s) |
| Script generation (DeepSeek V4.1 Flash) | 0.7–11 s, JSON mode |
| TTS (Gemini) | one request per segment, ~6 s per 12 s of audio |
| Build, typecheck, lint | pass |

## Ten minutes before

1. `cd web && npm run dev`
2. Check that the repo-root `.env` has `OPENROUTER_API_KEY` and `GEMINI_API_KEY`.
3. Open <http://localhost:3000/episode/demo-sets-0001> and press Play once, with the room's speakers.
4. If the audio is missing, run `npm run demo:prepare` (costs one TTS request per segment).
5. Full screen, notifications off, other tabs closed.
6. Fallback in your pocket: the WAVs in `web/.data/episodes/demo-sets-0001/` play in any audio app.

## The 2-minute script

1. Open on the laptop, on the landing page.
2. Click **Try the demo episode** — it is instant and already rendered.
3. Let the hook play out loud: the twelve tabs and the crossed circles.
4. Point at the transcript, then use `Space` and `←`/`→` to show keyboard control.
5. Switch to another tab, type something, switch back: audio kept playing and the position resumed.
6. Let it finish, answer one question from the check.
7. One line: *"Your notes, turned into an episode you actually want to finish."*

## Fallbacks

- **Upload feels slow** → use the demo. The live path is the bonus, not the pitch.
- **TTS returns 429** → the demo audio is already on disk; the player falls back to browser speech for any missing segment.
- **No network** → the demo still plays, because it never calls a provider.
- **DeepSeek 503** → the live upload fails with a visible error; switch to the demo.

## What is still missing

- **Nobody has listened to the take end to end.** Timing of the jokes is unverified.
- No video; audio plus transcript only.
- The two-pane layout needs a viewport of at least 1024 px.
- Galician output is untested; the demo is Spanish.
- Gemini's free tier allows 10 TTS requests per day per model, so rehearse with the pre-rendered demo.
- No automated tests.
