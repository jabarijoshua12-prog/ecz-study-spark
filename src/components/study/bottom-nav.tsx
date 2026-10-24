import { BookOpen, House, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "home" | "subjects" | "profile";

const ITEMS = [
  { id: "home", label: "Home", Icon: House },
  { id: "subjects", label: "Subjects", Icon: BookOpen },
  { id: "profile", label: "Profile", Icon: UserRound },
] as const;

export function BottomNav({ current, go }: { current: Tab; go: (t: Tab) => void }) {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t-2 bg-background">
      <div className="mx-auto grid h-[4.75rem] max-w-md grid-cols-3 gap-2 px-4 py-2">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => go(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-2xl border-2 text-[11px] font-black uppercase tracking-wider transition-colors",
                active ? "border-primary/70 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-6" strokeWidth={2.4} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
