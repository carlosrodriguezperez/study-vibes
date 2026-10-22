import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";
import { connection } from "next/server";
import { audioPath } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; file: string }> },
) {
  await connection();
  const { id, file } = await context.params;
  try {
    const bytes = await fs.readFile(audioPath(id, file));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "content-type": "audio/wav",
        "content-length": String(bytes.length),
        // Audio is re-rendered in place; never let a browser pin a stale take.
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Audio not found." }, { status: 404 });
  }
}
