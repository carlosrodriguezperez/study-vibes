"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Uploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"demo" | "file" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function submit(form: FormData, kind: "demo" | "file") {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch("/api/episodes", { method: "POST", body: form });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setError(json.error ?? "Could not start the episode.");
        setBusy(null);
        return;
      }
      router.push(`/episode/${json.id}`);
    } catch {
      setError("Network error. Is the server still running?");
      setBusy(null);
    }
  }

  function startDemo() {
    const form = new FormData();
    form.set("demo", "1");
    void submit(form, "demo");
  }

  function startFile(file: File) {
    const form = new FormData();
    form.set("file", file);
    form.set("language", "es");
    void submit(form, "file");
  }

  return (
    <div className="w-full max-w-2xl">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) startFile(file);
        }}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragging
            ? "border-accent bg-accent/10"
            : "border-white/15 bg-white/[0.03] hover:border-white/30"
        }`}
      >
        <p className="text-lg font-medium">Drop a PDF here</p>
        <p className="mt-1 text-sm text-muted">
          Slides, notes, a chapter. We turn the topic into a 3-minute episode.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {busy === "file" ? "Reading your PDF…" : "Choose a PDF"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={startDemo}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
          >
            {busy === "demo" ? "Starting the demo…" : "Try the demo episode"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) startFile(file);
          }}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
