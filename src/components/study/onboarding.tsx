import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { QUESTIONS_PER_SUBJECT_DAILY, type Day } from "@/lib/study-logic";
import { DayPicker, Dots, GradeOptions, Logo, Mascot, StepShell } from "./ui-bits";

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

const nameFromEmail = (email: string) => {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean);
  return words.length ? words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ") : "Student";
};

const fieldClass =
  "h-12 w-full rounded-2xl border-2 border-border bg-card px-4 text-base font-bold text-foreground outline-none transition-colors placeholder:font-semibold placeholder:text-muted-foreground focus:border-primary";

export function AuthScreen({ onSignIn }: { onSignIn: (user: { name: string; email: string }) => void }) {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const google = () => {
    setLoading("google");
    window.setTimeout(() => onSignIn({ name: "Joshua Jabari", email: "joshua.jabari@gmail.com" }), 900);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setError("");
    setLoading("email");
    window.setTimeout(() => onSignIn({ name: nameFromEmail(clean), email: clean }), 700);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-8">
      <Logo />
      <div className="flex flex-1 flex-col justify-center py-8">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-3xl font-black leading-tight">
          Sign up and unlock your potential
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-10">
          <Button size="lg" variant="outline" className="w-full" onClick={google} disabled={loading !== null}>
            {loading === "google" ? (
              <Dots />
            ) : (
              <>
                <GoogleG />
                Continue with Google
              </>
            )}
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <span className="h-0.5 flex-1 rounded-full bg-border" />
            or
            <span className="h-0.5 flex-1 rounded-full bg-border" />
          </div>

          <form onSubmit={submit} className="grid gap-3" noValidate>
            <input type="email" autoComplete="email" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
            <input type="password" autoComplete="current-password" placeholder="Password" aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} />
            {error && <p className="text-sm font-bold text-wrong" role="alert">{error}</p>}
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading !== null}>
              {loading === "email" ? <Dots /> : "Continue"}
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

export function GradeScreen({ value, onBack, onNext }: { value: number | null; onBack: () => void; onNext: (g: number) => void }) {
  const [grade, setGrade] = useState<number | null>(value);
  return (
    <StepShell progress={1 / 2} onBack={onBack} footer={<Button size="lg" className="w-full" disabled={grade === null} onClick={() => grade !== null && onNext(grade)}>Continue</Button>}>
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
    <StepShell progress={1} onBack={onBack} footer={<Button size="lg" className="w-full" disabled={days.length === 0} onClick={() => onNext(days)}>Let's go</Button>}>
      <Mascot>Which days can you study each week?</Mascot>
      <div className="mt-8">
        <DayPicker value={days} onChange={setDays} />
      </div>
      <div className="mt-6 rounded-2xl border-2 bg-card p-4">
        <p className="text-3xl font-black text-primary">{days.length} <span className="text-base text-foreground">day{days.length === 1 ? "" : "s"} a week</span></p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {QUESTIONS_PER_SUBJECT_DAILY} Maths questions each study day
        </p>
      </div>
    </StepShell>
  );
}

export function RoutineEditScreen({ value, onBack, onConfirm }: { value: Day[]; onBack: () => void; onConfirm: (d: Day[]) => void }) {
  const [days, setDays] = useState<Day[]>(value);
  return (
    <StepShell title="Weekly routine" onBack={onBack} footer={<Button size="lg" className="w-full" disabled={days.length === 0} onClick={() => onConfirm(days)}>Confirm</Button>}>
      <Mascot>Which days can you study each week?</Mascot>
      <div className="mt-8">
        <DayPicker value={days} onChange={setDays} />
      </div>
    </StepShell>
  );
}
