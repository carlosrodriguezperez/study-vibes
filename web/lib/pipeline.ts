import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { draftEpisode, synthesize, TTS_VOICE } from "./providers";
import { extractPdf, trimSource } from "./extract";
import {
  getEpisode,
  patchEpisode,
  patchSegment,
  saveAudio,
  saveEpisode,
} from "./store";
import type { Draft, Episode } from "./types";

export type StartInput =
  | { kind: "demo" }
  | { kind: "upload"; bytes: Uint8Array; filename: string };

/** Fixed id so the pre-rendered demo is reused instead of regenerated. */
const DEMO_ID = "demo-sets-0001";

const running = new Set<string>();

function hashText(text: string): string {
  return createHash("sha1").update(text).digest("hex").slice(0, 12);
}

async function whenReady(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    console.error("[pipeline]", error);
  }
}

export async function startEpisode(
  input: StartInput,
  language = "es",
): Promise<Episode> {
  if (input.kind === "demo") {
    const existing = await getEpisode(DEMO_ID);
    const complete =
      existing?.status === "ready" &&
      existing.segments.length > 0 &&
      existing.segments.every((segment) => segment.audioUrl);
    // The demo is pre-rendered on purpose: no live model calls on stage.
    if (complete) return existing!;
    if (running.has(DEMO_ID) && existing) return existing;
  }

  const id = input.kind === "demo" ? DEMO_ID : randomUUID();
  const episode: Episode = {
    id,
    title: "Preparing your episode",
    topic: "",
    sourceName:
      input.kind === "demo" ? "Demo episode: Sets" : input.filename,
    language,
    status: "queued",
    stage: "Queued",
    segments: [],
    quiz: [],
    createdAt: new Date().toISOString(),
    isDemo: input.kind === "demo",
  };

  await saveEpisode(episode);
  running.add(id);
  whenReady(run(id, input, language).finally(() => running.delete(id)));
  return episode;
}

async function loadFixture(): Promise<Draft | null> {
  try {
    const file = path.join(process.cwd(), "fixtures", "demo-episode.json");
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

async function run(id: string, input: StartInput, language: string) {
  try {
    let draft: Draft;
    let model: string;

    const fixture = input.kind === "demo" ? await loadFixture() : null;

    if (fixture) {
      await patchEpisode(id, {
        status: "scripting",
        stage: "Loading the demo episode",
      });
      draft = fixture;
      model = "pre-written demo script";
    } else {
      await patchEpisode(id, {
        status: "extracting",
        stage: "Reading your material",
      });

      let sourceText: string;
      if (input.kind === "demo") {
        const pdfPath =
          process.env.DEMO_PDF ??
          path.join(process.cwd(), "..", "evals", "sources", "math-sets-preliminaries.pdf");
        const bytes = await fs.readFile(pdfPath);
        const { text } = await extractPdf(new Uint8Array(bytes));
        sourceText = text;
      } else {
        const { text } = await extractPdf(input.bytes);
        sourceText = text;
      }

      await patchEpisode(id, {
        status: "scripting",
        stage: "Writing an episode worth listening to",
      });
      const result = await draftEpisode(trimSource(sourceText), language);
      draft = result.draft;
      model = result.model;
    }

    const episodeBefore = await getEpisode(id);

    await patchEpisode(id, {
      status: "rendering",
      stage: `Recording segment 1 of ${draft.segments.length}`,
      title: draft.title,
      topic: draft.topic,
      language: draft.language || language,
      segments: draft.segments.map((s) => ({
        ...s,
        textHash: hashText(s.text),
      })),
      quiz: draft.quiz,
      model,
      voice: TTS_VOICE,
    });

    for (const segment of draft.segments) {
      const alreadyRendered = episodeBefore?.segments.find(
        (candidate) => candidate.id === segment.id,
      );
      const sameText = alreadyRendered?.textHash === hashText(segment.text);
      if (alreadyRendered?.audioUrl && alreadyRendered.durationSec && sameText) {
        // Re-rendering costs a TTS request; keep finished audio.
        await patchSegment(id, segment.id, {
          audioUrl: alreadyRendered.audioUrl,
          durationSec: alreadyRendered.durationSec,
        });
        continue;
      }

      await patchEpisode(id, {
        stage: `Recording segment ${segment.id} of ${draft.segments.length}`,
      });
      try {
        const { wav, durationSec } = await synthesize(segment.text);
        const name = `seg-${segment.id}.wav`;
        await saveAudio(id, name, wav);
        await patchSegment(id, segment.id, {
          audioUrl: `/api/media/${id}/${name}`,
          durationSec,
        });
      } catch (error) {
        // The player falls back to browser speech synthesis for this segment.
        console.error(`[tts] segment ${segment.id} failed`, error);
      }
    }

    await patchEpisode(id, { status: "ready", stage: "Ready" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await patchEpisode(id, {
      status: "error",
      stage: "Something went wrong",
      error: message,
    }).catch(() => undefined);
  }
}
