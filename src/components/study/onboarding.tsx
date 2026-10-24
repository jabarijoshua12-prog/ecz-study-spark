import { useState } from "react";
import { motion } from "motion/react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBJECTS_PER_DAY, QUESTIONS_PER_SUBJECT_DAILY, buildRoutine, type Day } from "@/lib/study-logic";
import { DayPicker, Dots, GradeOptions, Logo, Mascot, RoutineList, StepShell } from "./ui-bits";

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function AuthScreen({ onSignIn }: { onSignIn: (user: { name: string; email: string }) => void }) {
  const [loading, setLoading] = useState(false);
  const signIn = () => {
    setLoading(true);
    window.setTimeout(() => onSignIn({ name: "Joshua Jabari", email: "joshua.jabari@gmail.com" }), 900);
  };
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-8">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <motion.div
          initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 13 }}
          className="glow-pulse grid size-28 place-items-center rounded-[2rem] bg-primary text-primary-foreground"
        >
          <GraduationCap className="size-14" strokeWidth={2.2} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-10 text-3xl font-black leading-tight">
          Study smarter with a plan built around you.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-3 text-sm font-semibold text-muted-foreground">
          Two subjects a day. Fifteen questions each. Built from ECZ past papers.
        </motion.p>
      </div>
      <Button size="lg" className="w-full" onClick={signIn} disabled={loading}>
        {loading ? (
          <Dots />
        ) : (
          <>
            <span className="grid size-6 place-items-center rounded-full bg-foreground">
              <GoogleG />
            </span>
            Continue with Google
          </>
        )}
      </Button>
      <p className="mt-4 text-center text-xs font-semibold text-muted-foreground">New or returning — one tap signs you up or logs you in.</p>
    </main>
  );
}

export function GradeScreen({ value, onBack, onNext }: { value: number | null; onBack: () => void; onNext: (g: number) => void }) {
  const [grade, setGrade] = useState<number | null>(value);
  return (
    <StepShell progress={1 / 3} onBack={onBack} footer={<Button size="lg" className="w-full" disabled={grade === null} onClick={() => grade !== null && onNext(grade)}>Continue</Button>}>
      <Mascot>Which grade are you in?</Mascot>
      <div className="mt-8">
        <GradeOptions value={grade} onChange={setGrade} />
      </div>
    </StepShell>
  );
}

export function DaysScreen({ value, onBack, onNext }: { value: Day[]; onBack: () => void; onNext: (d: Day[]) => void }) {
  const [days, setDays] = useState<Day[]>(value);
  return (
    <StepShell progress={2 / 3} onBack={onBack} footer={<Button size="lg" className="w-full" disabled={days.length === 0} onClick={() => onNext(days)}>Continue</Button>}>
      <Mascot>Which days can you study each week?</Mascot>
      <div className="mt-8">
        <DayPicker value={days} onChange={setDays} />
      </div>
      <div className="mt-6 rounded-2xl border-2 bg-card p-4">
        <p className="text-3xl font-black text-primary">{days.length} <span className="text-base text-foreground">day{days.length === 1 ? "" : "s"} a week</span></p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {SUBJECTS_PER_DAY} subjects per study day · {QUESTIONS_PER_SUBJECT_DAILY} questions each
        </p>
      </div>
    </StepShell>
  );
}

export function RoutineScreen({ days, onBack, onDone }: { days: Day[]; onBack: () => void; onDone: () => void }) {
  return (
    <StepShell progress={1} onBack={onBack} footer={<Button size="lg" className="w-full" onClick={onDone}>Let's go</Button>}>
      <Mascot>Here's your weekly routine!</Mascot>
      <p className="mt-6 text-sm font-semibold text-muted-foreground">Every core subject is shared out evenly across your study days.</p>
      <div className="mt-4">
        <RoutineList routine={buildRoutine(days)} />
      </div>
    </StepShell>
  );
}
