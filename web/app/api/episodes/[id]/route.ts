import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getEpisode } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  const { id } = await context.params;
  const episode = await getEpisode(id);
  if (!episode) {
    return NextResponse.json({ error: "Episode not found." }, { status: 404 });
  }
  return NextResponse.json(episode, {
    headers: { "cache-control": "no-store" },
  });
}
