import { useState } from "react";
import { BookCheck, ChevronRight, Flame, GraduationCap, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildRoutine } from "@/lib/study-logic";
import type { StudyState } from "@/hooks/use-study-store";
import { GradeOptions, RoutineList } from "./ui-bits";

export function ProfileScreen({ state, onGrade, onLogout }: { state: StudyState; onGrade: (g: number) => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const user = state.user ?? { name: "Learner", email: "" };
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black">Profile</h1>

      <section className="mt-6 flex items-center gap-4">
        <span className="grid size-20 shrink-0 place-items-center rounded-full bg-primary text-2xl font-black text-primary-foreground shadow-[0_5px_0_var(--primary-edge)]">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-xl font-black">{user.name}</p>
          <p className="truncate text-sm font-semibold text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-primary">Grade {state.grade}</p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-2">
        {[
          { label: "Day streak", value: state.streak, Icon: Flame },
          { label: "Total XP", value: state.xp, Icon: Zap },
          { label: "Topics done", value: state.topicsDone.length, Icon: BookCheck },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border-2 bg-card p-3">
            <Icon className="size-5 text-primary" strokeWidth={2.6} />
            <p className="mt-1 text-xl font-black">{value}</p>
            <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-8 text-xs font-black uppercase tracking-widest text-muted-foreground">Account</h2>
      <button onClick={() => setOpen(true)} className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left shadow-[0_4px_0_var(--border)] transition-all hover:bg-accent active:translate-y-1 active:shadow-none">
        <GraduationCap className="size-5 text-primary" />
        <span className="flex-1 font-bold">Grade</span>
        <span className="text-sm font-black text-muted-foreground">Grade {state.grade}</span>
        <ChevronRight className="size-5 text-muted-foreground" />
      </button>

      <h2 className="mt-8 text-xs font-black uppercase tracking-widest text-muted-foreground">Weekly routine</h2>
      <div className="mt-3">
        <RoutineList routine={buildRoutine(state.days)} />
      </div>

      <Button size="lg" variant="secondary" className="mt-8 w-full text-wrong" onClick={onLogout}>
        <LogOut /> Log out
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Change grade</DialogTitle>
            <DialogDescription className="font-semibold">Pick the grade you're in now.</DialogDescription>
          </DialogHeader>
          <GradeOptions
            value={state.grade}
            onChange={(g) => {
              onGrade(g);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
