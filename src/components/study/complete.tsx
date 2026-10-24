import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteScreen({
  stages,
  xp,
  accuracy,
  returnLabel,
  onDone,
  autoMs = 4200,
}: {
  stages: { title: string; subtitle: string }[];
  xp: number;
  accuracy: number;
  returnLabel: string;
  onDone: () => void;
  autoMs?: number;
}) {
  const [stage, setStage] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timers = [window.setTimeout(() => done.current(), autoMs)];
    if (stages.length > 1) timers.push(window.setTimeout(() => setStage(1), 1700));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [autoMs, stages.length]);

  const current = stages[stage];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <div className="relative">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              aria-hidden
              className="absolute left-[calc(50%-6px)] top-[calc(50%-6px)] size-3 rounded-full bg-primary"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: Math.cos(a) * 120, y: Math.sin(a) * 120, scale: [0, 1.3, 0], opacity: [1, 1, 0] }}
              transition={{ delay: 0.35, duration: 1.1, ease: "easeOut" }}
            />
          );
        })}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 13 }}
          className="glow-pulse grid size-32 place-items-center rounded-full bg-primary"
        >
          <svg viewBox="0 0 24 24" className="size-16 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }} />
          </svg>
        </motion.div>
      </div>

      <div className="mt-12 min-h-24">
        <AnimatePresence mode="wait">
          <motion.div key={stage} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-black text-primary">{current.title}</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{current.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {[
          { label: "Total XP", value: `+${xp}`, Icon: Zap },
          { label: "Accuracy", value: `${accuracy}%`, Icon: Target },
        ].map(({ label, value, Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + 0.1 * i }} className="overflow-hidden rounded-2xl border-2 border-primary">
            <p className="bg-primary px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary-foreground">{label}</p>
            <p className="flex items-center justify-center gap-2 py-3 text-xl font-black text-primary">
              <Icon className="size-5" strokeWidth={2.6} />
              {value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: autoMs / 1000, ease: "linear" }} />
        </div>
        <p className="mt-2 text-xs font-bold text-muted-foreground">{returnLabel}</p>
        <Button size="lg" className="mt-5 w-full" onClick={onDone}>Continue</Button>
      </div>
    </main>
  );
}
