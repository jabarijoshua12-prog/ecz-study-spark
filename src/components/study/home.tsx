import { motion } from "motion/react";
import { Check, Flame, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUBJECT_NAMES, buildRoutine, dayKey, nextStudyDay, topicsForDay, type SubjectId } from "@/lib/study-logic";
import { topicsOf } from "@/lib/question-bank";
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
  const { subjects, done, session, current, allDone } = todaysPlan(state);
  const firstName = state.user?.name.split(" ")[0] ?? "there";

  const label = allDone ? "Done for today" : session ? "Continue" : current ? `Start ${SUBJECT_NAMES[current]}` : "Start";

  return (
    <div className="h-[calc(100dvh-10rem)] overflow-hidden">
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

      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-3xl font-black">
        Welcome, {firstName}
      </motion.h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {subjects.map((s, i) => {
          const Icon = SUBJECT_ICON[s];
          const isDone = done.includes(s);
          const isCurrent = current === s;
          const status = isDone ? "Complete" : isCurrent ? (session ? "In progress" : "Up next") : "Locked";
          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 22 }}
              className={cn(
                "flex aspect-[4/5] flex-col justify-between rounded-3xl border-2 p-4",
                isDone
                  ? "border-primary bg-primary/10 shadow-[0_5px_0_var(--primary-edge)]"
                  : isCurrent
                    ? "border-primary/70 bg-card shadow-[0_5px_0_var(--primary-edge)]"
                    : "bg-card shadow-[0_5px_0_var(--border)]",
              )}
            >
              <span
                className={cn(
                  "grid size-16 place-items-center rounded-2xl",
                  isDone || isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-8" strokeWidth={3} /> : <Icon className="size-8" strokeWidth={2.4} />}
              </span>
              <div>
                <p className="text-lg font-black leading-tight">{SUBJECT_NAMES[s]}</p>
                <p className={cn("mt-1 text-xs font-black uppercase tracking-wider", isDone || isCurrent ? "text-primary" : "text-muted-foreground")}>{status}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

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
