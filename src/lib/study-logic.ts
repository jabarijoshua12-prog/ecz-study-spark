// Pure study rules: quotas, weekly routine, strikes, dates and seeded randomness.

export const SUBJECT_IDS = ["math", "biology", "physics", "chemistry"] as const;
export type SubjectId = (typeof SUBJECT_IDS)[number];
export const SUBJECT_NAMES: Record<SubjectId, string> = {
  math: "Mathematics",
  biology: "Biology",
  physics: "Physics",
  chemistry: "Chemistry",
};

/** Subjects the app currently teaches. Others stay in the bank for later. */
export const ACTIVE_SUBJECTS: readonly SubjectId[] = ["math"];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];
export const DAY_NAMES: Record<Day, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export const SUBJECTS_PER_DAY = 1;
export const TOPICS_PER_SUBJECT_DAILY = 3;
export const QUESTIONS_PER_TOPIC_DAILY = 5;
export const QUESTIONS_PER_SUBJECT_DAILY = TOPICS_PER_SUBJECT_DAILY * QUESTIONS_PER_TOPIC_DAILY;
export const QUESTIONS_PER_TOPIC_SESSION = 10;
export const MAX_STRIKES = 2;
export const XP_PER_CORRECT = 10;

export type Routine = Partial<Record<Day, SubjectId[]>>;

/** Cycles through the subjects so every subject appears as equally often as possible. */
export function buildRoutine(days: readonly Day[], subjects: readonly SubjectId[] = ACTIVE_SUBJECTS): Routine {
  const routine: Routine = {};
  const perDay = Math.min(SUBJECTS_PER_DAY, subjects.length);
  DAYS.filter((d) => days.includes(d)).forEach((day, i) => {
    routine[day] = Array.from({ length: perDay }, (_, k) => subjects[(i * perDay + k) % subjects.length]!);
  });
  return routine;
}

export function outcomeAfterWrong(strikes: number): { strikes: number; outcome: "retry" | "reveal" } {
  const next = strikes + 1;
  return { strikes: next, outcome: next >= MAX_STRIKES ? "reveal" : "retry" };
}

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: Rng, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;
export const pick = <T,>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)]!;

export function shuffle<T>(r: Rng, arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Each topic repeated perTopic times, then randomly interleaved. */
export function interleave(topicIds: readonly string[], perTopic: number, r: Rng): string[] {
  return shuffle(r, topicIds.flatMap((t) => Array.from({ length: perTopic }, () => t)));
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function weekday(d: Date): Day {
  return DAYS[(d.getDay() + 6) % 7]!;
}

/** Today if it is a study day, otherwise the next one. */
export function nextStudyDay(days: readonly Day[], from: Date): { day: Day; offset: number } | null {
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const w = weekday(d);
    if (days.includes(w)) return { day: w, offset: i };
  }
  return null;
}

/** Deterministic set of consecutive topics for a given date. */
export function topicsForDay(topicIds: readonly string[], key: string, count = TOPICS_PER_SUBJECT_DAILY): string[] {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const start = h % topicIds.length;
  return Array.from({ length: Math.min(count, topicIds.length) }, (_, i) => topicIds[(start + i) % topicIds.length]!);
}

export function nextStreak(streak: number, last: string | null, today: string): number {
  if (last === today) return streak;
  const y = new Date(`${today}T12:00:00`);
  y.setDate(y.getDate() - 1);
  return last === dayKey(y) ? streak + 1 : 1;
}
