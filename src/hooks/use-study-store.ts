import { useCallback, useEffect, useState } from "react";
import type { Day, SubjectId } from "@/lib/study-logic";
import type { Question } from "@/lib/question-bank";

export type Session = {
  kind: "daily" | "topic";
  subject: SubjectId;
  topicId?: string;
  dateKey?: string;
  questions: Question[];
  index: number;
  strikes: number;
  correct: number;
  firstTry: number;
};

export type StudyState = {
  user: { name: string; email: string } | null;
  grade: number | null;
  days: Day[];
  onboarded: boolean;
  daily: { dateKey: string; done: SubjectId[] };
  dailySession: Session | null;
  topicSessions: Record<string, Session>;
  topicsDone: string[];
  xp: number;
  streak: number;
  lastStreakDate: string | null;
};

const KEY = "ares-v1";

const initial: StudyState = {
  user: null,
  grade: null,
  days: [],
  onboarded: false,
  daily: { dateKey: "", done: [] },
  dailySession: null,
  topicSessions: {},
  topicsDone: [],
  xp: 0,
  streak: 0,
  lastStreakDate: null,
};

/** Frontend-only persistence: keeps progress on this device until the backend exists. */
export function useStudyStore() {
  const [state, setState] = useState<StudyState>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as Partial<StudyState>) });
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const update = useCallback((fn: (s: StudyState) => StudyState) => setState(fn), []);
  return { state, update, ready };
}
