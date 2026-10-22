"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Episode } from "@/lib/types";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function Player({ id }: { id: string }) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [index, setIndex] = useState(0);
  const [wantPlay, setWantPlay] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(true);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeRef = useRef<{ index: number; time: number } | null>(null);
  const appliedResume = useRef(false);

  /* ---------------------------- load + poll --------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/episodes/${id}`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError("Episode not found.");
          return;
        }
        const data = (await res.json()) as Episode;
        if (cancelled) return;
        setEpisode(data);
        if (data.status === "error") {
          setError(data.error ?? "Generation failed.");
        }
        if (!appliedResume.current && data.segments.length > 0) {
          appliedResume.current = true;
          try {
            // Keyed by the script itself: a re-rendered episode starts fresh.
            const key = `sv:progress:${id}:${data.segments[0]?.textHash ?? "0"}`;
            const saved = localStorage.getItem(key);
            if (saved) {
              const parsed = JSON.parse(saved) as { index: number; time: number };
              if (
                Number.isInteger(parsed.index) &&
                parsed.index >= 0 &&
                parsed.index < data.segments.length
              ) {
                resumeRef.current = parsed;
                setIndex(parsed.index);
                setTime(parsed.time);
              }
            }
          } catch {
            /* ignore malformed progress */
          }
        }
      } catch {
        if (!cancelled) setError("Cannot reach the server.");
      }
    }

    void tick();
    const timer = setInterval(tick, 1200);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id]);

  const segments = episode?.segments ?? [];
  const current = segments[index];
  const totalKnown = segments.every((s) => typeof s.durationSec === "number");
  const totalDuration = totalKnown
    ? segments.reduce((sum, s) => sum + (s.durationSec ?? 0), 0)
    : 0;

  /* --------------------------- audio wiring --------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    const src = current?.audioUrl;
    if (!audio || !src) return;

    if (audio.getAttribute("data-src") !== src) {
      audio.setAttribute("data-src", src);
      audio.src = src;
      audio.load();
      if (resumeRef.current && resumeRef.current.index === index) {
        audio.currentTime = resumeRef.current.time;
        resumeRef.current = null;
      }
    }
    audio.playbackRate = speed;
    if (wantPlay && audio.paused) {
      void audio.play().catch(() => setWantPlay(false));
    }
  }, [index, current?.audioUrl, wantPlay, speed]);

  const advance = useCallback(() => {
    setIndex((previous) => {
      if (previous + 1 < segments.length) return previous + 1;
      setWantPlay(false);
      setFinished(true);
      return previous;
    });
  }, [segments.length]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantPlay && !audio.paused) {
      audio.pause();
      setWantPlay(false);
      return;
    }
    setFinished(false);
    setWantPlay(true);
  }, [wantPlay]);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio || !current?.audioUrl) return;
      const max = audio.duration || duration || 0;
      audio.currentTime = Math.max(0, Math.min(max, audio.currentTime + delta));
    },
    [current?.audioUrl, duration],
  );

  /* ---------------------------- keyboard ------------------------------ */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        skip(-15);
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        skip(15);
      } else if (event.key.toLowerCase() === "t") {
        setShowTranscript((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, skip]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  function remember(nextTime: number) {
    try {
      const key = `sv:progress:${id}:${episode?.segments[0]?.textHash ?? "0"}`;
      localStorage.setItem(key, JSON.stringify({ index, time: nextTime }));
    } catch {
      /* storage may be full or blocked */
    }
  }

  function speakFallback() {
    if (!current || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = episode?.language === "gl" ? "gl-ES" : "es-ES";
    utterance.rate = speed;
    utterance.onend = () => advance();
    window.speechSynthesis.speak(utterance);
  }

  /* ------------------------------ render ------------------------------ */
  if (!episode && !error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-10 w-96 max-w-full rounded bg-white/10" />
          <div className="h-4 w-72 max-w-full rounded bg-white/5" />
        </div>
      </main>
    );
  }

  if (error && !episode) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6">
        <h1 className="text-2xl font-semibold">That episode did not load</h1>
        <p className="mt-3 text-muted">{error}</p>
        <Link
          href="/"
          className="mt-6 w-fit rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Start again
        </Link>
      </main>
    );
  }

  const generating = episode!.status !== "ready" && episode!.status !== "error";
  const waitingForAudio = wantPlay && !current?.audioUrl;

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1.05fr_1fr] lg:px-8">
      <audio
        ref={audioRef}
        onEnded={advance}
        onPause={() => setWantPlay(false)}
        onPlay={() => setWantPlay(true)}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setTime(audio.currentTime);
          remember(audio.currentTime);
        }}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
          audio.playbackRate = speed;
        }}
        preload="auto"
        className="hidden"
      />

      {/* --------------------------- player card --------------------------- */}
      <section className="flex flex-col rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
          <span>{episode!.isDemo ? "Demo episode" : "Your episode"}</span>
          <span>AI-generated audio</span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">
          {episode!.title}
        </h1>
        {episode!.topic ? (
          <p className="mt-1 text-sm text-muted">{episode!.topic}</p>
        ) : null}

        {generating ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span>{episode!.stage}…</span>
            <span className="ml-auto text-xs text-muted">
              {segments.filter((s) => s.audioUrl).length}/{segments.length} ready
            </span>
          </div>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-auto pt-6">
          <div className="text-sm text-muted">
            {current ? `Part ${current.id} · ${current.heading}` : "Waiting for the script"}
            {waitingForAudio && generating ? " · recording…" : ""}
          </div>

          <input
            aria-label="Seek"
            type="range"
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.1}
            value={Math.min(time, duration || 0)}
            onChange={(event) => {
              const audio = audioRef.current;
              const next = Number(event.target.value);
              if (audio && current?.audioUrl) audio.currentTime = next;
              setTime(next);
            }}
            className="mt-3 w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-xs tabular-nums text-muted">
            <span>{formatTime(time)}</span>
            <span>
              {duration ? formatTime(duration) : "—"}
              {totalDuration ? ` · ${formatTime(totalDuration)} total` : ""}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => skip(-15)}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
              title="Back 15 seconds (←)"
            >
              −15s
            </button>
            <button
              type="button"
              onClick={toggle}
              disabled={!episode!.segments.length}
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-40"
            >
              {wantPlay ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => skip(15)}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
              title="Forward 15 seconds (→)"
            >
              +15s
            </button>

            <select
              aria-label="Playback speed"
              value={speed}
              onChange={(event) => {
                const next = Number(event.target.value);
                setSpeed(next);
                if (audioRef.current) audioRef.current.playbackRate = next;
              }}
              className="ml-2 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm"
            >
              {SPEEDS.map((value) => (
                <option key={value} value={value} className="text-black">
                  {value}×
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowTranscript((value) => !value)}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
            >
              {showTranscript ? "Hide" : "Show"} transcript
            </button>
          </div>

          {!current?.audioUrl && !generating ? (
            <button
              type="button"
              onClick={speakFallback}
              className="mt-3 text-xs text-accent underline underline-offset-4"
            >
              Audio missing for this part — read it with the browser voice
            </button>
          ) : null}

          <p className="mt-4 text-xs text-muted">
            Space play/pause · ←/→ skip 15s · T transcript
          </p>
        </div>
      </section>

      {/* --------------------------- transcript ---------------------------- */}
      {showTranscript ? (
        <aside className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface/60">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Transcript
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {segments.length === 0 ? (
              <p className="text-sm text-muted">
                The script appears here as soon as it is written.
              </p>
            ) : (
              <ol className="space-y-5">
                {segments.map((segment, segmentIndex) => {
                  const active = segmentIndex === index;
                  return (
                    <li key={segment.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setIndex(segmentIndex);
                          setTime(0);
                          resumeRef.current = null;
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left transition ${
                          active ? "bg-accent/15" : "hover:bg-white/5"
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            active ? "text-accent" : "text-muted"
                          }`}
                        >
                          {segment.id}. {segment.heading}
                          {!segment.audioUrl ? " · recording" : ""}
                        </span>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                          {segment.text}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>
      ) : null}

      {/* ------------------------------ end ------------------------------- */}
      {finished && !generating ? (
        <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-surface/80 p-6">
          <h2 className="text-xl font-semibold">Done for now.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Go back to your material while it is fresh — the episode was built
            around it, not instead of it.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {episode!.quiz.map((question, questionIndex) => {
              const answered = answers[questionIndex];
              return (
                <div
                  key={questionIndex}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="text-sm font-medium">{question.question}</p>
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const chosen = answered === optionIndex;
                      const correct = question.answerIndex === optionIndex;
                      const revealed = answered !== undefined;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          disabled={revealed}
                          onClick={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [questionIndex]: optionIndex,
                            }))
                          }
                          className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                            revealed && correct
                              ? "border-emerald-400/50 bg-emerald-400/10"
                              : revealed && chosen
                                ? "border-red-400/50 bg-red-400/10"
                                : "border-white/10 hover:bg-white/5"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {answered !== undefined ? (
                    <p className="mt-3 text-xs text-muted">{question.explanation}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
            >
              Turn another PDF into an episode
            </Link>
            <button
              type="button"
              onClick={() => {
                setFinished(false);
                setIndex(0);
                setTime(0);
                audioRef.current?.load();
              }}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Listen again
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
