import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Atom, Check, ChevronLeft, Dna, FlaskConical, GraduationCap, Pi, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DAYS, DAY_NAMES, type Day, type SubjectId } from "@/lib/study-logic";

export const SUBJECT_ICON: Record<SubjectId, LucideIcon> = {
  math: Pi,
  biology: Dna,
  physics: Atom,
  chemistry: FlaskConical,
};

export const choiceClass = (active: boolean) =>
  cn(
    "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left font-bold transition-all duration-150 active:translate-y-1 active:shadow-none",
    active
      ? "border-primary bg-primary/10 text-primary shadow-[0_4px_0_var(--primary-edge)]"
      : "border-border bg-card shadow-[0_4px_0_var(--border)] hover:bg-accent",
  );

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_3px_0_var(--primary-edge)]", small ? "size-8" : "size-10")}>
        <GraduationCap className={small ? "size-4" : "size-5"} strokeWidth={2.5} />
      </span>
      <span className={cn("font-black tracking-tight", small ? "text-base" : "text-lg")}>
        AR<span className="text-primary">ES</span>
      </span>
    </div>
  );
}

export function Dots() {
  return (
    <span className="flex items-center gap-1.5" role="status" aria-label="Checking">
      {[0, 1, 2].map((i) => (
        <span key={i} className="dot-bounce size-2.5 rounded-full bg-current" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className="relative h-full rounded-full bg-primary" initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }}>
        {pct > 6 && <span className="absolute inset-x-2 top-[22%] h-[22%] rounded-full bg-foreground/35" />}
      </motion.div>
    </div>
  );
}

export function Mascot({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-end gap-3">
      <motion.span
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="grid size-16 shrink-0 place-items-center rounded-[1.4rem] bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-edge)]"
      >
        <GraduationCap className="size-8" strokeWidth={2.4} />
      </motion.span>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.12 }}
        className="relative mb-2 rounded-2xl border-2 bg-card px-4 py-3 text-base font-extrabold leading-snug"
      >
        <span aria-hidden className="absolute -left-[9px] bottom-4 size-4 rotate-45 border-b-2 border-l-2 bg-card" />
        <span className="relative">{children}</span>
      </motion.div>
    </div>
  );
}

export function StepShell({ progress, title, onBack, children, footer }: { progress?: number; title?: string; onBack?: () => void; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center gap-3 px-5 pt-5">
        {onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back" className="shrink-0 [&_svg]:size-6">
            <ChevronLeft />
          </Button>
        ) : (
          <span className="size-10 shrink-0" />
        )}
        {progress !== undefined ? <ProgressBar value={progress} /> : <h1 className="text-xl font-black">{title}</h1>}
      </header>
      <main className="flex-1 px-5 pb-32 pt-8">{children}</main>
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t-2 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-4">{footer}</div>
      </footer>
    </div>
  );
}

export const GRADES = [8, 9, 10, 11, 12];

export const AVAILABLE_GRADES = [11];

export function GradeOptions({ value, onChange }: { value: number | null; onChange: (g: number) => void }) {
  const [soon, setSoon] = useState<number | null>(null);
  return (
    <div className="grid gap-3">
      <Dialog open={soon !== null} onOpenChange={(o) => !o && setSoon(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] text-center">
          <DialogHeader className="items-center text-center">
            <span className="mb-2 grid size-14 place-items-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground">{soon}</span>
            <DialogTitle className="text-xl font-black">Grade {soon} is coming soon</DialogTitle>
            <DialogDescription className="font-semibold">We're building it for the next update. ARES is available for Grade 11 right now.</DialogDescription>
          </DialogHeader>
          <Button size="lg" className="w-full" onClick={() => setSoon(null)}>Got it</Button>
        </DialogContent>
      </Dialog>
      {GRADES.map((g, i) => (
        <motion.button key={g} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} onClick={() => (AVAILABLE_GRADES.includes(g) ? onChange(g) : setSoon(g))} className={choiceClass(value === g)} aria-pressed={value === g}>
          <span className={cn("grid size-11 place-items-center rounded-xl text-lg font-black", value === g ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>{g}</span>
          <span className="flex-1">
            <b className="block text-base">Grade {g}</b>
            <span className="text-xs font-bold text-muted-foreground">{g <= 9 ? "Junior secondary" : "Senior secondary"}</span>
          </span>
          {value === g && <Check className="size-5" strokeWidth={3} />}
        </motion.button>
      ))}
    </div>
  );
}

export function DayPicker({ value, onChange }: { value: Day[]; onChange: (d: Day[]) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {DAYS.map((d) => {
        const on = value.includes(d);
        return (
          <button
            key={d}
            aria-pressed={on}
            aria-label={DAY_NAMES[d]}
            onClick={() => onChange(on ? value.filter((x) => x !== d) : DAYS.filter((x) => x === d || value.includes(x)))}
            className={cn(
              "flex aspect-[3/4] items-center justify-center rounded-2xl border-2 text-sm font-black transition-all duration-150 active:translate-y-1 active:shadow-none",
              on ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_0_var(--primary-edge)]" : "border-border bg-card text-muted-foreground shadow-[0_4px_0_var(--border)] hover:text-foreground",
            )}
          >
            {d.slice(0, 2)}
          </button>
        );
      })}
    </div>
  );
}
