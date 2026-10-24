import { motion } from "motion/react";
import { Check, Flame, Lock, Star, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DAY_NAMES,
  QUESTIONS_PER_SUBJECT_DAILY,
  QUESTIONS_PER_TOPIC_DAILY,
  SUBJECT_NAMES,
  buildRoutine,
  dayKey,
  nextStudyDay,
  topicsForDay,
  type SubjectId,
} from "@/lib/study-logic";
import { topicName, topicsOf } from "@/lib/question-bank";
import type { StudyState } from "@/hooks/use-study-store";
import { Logo, SUBJECT_ICON } from "./ui-bits";

export function todaysPlan(state: StudyState, now = new Date()) {
  const today = dayKey(now);
  const next = nextStudyDay(state.days, now);
  const subjects = next ? (buildRoutine(state.days)[next.day] ?? []) : [];
  const done = state.daily.dateKey === today ? state.daily.done : [];
  const session = state.dailySession?.dateKey === today ? state.dailySession : null;
  const current = session?.subject ?? subjects.find((s) => !done.includes(s)) ?? null;
  const topics = (s: SubjectId) => topicsForDay(topicsOf(s).map((t) => t.id), `${today}-${s}`);
  return { today, next, subjects, done, session, current, topics, allDone: subjects.length > 0 && subjects.every((s) => done.includes(s)) };
}

export function HomeScreen({ state, onStart, onPractice }: { state: StudyState; onStart: () => void; onPractice: () => void }) {
  const plan = todaysPlan(state);
  const { next, subjects, done, session, current, allDone } = plan;

  const answered = (s: SubjectId, t: string) => {
    if (done.includes(s)) return QUESTIONS_PER_TOPIC_DAILY;
    if (session?.subject === s) return session.questions.slice(0, session.index).filter((q) => q.topicId === t).length;
    return 0;
  };

  const label = allDone
    ? "Done for today"
    : session
      ? `Continue · ${session.index}/${session.questions.length}`
      : current
        ? `Start ${SUBJECT_NAMES[current]}`
        : "Start";

  return (
    <div className="pb-44">
      <header className="flex items-center justify-between">
        <Logo small />
        <div className="flex gap-2">
          <span className="flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 text-sm font-black" aria-label={`${state.streak} day streak`}>
            <Flame className="size-4 text-primary" strokeWidth={2.6} />
            {state.streak}
          </span>
          <span className="flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 text-sm font-black" aria-label={`${state.xp} XP`}>
            <Zap className="size-4 text-primary" strokeWidth={2.6} />
            {state.xp}
          </span>
        </div>
      </header>

      <section className="mt-7">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{next?.offset === 0 ? "Today" : "Rest day · up next"}</p>
        <h1 className="mt-1 text-2xl font-black">{next ? `${DAY_NAMES[next.day]}'s path` : "Your path"}</h1>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {subjects.length} subjects · {QUESTIONS_PER_SUBJECT_DAILY} questions each
        </p>
      </section>

      {allDone && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-primary bg-primary/10 p-4">
          <Trophy className="size-10 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-black">You're done for today!</p>
            <p className="text-xs font-semibold text-muted-foreground">Want more? Practise any topic.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={onPractice}>Practise</Button>
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        {subjects.map((s, col) => {
          const Icon = SUBJECT_ICON[s];
          const isDone = done.includes(s);
          const isCurrent = current === s;
          const topics = plan.topics(s);
          return (
            <motion.section key={s} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * col }} className="flex flex-col items-center">
              <div className={cn("w-full rounded-2xl border-2 p-3", isDone ? "border-primary bg-primary/10" : isCurrent ? "border-primary/60 bg-card" : "bg-card")}>
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", isDone || isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Icon className="size-5" strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject {col + 1}</p>
                    <p className="truncate text-sm font-black">{SUBJECT_NAMES[s]}</p>
                  </div>
                </div>
                <p className={cn("mt-2 text-[11px] font-black uppercase tracking-wider", isDone || isCurrent ? "text-primary" : "text-muted-foreground")}>
                  {isDone ? "Complete" : isCurrent ? (session ? "In progress" : "Up next") : "Locked"}
                </p>
              </div>

              <div className="relative mt-5 flex w-full flex-col items-center gap-9 pb-2">
                <span aria-hidden className={cn("absolute top-8 bottom-12 left-1/2 w-1.5 -translate-x-1/2 rounded-full", isDone ? "bg-primary" : "bg-border")} />
                {topics.map((t, i) => {
                  const count = answered(s, t);
                  const nodeDone = count >= QUESTIONS_PER_TOPIC_DAILY;
                  const firstOpen = isCurrent && !nodeDone && topics.findIndex((x) => answered(s, x) < QUESTIONS_PER_TOPIC_DAILY) === i;
                  const offset = [-14, 14, -14][i] ?? 0;
                  return (
                    <div key={t} className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.15 + 0.08 * i + 0.1 * col }}
                        className={cn(
                          "grid size-16 place-items-center rounded-full border-2",
                          nodeDone
                            ? "border-primary bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-edge)]"
                            : firstOpen
                              ? "node-pulse border-primary bg-muted text-primary"
                              : "border-border bg-muted text-muted-foreground shadow-[0_5px_0_var(--border)]",
                        )}
                        aria-label={`${topicName(t)}: ${nodeDone ? "done" : "locked"}`}
                      >
                        {nodeDone ? <Check className="size-7" strokeWidth={3.2} /> : isCurrent ? <Star className="size-6" strokeWidth={2.6} /> : <Lock className="size-5" strokeWidth={2.6} />}
                      </motion.span>
                      <span className="mt-2.5 max-w-[8.5rem] text-center text-[11px] font-extrabold leading-tight text-muted-foreground">{topicName(t)}</span>
                      {count > 0 && !nodeDone && <span className="mt-0.5 text-[10px] font-black text-primary">{count}/{QUESTIONS_PER_TOPIC_DAILY}</span>}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-[4.75rem] z-30 bg-linear-to-t from-background via-background to-transparent pt-8">
        <div className="mx-auto max-w-md px-5 pb-3">
          <Button size="lg" className="w-full" disabled={allDone || subjects.length === 0} onClick={onStart}>
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
