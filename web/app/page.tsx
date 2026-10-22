import Link from "next/link";
import Uploader from "./uploader";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Study Vibes
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Your notes, turned into an episode you{" "}
        <span className="text-accent">actually want to finish</span>.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Upload the slides. We find the topic, write a short show around it —
        hook, story, real context — and start playing while the rest is still
        being recorded. Three minutes, no setup, no signup.
      </p>

      <div className="mt-10">
        <Uploader />
      </div>

      <p className="mt-4 text-sm text-muted">
        Want to read the script first?{" "}
        <Link
          href="/draft"
          className="text-accent underline underline-offset-4 hover:text-foreground"
        >
          Preview the text without generating audio
        </Link>
        .
      </p>

      <dl className="mt-12 grid gap-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-foreground">Under a minute</dt>
          <dd className="mt-1 text-muted">
            Segment 1 plays while segments 2–4 render.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Not a summary</dt>
          <dd className="mt-1 text-muted">
            The slides set the syllabus; the episode earns your attention.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Back to the source</dt>
          <dd className="mt-1 text-muted">
            It ends by pointing at the slide you should reread.
          </dd>
        </div>
      </dl>

      <p className="mt-12 text-xs text-muted">
        AI-generated audio. Added context is checked, not invented.
      </p>
    </main>
  );
}
