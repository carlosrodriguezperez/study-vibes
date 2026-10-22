import { NextResponse } from "next/server";
import { startEpisode } from "@/lib/pipeline";

const MAX_BYTES = 20 * 1024 * 1024;
const PDF_MAGIC = "%PDF";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const language = String(form.get("language") ?? "es");

    if (form.get("demo") === "1") {
      const episode = await startEpisode({ kind: "demo" }, language);
      return NextResponse.json({ id: episode.id });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "That file is over 20 MB. Try a smaller PDF." },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const header = Buffer.from(bytes.slice(0, 4)).toString("ascii");
    if (!header.startsWith(PDF_MAGIC)) {
      return NextResponse.json(
        { error: "Only PDF files are supported right now." },
        { status: 415 },
      );
    }

    const episode = await startEpisode(
      { kind: "upload", bytes, filename: file.name },
      language,
    );
    return NextResponse.json({ id: episode.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
