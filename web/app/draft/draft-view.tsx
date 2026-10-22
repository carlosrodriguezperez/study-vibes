"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Draft = {
  title: string;
  topic: string;
  language: string;
  segments: { id: number; heading: string; text: string }[];
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
};

type Meta = { model: string; words: number; seconds: number };

export default function DraftView() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(async (file?: File) => {
    setBusy(true);
    setError(null);
    setCopied(false);
    const started = Date.now();
    try {
      const form = new FormData();
      form.set("language", "es");
      if (file) form.set("file", file);
      const res = await fetch("/api/draft", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not write the script.");
        return;
      }
      setDraft(json.draft as Draft);
      setMeta({
        model: json.model,
        words: json.words,
        seconds: (Date.now() - started) / 1000,
      });
    } catch {
      setError("Network error. Is the server still running?");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    // Draft a script as soon as the page opens; that is the whole point of it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
  }, [run]);

  async function copy() {
    if (!draft) return;
    const text = [
      draft.title,
      "",
      ...draft.segments.map((s) => `${s.id}. ${s.heading}\n\n${s.text}\n`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Script preview
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Read it before it becomes audio</h1>
          <p className="mt-2 text-sm text-muted">
            Nothing is recorded here. This calls DeepSeek only, so it costs no TTS quota.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Writing…" : draft ? "Write another draft" : "Write a draft"}
        </button>
        <label className="cursor-pointer rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
          Use a PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void run(file);
            }}
          />
        </label>
        {draft ? (
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm hover:bg-white/10"
          >
            {copied ? "Copied" : "Copy text"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {busy && !draft ? (
        <div className="mt-10 animate-pulse space-y-3">
          <div className="h-6 w-2/3 rounded bg-white/10" />
          <div className="h-4 w-1/3 rounded bg-white/5" />
          <div className="h-24 rounded bg-white/5" />
        </div>
      ) : null}

      {draft ? (
        <article className="mt-10">
          <h2 className="text-2xl font-semibold">{draft.title}</h2>
          {meta ? (
            <p className="mt-1 text-xs text-muted">
              {draft.topic} · {meta.words} words · {meta.seconds.toFixed(1)}s ·{" "}
              {meta.model}
            </p>
          ) : null}

          <div className="mt-8 space-y-10">
            {draft.segments.map((segment) => (
              <section key={segment.id}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {segment.id}. {segment.heading}
                  <span className="ml-2 font-normal normal-case tracking-normal text-muted">
                    {segment.text.split(/\s+/).length} words
                  </span>
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-foreground/90">
                  {segment.text}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-white/10 bg-surface/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Check
            </h3>
            <ol className="mt-4 space-y-4">
              {draft.quiz.map((question, index) => (
                <li key={index}>
                  <p className="text-sm font-medium">{question.question}</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {question.options.map((option, optionIndex) => (
                      <li key={optionIndex}>
                        {optionIndex === question.answerIndex ? "✓" : "·"} {option}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-muted">{question.explanation}</p>
                </li>
              ))}
            </ol>
          </section>
        </article>
      ) : null}
    </main>
  );
}
