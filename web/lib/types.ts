export type Segment = {
  id: number;
  heading: string;
  text: string;
  audioUrl?: string;
  durationSec?: number;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type EpisodeStatus =
  | "queued"
  | "extracting"
  | "scripting"
  | "rendering"
  | "ready"
  | "error";

export type Episode = {
  id: string;
  title: string;
  topic: string;
  sourceName: string;
  language: string;
  status: EpisodeStatus;
  stage: string;
  error?: string;
  segments: Segment[];
  quiz: QuizQuestion[];
  createdAt: string;
  isDemo: boolean;
  model?: string;
  voice?: string;
};

export type Draft = {
  title: string;
  topic: string;
  language: string;
  segments: Omit<Segment, "audioUrl" | "durationSec">[];
  quiz: QuizQuestion[];
};
