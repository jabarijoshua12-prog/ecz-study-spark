import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QUESTIONS_PER_TOPIC_SESSION, SUBJECT_IDS, SUBJECT_NAMES, type SubjectId } from "@/lib/study-logic";
import { topicsOf } from "@/lib/question-bank";
import type { Session } from "@/hooks/use-study-store";
import { SUBJECT_ICON, choiceClass } from "./ui-bits";

export function SubjectsScreen({ topicsDone, onOpen }: { topicsDone: string[]; onOpen: (s: SubjectId) => void }) {
  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black">Subjects</h1>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">Practise any topic, whenever you like.</p>
      <div className="mt-6 grid gap-3">
        {SUBJECT_IDS.map((s, i) => {
          const topics = topicsOf(s);
          const Icon = SUBJECT_ICON[s];
          return (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => onOpen(s)}
              className="flex items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left shadow-[0_4px_0_var(--border)] transition-all duration-150 hover:bg-accent active:translate-y-1 active:shadow-none"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-7" strokeWidth={2.4} />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-lg font-black">{SUBJECT_NAMES[s]}</b>
                <span className="text-xs font-bold text-muted-foreground">{topics.length} topics</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function TopicsScreen({ subject, topicsDone, sessions, onBack, onStart }: { subject: SubjectId; topicsDone: string[]; sessions: Record<string, Session>; onBack: () => void; onStart: (topicId: string) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const topics = topicsOf(subject).filter((t) => t.name.toLowerCase().includes(q));

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-32">
      <header className="sticky top-0 z-20 border-b-2 bg-background/95 px-5 pb-4 pt-5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to subjects" className="[&_svg]:size-6">
            <ChevronLeft />
          </Button>
          <h1 className="text-xl font-black">{SUBJECT_NAMES[subject]}</h1>
        </div>
        <label className="relative mt-3 block">
          <span className="sr-only">Search topics</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics" className="h-12 rounded-2xl border-2 bg-card pl-12 text-base font-semibold" />
        </label>
      </header>

      <div className="grid gap-3 px-5 pt-5">
        {topics.map((t, i) => {
          const s = sessions[t.id];
          const active = selected === t.id;
          return (
            <motion.button key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} onClick={() => setSelected(t.id)} aria-pressed={active} className={choiceClass(active)}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black", active ? "bg-primary/20" : "bg-muted")}>
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-base">{t.name}</b>
              </span>
            </motion.button>
          );
        })}
        {topics.length === 0 && <p className="py-10 text-center text-sm font-bold text-muted-foreground">No topics match “{query}”.</p>}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t-2 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-4">
          <Button size="lg" className="w-full" disabled={!selected} onClick={() => selected && onStart(selected)}>
            {selected && sessions[selected] ? "Resume" : "Start"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
