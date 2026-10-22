import { extractText, getDocumentProxy } from "unpdf";

export type Extraction = { text: string; pages: number };

export async function extractPdf(bytes: Uint8Array): Promise<Extraction> {
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  const body = String(text).replace(/[ \t]+/g, " ").trim();
  if (body.length < 200) {
    throw new Error(
      "Could not read enough text from this PDF. It may be scanned images; try a text-based PDF.",
    );
  }
  return { text: body, pages: totalPages };
}

/** Cap the source so a 147-page scan cannot blow up latency or cost. */
export function trimSource(text: string, limit = 14000): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n\n[Source truncated for length]`;
}
