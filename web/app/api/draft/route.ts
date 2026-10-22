import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { extractPdf, trimSource } from "@/lib/extract";
import { draftEpisode } from "@/lib/providers";

/**
 * Text-only preview: writes an episode script and returns it.
 * No audio, no persistence, no TTS quota spent.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const language = String(form.get("language") ?? "es");
    const file = form.get("file");

    let bytes: Uint8Array;
    if (file instanceof File) {
      bytes = new Uint8Array(await file.arrayBuffer());
    } else {
      const pdfPath =
        process.env.DEMO_PDF ??
        path.join(process.cwd(), "..", "evals", "sources", "math-sets-preliminaries.pdf");
      bytes = new Uint8Array(await fs.readFile(pdfPath));
    }

    const { text } = await extractPdf(bytes);
    const { draft, model } = await draftEpisode(trimSource(text), language);

    return NextResponse.json({
      draft,
      model,
      sourceChars: text.length,
      words: draft.segments.reduce(
        (sum, segment) => sum + segment.text.split(/\s+/).length,
        0,
      ),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
