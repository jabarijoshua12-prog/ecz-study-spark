import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { CheckCircle2, Heart, Lightbulb, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MAX_STRIKES, XP_PER_CORRECT, outcomeAfterWrong } from "@/lib/study-logic";
import { topicName } from "@/lib/question-bank";
import type { Session } from "@/hooks/use-study-store";
import { Dots, ProgressBar } from "./ui-bits";

type Phase = "idle" | "checking" | "correct" | "wrong" | "reveal";
type OptionLook = "idle" | "selected" | "correct" | "wrong" | "eliminated";

const OPTION_STYLE: Record<OptionLook, string> = {
  idle: "border-border bg-card shadow-[0_4px_0_var(--border)] hover:bg-accent",
  selected: "border-primary bg-primary/10 text-primary shadow-[0_4px_0_var(--primary-edge)]",
  correct: "border-primary bg-success-soft text-primary shadow-[0_4px_0_var(--primary-edge)]",
  wrong: "border-wrong bg-wrong-soft text-wrong shadow-[0_4px_0_var(--wrong-edge)]",
  eliminated: "border-border bg-card opacity-35 line-through shadow-none",
};

export function QuizScreen({ session, onChange, onExit, onFinish }: { session: Session; onChange: (s: Session) => void; onExit: () => void; onFinish: (s: Session) => void }) {
  const q = session.questions[session.index];
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [help, setHelp] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    setSelected(null);
    setPhase("idle");
    setEliminated([]);
    setHelp(false);
  }, [q?.id]);

  const check = () => {
    if (selected === null || phase !== "idle") return;
    setPhase("checking");
    timer.current = window.setTimeout(() => {
      if (selected === q.answer) {
        setPhase("correct");
        return;
      }
      const { strikes, outcome } = outcomeAfterWrong(session.strikes);
      onChange({ ...session, strikes });
      if (scope.current) animate(scope.current, { x: [0, -12, 12, -8, 8, -4, 0] }, { duration: 0.45 });
      setPhase(outcome === "reveal" ? "reveal" : "wrong");
    }, 750);
  };

  const tryAgain = () => {
    if (selected !== null) setEliminated((e) => [...e, selected]);
    setSelected(null);
    setHelp(false);
    setPhase("idle");
  };

  const advance = () => {
    const gotIt = phase === "correct";
    const next: Session = {
      ...session,
      index: session.index + 1,
      strikes: 0,
      correct: session.correct + (gotIt ? 1 : 0),
      firstTry: session.firstTry + (gotIt && session.strikes === 0 ? 1 : 0),
    };
    if (next.index >= next.questions.length) onFinish(next);
    else onChange(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (leaving || (e.target as HTMLElement | null)?.closest("button, input")) return;
      if (phase === "idle" && ["1", "2", "3", "4"].includes(e.key)) {
        const i = Number(e.key) - 1;
        if (!eliminated.includes(i)) setSelected(i);
      }
      if (e.key === "Enter") {
        if (phase === "idle") check();
        else if (phase === "correct" || phase === "reveal") advance();
        else if (phase === "wrong") tryAgain();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!q) return null;

  const look = (i: number): OptionLook => {
    if (phase === "correct" && i === selected) return "correct";
    if (phase === "reveal" && i === q.answer) return "correct";
    if ((phase === "wrong" || phase === "reveal") && i === selected) return "wrong";
    if (eliminated.includes(i)) return "eliminated";
    if (i === selected) return "selected";
    return "idle";
  };

  const triesLeft = MAX_STRIKES - session.strikes;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <header className="flex items-center gap-3 px-5 pt-5">
        <Button variant="ghost" size="icon" aria-label="Leave session" onClick={() => setLeaving(true)} className="shrink-0 [&_svg]:size-6">
          <X />
        </Button>
        <ProgressBar value={session.index / session.questions.length} />
        <span className="flex shrink-0 items-center gap-1 text-base font-black text-wrong" aria-label={`${triesLeft} tries left`}>
          <Heart className="size-5 fill-current" />
          {triesLeft}
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} className="flex-1 px-5 pb-72 pt-7">
          <div ref={scope}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-black uppercase tracking-wider text-primary">{topicName(q.topicId)}</span>
              <span className="text-[11px] font-bold text-muted-foreground">Variant of {q.source}</span>
            </div>
            <p className="mt-2 text-xs font-black text-muted-foreground">
              Question {session.index + 1} of {session.questions.length}
            </p>
            <h1 className="mt-3 whitespace-pre-line text-xl font-extrabold leading-snug">{q.prompt}</h1>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answer options">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  role="radio"
                  aria-checked={selected === i}
                  disabled={phase !== "idle" || eliminated.includes(i)}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-base font-bold transition-all duration-150 active:translate-y-1 active:shadow-none disabled:cursor-default",
                    OPTION_STYLE[look(i)],
                  )}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-current/30 text-xs font-black opacity-80">{i + 1}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.main>
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-40">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "idle" || phase === "checking" ? (
            <motion.div key="check" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.18 }} className="border-t-2 bg-background">
              <div className="mx-auto max-w-xl px-5 py-4">
                <Button size="lg" className="w-full" disabled={selected === null} onClick={check}>
                  {phase === "checking" ? <Dots /> : "Check"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={phase}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className={cn("rounded-t-3xl", phase === "correct" ? "bg-success-soft" : "bg-wrong-soft")}
            >
              <div className="mx-auto max-w-xl px-5 pb-5 pt-5">
                {phase === "correct" && (
                  <>
                    <div className="flex items-center gap-3 text-primary">
                      <CheckCircle2 className="size-9" strokeWidth={2.6} />
                      <div>
                        <p className="text-xl font-black">Nicely done!</p>
                        <p className="text-sm font-bold opacity-80">+{XP_PER_CORRECT} XP</p>
                      </div>
                    </div>
                    <Button size="lg" className="mt-4 w-full" onClick={advance}>Continue</Button>
                  </>
                )}

                {phase === "wrong" && (
                  <>
                    <div className="flex items-center gap-3 text-wrong">
                      <XCircle className="size-9" strokeWidth={2.6} />
                      <div>
                        <p className="text-xl font-black">Not quite</p>
                        <p className="text-sm font-bold opacity-90">You have one more try.</p>
                      </div>
                    </div>
                    <AnimatePresence initial={false}>
                      {help && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <div className="mt-4 flex gap-3 rounded-2xl border-2 border-wrong/30 bg-background/50 p-3.5 text-sm font-semibold">
                            <Lightbulb className="size-5 shrink-0 text-primary" />
                            <span>{q.hint}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button size="lg" variant="secondary" onClick={() => setHelp((h) => !h)}>
                        <Lightbulb /> {help ? "Hide help" : "Get help"}
                      </Button>
                      <Button size="lg" variant="destructive" onClick={tryAgain}>Try again</Button>
                    </div>
                  </>
                )}

                {phase === "reveal" && (
                  <>
                    <div className="flex items-start gap-3 text-wrong">
                      <XCircle className="size-9 shrink-0" strokeWidth={2.6} />
                      <div>
                        <p className="text-xl font-black">Correct answer:</p>
                        <p className="text-base font-extrabold text-foreground">{q.options[q.answer]}</p>
                      </div>
                    </div>
                    <div className="mt-4 max-h-[34vh] overflow-y-auto rounded-2xl border-2 border-wrong/30 bg-background/50 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Step-by-step solution</p>
                      <ol className="mt-2 space-y-2">
                        {q.steps.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm font-semibold">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-wrong text-xs font-black text-destructive-foreground">{i + 1}</span>
                            <span className="pt-0.5">{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <Button size="lg" variant="destructive" className="mt-4 w-full" onClick={advance}>Continue</Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={leaving} onOpenChange={setLeaving}>
        <DialogContent className="max-w-sm rounded-3xl border-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Wait, don't go!</DialogTitle>
            <DialogDescription className="font-semibold">Your progress is saved. You'll pick up at question {session.index + 1} next time.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button size="lg" onClick={() => setLeaving(false)}>Keep learning</Button>
            <Button size="lg" variant="ghost" className="text-wrong" onClick={onExit}>End session</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
