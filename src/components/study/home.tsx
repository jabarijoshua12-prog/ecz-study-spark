import { Fragment } from "react";
import { motion } from "motion/react";
import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildRoutine, dayKey, nextStudyDay, topicsForDay, type SubjectId } from "@/lib/study-logic";
import { topicName, topicsForGrade } from "@/lib/question-bank";
import type { StudyState } from "@/hooks/use-study-store";
import { Logo } from "./ui-bits";

export function todaysPlan(state: StudyState, now = new Date()) {
  const today = dayKey(now);
  const next = nextStudyDay(state.days, now);
  const subjects = next ? (buildRoutine(state.days)[next.day] ?? []) : [];
  const done = state.daily.dateKey === today ? state.daily.done : [];
  const session = state.dailySession?.dateKey === today ? state.dailySession : null;
  const current = session?.subject ?? subjects.find((s) => !done.includes(s)) ?? null;
  const topics = (s: SubjectId) => topicsForDay(topicsForGrade(s, state.grade).map((t) => t.id), `${today}-${s}`);
  return { today, next, subjects, done, session, current, topics, allDone: subjects.length > 0 && subjects.every((s) => done.includes(s)) };
}

export function HomeScreen({ state, onStart, onPractice }: { state: StudyState; onStart: () => void; onPractice: () => void }) {
  const { subjects, session, allDone, topics } = todaysPlan(state);
  const subject = subjects[0];
  const upNext = session ? [...new Set(session.questions.map((q) => q.topicId))] : subject ? topics(subject) : [];
  const firstName = state.user?.name.split(" ")[0] ?? "there";
  const label = allDone ? "Done for today" : session ? "Continue" : "Start";

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col overflow-hidden">
      <header className="flex items-center justify-between">
        <Logo small />
        <span className="flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 text-sm font-black" aria-label={`${state.streak} day streak`}>
          <Flame className="size-4 text-primary" strokeWidth={2.6} />
          {state.streak}
        </span>
      </header>

      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-3xl font-black">
        Welcome, {firstName}
      </motion.h1>

      <div className="flex flex-1 items-center py-6">
        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className={cn(
            "w-full rounded-3xl border-2 bg-surface px-5 pb-6 pt-5 shadow-[0_6px_0_var(--border)]",
            allDone && "border-primary shadow-[0_6px_0_var(--primary-edge)]",
          )}
          aria-label="Up next"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-foreground">{allDone ? "Complete" : "Up next"}</h2>
            {session && !allDone && <span className="text-xs font-black uppercase tracking-wider text-primary">In progress</span>}
          </div>

          {upNext.length === 0 ? (
            <p className="mt-6 text-center text-sm font-bold text-muted-foreground">No study day set yet.</p>
          ) : (
            <div className="mt-5 flex flex-col items-center gap-3">
              {upNext.map((id, i) => (
                <Fragment key={id}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + 0.08 * i }}
                    className={cn(
                      "flex w-full max-w-72 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-center text-base font-black",
                      allDone ? "border-primary bg-primary/10 text-primary" : "bg-muted",
                    )}
                  >
                    {allDone && <Check className="size-4" strokeWidth={3} />}
                    {topicName(id)}
                  </motion.div>
                </Fragment>
              ))}
            </div>
          )}

          {allDone && (
            <div className="mt-5 text-center">
              <Button size="sm" variant="secondary" onClick={onPractice}>Practise a topic</Button>
            </div>
          )}
        </motion.section>
      </div>

      <div className="fixed inset-x-0 bottom-[4.75rem] z-30 bg-linear-to-t from-background via-background to-transparent pt-8">
        <div className="mx-auto max-w-md px-5 pb-3">
          <Button size="lg" className="w-full" disabled={allDone || !subject} onClick={onStart}>
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
