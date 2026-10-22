import { promises as fs } from "node:fs";
import path from "node:path";
import type { Episode } from "./types";

const ROOT = path.join(process.cwd(), ".data", "episodes");
const ID_RE = /^[a-z0-9-]{8,64}$/;

export function isValidId(id: string): boolean {
  return ID_RE.test(id);
}

export function episodeDir(id: string): string {
  if (!isValidId(id)) throw new Error("invalid episode id");
  return path.join(ROOT, id);
}

export function audioPath(id: string, name: string): string {
  if (!/^seg-\d+\.wav$/.test(name)) throw new Error("invalid audio name");
  return path.join(episodeDir(id), name);
}

async function writeAtomic(file: string, data: string) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

export async function saveEpisode(episode: Episode): Promise<Episode> {
  await fs.mkdir(episodeDir(episode.id), { recursive: true });
  await writeAtomic(
    path.join(episodeDir(episode.id), "episode.json"),
    JSON.stringify(episode, null, 2),
  );
  return episode;
}

export async function getEpisode(id: string): Promise<Episode | null> {
  if (!isValidId(id)) return null;
  try {
    const raw = await fs.readFile(path.join(episodeDir(id), "episode.json"), "utf8");
    return JSON.parse(raw) as Episode;
  } catch {
    return null;
  }
}

export async function patchEpisode(
  id: string,
  patch: Partial<Episode>,
): Promise<Episode> {
  const current = await getEpisode(id);
  if (!current) throw new Error(`episode ${id} not found`);
  return saveEpisode({ ...current, ...patch });
}

export async function patchSegment(
  id: string,
  segmentId: number,
  patch: { audioUrl?: string; durationSec?: number },
): Promise<Episode> {
  const current = await getEpisode(id);
  if (!current) throw new Error(`episode ${id} not found`);
  const segments = current.segments.map((s) =>
    s.id === segmentId ? { ...s, ...patch } : s,
  );
  return saveEpisode({ ...current, segments });
}

export async function saveAudio(
  id: string,
  name: string,
  bytes: Uint8Array,
): Promise<void> {
  await fs.mkdir(episodeDir(id), { recursive: true });
  await fs.writeFile(audioPath(id, name), bytes);
}
