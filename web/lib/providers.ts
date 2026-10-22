import type { Draft, QuizQuestion } from "./types";
import { loadRootEnv } from "./env";

loadRootEnv();

const OPENROUTER_BASE =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const DRAFT_MODELS = [
  process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4.1-flash",
  "deepseek/deepseek-v4-flash",
  "deepseek/deepseek-v4.1-flash-1017",
];

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TTS_MODELS = [
  process.env.TTS_MODEL ?? "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
];
export const TTS_VOICE = process.env.TTS_VOICE ?? "Kore";

function requireKey(name: "OPENROUTER_API_KEY" | "GEMINI_API_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing. Add it to .env and restart the server.`);
  }
  return value;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  label: string,
  attempts = 3,
): Promise<Response> {
  let lastError = "";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    const body = await res.text();
    lastError = `${label} HTTP ${res.status}: ${body.slice(0, 300)}`;
    // A bad key will not fix itself.
    if (res.status === 401 || res.status === 403) break;
    if (attempt < attempts) {
      await new Promise((r) => setTimeout(r, 700 * attempt));
    }
  }
  throw new Error(lastError);
}

/* ------------------------------------------------------------------ */
/* DeepSeek (text only) — episode script and quiz                      */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are the host of a short, funny audio show about a university topic. The listener is a tired student with twelve tabs open. Your job is to make them grin, then make them curious about the material.

The uploaded material defines the syllabus: every main idea in it must appear in the episode. But this is NOT a summary, NOT a lecture, and NOT a class. It is a show about the topic.

VOICE AND TONE
- Talk like a smart friend who finds this topic genuinely ridiculous and genuinely cool.
- Address the listener as "tú". Short sentences. Asides. Rhetorical questions.
- At least ONE real joke or playful bit: an absurd but accurate analogy, mock-dramatic stakes, playful exaggeration, a self-aware comment about how weird the subject is.
- At least one callback: plant something in the hook and pay it off at the end.
- Humour never mocks the listener and never replaces substance. No memes, no pun avalanches, no "jaja", no forced cringe.
- Plain spoken text only: no emojis, no markdown, no stage directions, no "(risas)". The script goes straight into a text-to-speech engine.
- Banned openings and phrases: "en esta lección", "hoy aprenderemos", "vamos a estudiar", "objetivos", "bienvenidos". If a line sounds like a classroom, rewrite it.

NON-NEGOTIABLE RULES, IN ORDER
1. COVERAGE. Cover the source's 3-5 main ideas. Never invent or contradict a definition, result, or claim from the source.
2. HOOK. Segment 1 drops the listener mid-scene: a concrete question, an absurd image, or a tiny story. No greetings, no agenda, no "hoy vamos a ver".
3. FUN. A joke that lands, an analogy they will repeat to a friend, and energy you can hear. If the episode could be read aloud by a bored lecturer, it failed.
4. ENRICHMENT. At least one piece of context the source does not contain: history, a real application, a counterexample, a consequence. It must be TRUE and well established. Never attribute added facts to the source or the lecturer. Never invent quotes, dates, studies, or numbers. If unsure, use safer context.
5. CLOSE. Segment 4 recaps, calls back to the opening joke, and points the student back to the material concretely (e.g. "vuelve a la diapositiva 2 y lee la Definición 2.1 con otra cara").
6. LENGTH. About 3 minutes when spoken. Segment 1 is the hook: 45-65 words so it can start playing fast. Segments 2-4 are 70-95 words each.

Language: write in the requested language. Spanish and Galician material is normal; keep technical terms accurate.`;

function draftPrompt(source: string, language: string): string {
  return `LANGUAGE: ${language}

Return JSON only, exactly this shape:
{
  "topic": "short topic label",
  "title": "episode title, catchy, max 60 chars",
  "language": "${language}",
  "segments": [
    { "id": 1, "heading": "short label", "text": "spoken script, 45-65 words for the hook" }
  ],
  "quiz": [
    { "question": "...", "options": ["...", "...", "..."], "answerIndex": 0, "explanation": "one sentence" }
  ]
}

Exactly 4 segments and exactly 3 quiz questions. Segment 1 is the hook: open mid-scene and plant something to call back later. Segment 4 recaps, lands the callback, and points back to the source. Quiz questions must be answerable from the episode and one of them should be about the joke or analogy, not just a definition.

SOURCE MATERIAL:
${source}`;
}

function parseJsonObject(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateDraft(raw: unknown): Draft {
  if (!isRecord(raw)) throw new Error("model returned a non-object");
  const title = String(raw.title ?? "").trim();
  const topic = String(raw.topic ?? "").trim();
  const language = String(raw.language ?? "es").trim();
  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  const quizRaw = Array.isArray(raw.quiz) ? raw.quiz : [];

  const segments: Draft["segments"] = segmentsRaw
    .filter(isRecord)
    .map((s, index) => ({
      id: index + 1,
      heading: String(s.heading ?? `Parte ${index + 1}`).trim(),
      text: String(s.text ?? "").trim(),
    }))
    .filter((s) => s.text.length > 40);

  const quiz: QuizQuestion[] = quizRaw
    .filter(isRecord)
    .map((q) => {
      const options = Array.isArray(q.options)
        ? q.options.map((o) => String(o).trim()).filter(Boolean)
        : [];
      const answerIndex = Number(q.answerIndex ?? 0);
      return {
        question: String(q.question ?? "").trim(),
        options,
        answerIndex:
          Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length
            ? answerIndex
            : 0,
        explanation: String(q.explanation ?? "").trim(),
      };
    })
    .filter((q) => q.question.length > 0 && q.options.length >= 2);

  if (segments.length < 3) {
    throw new Error("the script came back too short to be an episode");
  }
  if (!title) throw new Error("the script came back without a title");

  return { title, topic: topic || title, language, segments, quiz: quiz.slice(0, 3) };
}

export async function draftEpisode(
  source: string,
  language = "es",
): Promise<{ draft: Draft; model: string }> {
  const key = requireKey("OPENROUTER_API_KEY");
  const failures: string[] = [];

  for (const model of DRAFT_MODELS) {
    try {
      const res = await fetchWithRetry(
        `${OPENROUTER_BASE}/chat/completions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://github.com/carlosrodriguezperez/study-vibes",
            "X-Title": "Study Vibes",
          },
          body: JSON.stringify({
            model,
            temperature: 0.85,
            max_tokens: 3000,
            // Reasoning tokens were eating the budget and truncating the JSON
            // (finish_reason: "length"). Script writing does not need them.
            reasoning: { enabled: false },
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: draftPrompt(source, language) },
            ],
          }),
          signal: AbortSignal.timeout(90_000),
        },
        `OpenRouter ${model}`,
      );
      const json = (await res.json()) as {
        model?: string;
        choices?: { message?: { content?: string }; finish_reason?: string }[];
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenRouter returned an empty message");
      return { draft: validateDraft(parseJsonObject(content)), model: json.model ?? model };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${model}: ${message}`);
      console.error(`[draft] ${model} failed: ${message}`);
    }
  }

  throw new Error(`Could not write the script. ${failures.join(" | ")}`);
}

/* ------------------------------------------------------------------ */
/* Gemini TTS (audio only)                                             */
/* ------------------------------------------------------------------ */

function wavDurationSeconds(buf: Buffer): number {
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF") return 0;
  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;
  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (chunkId === "fmt " && size >= 12) {
      byteRate = buf.readUInt32LE(offset + 16);
    } else if (chunkId === "data") {
      dataSize = Math.min(size, buf.length - offset - 8);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  return byteRate > 0 ? dataSize / byteRate : 0;
}

/**
 * Remove anything a TTS engine would read out loud instead of performing:
 * emojis, markdown, and bracketed stage directions.
 */
function forSpeech(text: string): string {
  return text
    .replace(/[*_`#>]/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\((?:risas|ríe|jaja|risa)[^)]*\)/gi, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function wrapPcmAsWav(pcm: Buffer, sampleRate: number): Buffer {
  const channels = 1;
  const bits = 16;
  const byteRate = sampleRate * channels * (bits / 8);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * (bits / 8), 32);
  header.writeUInt16LE(bits, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export async function synthesize(
  text: string,
): Promise<{ wav: Buffer; durationSec: number }> {
  const key = requireKey("GEMINI_API_KEY");
  const spoken = forSpeech(text);
  let lastError: unknown = null;

  for (const model of TTS_MODELS) {
    try {
      const res = await fetchWithRetry(
        `${GEMINI_BASE}/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ parts: [{ text: spoken }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } },
              },
            },
          }),
          signal: AbortSignal.timeout(120_000),
        },
        `Gemini TTS ${model}`,
      );

      const json = (await res.json()) as {
        candidates?: {
          content?: {
            parts?: { inlineData?: { data?: string; mimeType?: string } }[];
          };
        }[];
      };
      const inline = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
        ?.inlineData;
      if (!inline?.data) throw new Error("Gemini TTS returned no audio");

      const bytes = Buffer.from(inline.data, "base64");
      const mime = inline.mimeType ?? "";
      if (mime.includes("wav")) {
        return { wav: bytes, durationSec: wavDurationSeconds(bytes) };
      }
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
      const wav = wrapPcmAsWav(bytes, rate);
      return { wav, durationSec: wavDurationSeconds(wav) };
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : "unknown error";
  throw new Error(`Could not synthesize audio: ${message}`);
}
