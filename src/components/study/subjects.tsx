import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { topicsForGrade } from "@/lib/question-bank";
import type { Session } from "@/hooks/use-study-store";
import { choiceClass } from "./ui-bits";

/** The learner's Maths syllabus for their grade; pick one to practise. */
export function TopicsScreen({ grade, sessions, onStart }: { grade: number | null; sessions: Record<string, Session>; onStart: (topicId: string) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const topics = topicsForGrade("math", grade).filter((t) => t.name.toLowerCase().includes(q));

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-black">Topics</h1>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">{grade ? `Grade ${grade} Mathematics` : "Mathematics"}</p>

      <label className="relative mt-4 block">
        <span className="sr-only">Search topics</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics" className="h-12 rounded-2xl border-2 bg-card pl-12 text-base font-semibold" />
      </label>

      <div className="mt-5 grid gap-3">
        {topics.map((t, i) => {
          const active = selected === t.id;
          return (
            <motion.button key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} onClick={() => setSelected(t.id)} aria-pressed={active} className={choiceClass(active)}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black", active ? "bg-primary/20" : "bg-muted")}>{i + 1}</span>
              <b className="min-w-0 flex-1 truncate text-base">{t.name}</b>
            </motion.button>
          );
        })}
        {topics.length === 0 && <p className="py-10 text-center text-sm font-bold text-muted-foreground">No topics match “{query}”.</p>}
      </div>

      <div className="fixed inset-x-0 bottom-[4.75rem] z-30 bg-linear-to-t from-background via-background to-transparent pt-8">
        <div className="mx-auto max-w-md px-5 pb-3">
          <Button size="lg" className="w-full" disabled={!selected} onClick={() => selected && onStart(selected)}>
            {selected && sessions[selected] ? "Resume" : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
}
