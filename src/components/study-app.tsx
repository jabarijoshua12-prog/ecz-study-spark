import { useMemo, useRef, useState } from "react";
import {
  ArrowRight, Atom, Beaker, BookOpen, BrainCircuit, CalendarDays,
  Check, ChevronLeft, Clock3, FileText, FlaskConical, GraduationCap, GripVertical,
  Home, LogOut, Moon, Pencil, Settings, Sigma, Sun, Target, Trophy, UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

type Screen = "auth" | "baseline" | "availability" | "routine" | "home" | "subjects" | "papers" | "tutor" | "settings";
type Subject = "Mathematics" | "Biology" | "Physics" | "Chemistry";
const subjects: { name: Subject; icon: typeof Sigma; color: string; intro: string; topics: string[] }[] = [
  { name: "Mathematics", icon: Sigma, color: "bg-math/15 text-math", intro: "Numbers, algebra, geometry, statistics.", topics: ["Sets", "Algebra", "Matrices", "Trigonometry"] },
  { name: "Biology", icon: FlaskConical, color: "bg-biology/15 text-biology", intro: "Cells, systems, ecology, genetics.", topics: ["Cell structure", "Nutrition", "Respiration", "Genetics"] },
  { name: "Physics", icon: Atom, color: "bg-physics/15 text-physics", intro: "Motion, forces, energy, electricity.", topics: ["Motion", "Forces", "Energy", "Electricity"] },
  { name: "Chemistry", icon: Beaker, color: "bg-chemistry/15 text-chemistry", intro: "Matter, reactions, acids, organic chemistry.", topics: ["Atomic structure", "Bonding", "Acids and bases", "Organic chemistry"] },
];
const schedule: { day: string; slots: { time: string; subject: Subject; topic: string }[] }[] = [
  { day: "Mon", slots: [{ time: "14:00", subject: "Mathematics", topic: "Matrices" }, { time: "15:00", subject: "Biology", topic: "Cell structure" }] },
  { day: "Tue", slots: [{ time: "14:00", subject: "Physics", topic: "Motion" }, { time: "15:00", subject: "Mathematics", topic: "Trigonometry" }] },
  { day: "Fri", slots: [{ time: "14:00", subject: "Chemistry", topic: "Atomic structure" }, { time: "15:00", subject: "Biology", topic: "Nutrition" }] },
];
const subjectTone: Record<Subject, string> = { Mathematics: "bg-math/15 border-math/30 text-foreground", Biology: "bg-biology/15 border-biology/30 text-foreground", Physics: "bg-physics/15 border-physics/30 text-foreground", Chemistry: "bg-chemistry/15 border-chemistry/30 text-foreground" };

export function StudyApp() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [name, setName] = useState("Joshua");
  const [scores, setScores] = useState<Record<Subject, number>>({ Mathematics: 48, Physics: 57, Chemistry: 63, Biology: 72 });
  const [routine, setRoutine] = useState(schedule);
  const [toast, setToast] = useState("");
  const showToast = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2200); };
  const enter = (next: Screen) => { setScreen(next); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (screen === "auth") return <AuthScreen name={name} setName={setName} onContinue={() => enter("baseline")} />;
  if (screen === "baseline") return <BaselineScreen scores={scores} setScores={setScores} onBack={() => enter("auth")} onContinue={() => enter("availability")} />;
  if (screen === "availability") return <AvailabilityScreen onBack={() => enter("baseline")} onContinue={() => enter("home")} />;
  if (screen === "routine") return <RoutineScreen routine={routine} setRoutine={setRoutine} onBack={() => enter("availability")} onConfirm={() => enter("home")} />;

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto w-full max-w-3xl px-5 pb-8 pt-7 sm:px-8 sm:pt-10">
        {screen === "home" && <HomeScreen name={name} go={enter} />}
        {screen === "subjects" && <SubjectsScreen />}
        {screen === "papers" && <PapersScreen go={enter} />}
        {screen === "tutor" && <TutorScreen name={name} />}
        {screen === "settings" && <SettingsScreen name={name} setName={setName} scores={scores} setScores={setScores} routine={routine} setRoutine={setRoutine} saved={showToast} />}
      </main>
      <BottomNav current={screen} go={enter} />
      {toast && <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-xl">{toast}</div>}
    </div>
  );
}

function Brand() { return <div className="flex items-center gap-2 font-black text-primary"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-5" /></span><span>ECZ Study</span></div>; }

function AuthScreen({ name, setName, onContinue }: { name: string; setName: (v: string) => void; onContinue: () => void }) {
  const [signup, setSignup] = useState(true);
  return <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-8">
    <Brand />
    <section className="py-10">
      <h1 className="text-3xl font-black leading-tight">Study smarter with a plan built around you.</h1>
      <p className="mt-4 text-lg text-muted-foreground">Your daily subjects, focused revision, and exam practice in one place.</p>
      <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        {signup && <label className="block text-sm font-bold">Your name<Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-12 rounded-xl bg-card px-4" /></label>}
        <label className="block text-sm font-bold">Email<Input required type="email" defaultValue="joshua@example.com" className="mt-2 h-12 rounded-xl bg-card px-4" /></label>
        <label className="block text-sm font-bold">Password<Input required type="password" defaultValue="password" className="mt-2 h-12 rounded-xl bg-card px-4" /></label>
        <Button className="h-12 w-full rounded-xl text-base font-extrabold">{signup ? "Create account" : "Sign in"}<ArrowRight /></Button>
      </form>
    </section>
    <Button variant="ghost" onClick={() => setSignup(!signup)}>{signup ? "Already have an account? Sign in" : "New here? Create account"}</Button>
  </main>;
}

function StepHeader({ step, title, copy, onBack }: { step: string; title: string; copy: string; onBack: () => void }) { return <><div className="flex items-center justify-between"><Button size="icon" variant="ghost" onClick={onBack} aria-label="Go back"><ChevronLeft /></Button><span className="text-sm font-bold text-muted-foreground">{step}</span></div><div className="mt-10"><h1 className="text-2xl font-black">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{copy}</p></div></>; }

function BaselineScreen({ scores, setScores, onBack, onContinue }: { scores: Record<Subject, number>; setScores: (v: Record<Subject, number>) => void; onBack: () => void; onContinue: () => void }) {
  const [editing, setEditing] = useState<Subject | null>(null);
  return <main className="mx-auto min-h-screen max-w-lg px-5 py-6"><StepHeader step="1 of 2" title="Your starting point" copy="Add your latest report-card points from 1 (best) to 9." onBack={onBack} />
    <div className="mt-7 overflow-hidden rounded-2xl border bg-card"><Table><TableHeader><TableRow><TableHead className="px-4">Core subject</TableHead><TableHead className="w-20 text-right">Points</TableHead></TableRow></TableHeader><TableBody>{subjects.map(({ name: subject, icon: Icon }) => <TableRow key={subject} onClick={() => setEditing(subject)} className="cursor-pointer"><TableCell className="px-4"><span className="flex items-center gap-3 font-bold"><Icon className="size-5 text-primary" />{subject}</span></TableCell><TableCell className="pr-6 text-right text-lg font-black text-primary">{scores[subject]}</TableCell></TableRow>)}</TableBody></Table></div>
    <Button className="mt-7 h-11 w-full rounded-xl font-extrabold" onClick={onContinue}>Confirm</Button>
    <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-w-xs rounded-2xl"><DialogHeader><DialogTitle>{editing}</DialogTitle><DialogDescription>Select the report-card point.</DialogDescription></DialogHeader><div className="grid grid-cols-3 gap-2">{[1,2,3,4,5,6,7,8,9].map(point => <Button key={point} variant={editing && scores[editing] === point ? "default" : "outline"} className="h-12" onClick={() => { if (editing) setScores({...scores,[editing]:point}); setEditing(null); }}>{point}</Button>)}</div></DialogContent></Dialog>
  </main>;
}

function AvailabilityScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [days, setDays] = useState(["Mon", "Tue", "Fri"]);
  const [timeOpen, setTimeOpen] = useState(false);
  return <main className="mx-auto min-h-screen max-w-lg px-5 py-6"><StepHeader step="2 of 2" title="When can you study?" copy="Choose the days and time you can focus each week." onBack={onBack} />
    <div className="mt-7"><p className="text-sm font-bold">Days per week</p><div className="mt-3 grid grid-cols-7 gap-2">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => <Button key={day} size="sm" variant={days.includes(day) ? "default" : "outline"} className="h-10 px-0" onClick={() => setDays(days.includes(day) ? days.filter(d => d !== day) : [...days, day])}>{day.slice(0,1)}</Button>)}</div></div>
    <button onClick={() => setTimeOpen(true)} className="mt-6 flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left"><span><b className="block text-sm">Study time</b><span className="text-sm text-muted-foreground">14:00 — 16:00</span></span><Clock3 className="text-primary"/></button>
    <Button className="mt-7 h-11 w-full rounded-xl font-extrabold" onClick={onContinue}>Next <ArrowRight /></Button>
    <Dialog open={timeOpen} onOpenChange={setTimeOpen}><DialogContent className="max-w-xs rounded-2xl"><DialogHeader><DialogTitle>Study time</DialogTitle><DialogDescription>Choose your usual study window.</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Start<Input type="time" defaultValue="14:00" className="mt-2 h-11"/></label><label className="text-sm font-bold">Finish<Input type="time" defaultValue="16:00" className="mt-2 h-11"/></label></div><Button onClick={() => setTimeOpen(false)}>Done</Button></DialogContent></Dialog>
  </main>;
}

function RoutineScreen({ routine, setRoutine, onBack, onConfirm, compact = false }: { routine: typeof schedule; setRoutine: (v: typeof schedule) => void; onBack?: () => void; onConfirm?: () => void; compact?: boolean }) {
  const [edit, setEdit] = useState<{ day: number; slot: number } | null>(null);
  const replace = (subject: Subject) => { if (!edit) return; const next = routine.map((d, di) => di !== edit.day ? d : { ...d, slots: d.slots.map((s, si) => si !== edit.slot ? s : { ...s, subject, topic: subjects.find(x => x.name === subject)?.topics[0] ?? s.topic }) }); setRoutine(next); setEdit(null); };
  return <div className={compact ? "" : "mx-auto min-h-screen max-w-lg px-5 py-6"}>{!compact && onBack && <StepHeader step="3 of 3" title="Your Study Rhythm" copy="We’ve prioritized weaker subjects while keeping each day balanced." onBack={onBack} />}
    <div className={cn("space-y-4", !compact && "mt-8")}>{routine.map((day, di) => <section key={day.day}><div className="mb-2 flex items-center justify-between"><h3 className="font-black">{day.day === "Mon" ? "Monday" : day.day === "Tue" ? "Tuesday" : "Friday"}</h3><span className="text-xs font-bold text-muted-foreground">2 hours</span></div><div className="grid grid-cols-[4.25rem_1fr] gap-2">{day.slots.map((slot, si) => <div key={slot.time} className="contents"><span className="pt-4 text-xs font-bold text-muted-foreground">{slot.time}</span><button onClick={() => setEdit({ day: di, slot: si })} className={cn("flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition-transform active:scale-[.98]", subjectTone[slot.subject])}><GripVertical className="size-4 opacity-40"/><span className="min-w-0 flex-1"><b className="block">{slot.subject}</b><span className="block truncate text-xs opacity-70">{slot.topic}</span></span><Pencil className="size-4 opacity-50" /></button></div>)}</div></section>)}</div>
    {!compact && <Button className="mt-8 h-12 w-full rounded-xl font-extrabold" onClick={onConfirm}><Check /> Confirm routine</Button>}
    <Dialog open={edit !== null} onOpenChange={(open) => !open && setEdit(null)}><DialogContent className="max-w-sm rounded-2xl"><DialogHeader><DialogTitle>Change this study block</DialogTitle><DialogDescription>Choose one core subject for this time.</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-2">{subjects.map(({ name, icon: Icon }) => <Button key={name} variant="outline" className="h-20 flex-col rounded-xl" onClick={() => replace(name)}><Icon />{name}</Button>)}</div></DialogContent></Dialog>
  </div>;
}

function HomeScreen({ name, go }: { name: string; go: (s: Screen) => void }) {
  const [due, setDue] = useState(["Mathematics", "Biology", "Physics"] as Subject[]);
  const [removing, setRemoving] = useState<string | null>(null);
  const complete = (subject: Subject) => { setRemoving(subject); window.setTimeout(() => { setDue(due.filter(x => x !== subject)); setRemoving(null); }, 800); };
  return <><header className="mb-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Good afternoon,</p><h1 className="text-2xl font-black">{name}</h1></div><Button size="icon" variant="outline" className="rounded-full" onClick={() => go("settings")} aria-label="Open settings"><UserRound /></Button></header>
    <button onClick={() => go("tutor")} className="relative w-full overflow-hidden rounded-[2rem] bg-primary p-7 text-left text-primary-foreground shadow-lg transition-transform active:scale-[.99]"><span className="relative z-10 inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-extrabold">ECZ Curriculum</span><h2 className="relative z-10 mt-7 text-4xl font-black">The Exam</h2><p className="relative z-10 mt-2 max-w-md text-primary-foreground/80">Turn what you’ve covered into a focused exam plan.</p><span className="relative z-10 mt-7 flex items-center gap-2 font-extrabold">Enter Exam Mode <ArrowRight className="size-4"/></span><span className="absolute -right-12 -top-16 size-44 rounded-full bg-primary-foreground/10"/><span className="absolute -bottom-28 right-6 size-56 rounded-full bg-primary-foreground/10"/></button>
    <h2 className="mb-3 mt-7 text-xl font-black">Due today</h2><div className="grid gap-3 sm:grid-cols-3">{due.map((subject, i) => { const item = subjects.find(s => s.name === subject); if (!item) return null; const Icon = item.icon; return <button key={subject} onClick={() => complete(subject)} className={cn("rounded-2xl border bg-card p-4 text-left shadow-sm", removing === subject && "success-away")}><div className={cn("mb-5 grid size-10 place-items-center rounded-xl", item.color)}><Icon className="size-5"/></div><b className="block">{subject}</b><span className="text-xs text-muted-foreground">{i === 0 ? "Matrices" : i === 1 ? "Cell structure" : "Motion"} · 40 min</span></button>})}{due.length === 0 && <div className="col-span-full rounded-2xl bg-success-soft p-5 text-center font-bold text-primary"><Trophy className="mx-auto mb-2"/>You’re done for today!</div>}</div>
    <div className="mt-7 grid grid-cols-2 gap-3"><ActionCard icon={BookOpen} label="Subjects" onClick={() => go("subjects")} primary/><ActionCard icon={FileText} label="Past papers" onClick={() => go("papers")} /><ActionCard icon={CalendarDays} label="Study Rhythm" onClick={() => go("settings")} /><ActionCard icon={BrainCircuit} label="AI Tutor" onClick={() => go("tutor")} /></div>
  </>;
}
function ActionCard({ icon: Icon, label, onClick, primary }: { icon: typeof Home; label: string; onClick: () => void; primary?: boolean }) { return <button onClick={onClick} className={cn("flex min-h-28 flex-col items-start justify-between rounded-2xl border p-5 text-left text-lg font-extrabold shadow-sm transition-transform active:scale-[.98]", primary ? "border-primary bg-primary text-primary-foreground" : "bg-card")}><Icon />{label}</button>; }

function SubjectsScreen() { const [open, setOpen] = useState<Subject | null>(null); return <><PageTitle title="Subjects" copy="Pick a subject to see ECZ syllabus topics."/><div className="mt-6 space-y-3">{subjects.map(({ name, icon: Icon, color, intro, topics }) => <div key={name} className="overflow-hidden rounded-2xl border bg-card shadow-sm"><button className="flex w-full items-center gap-4 p-5 text-left" onClick={() => setOpen(open === name ? null : name)}><span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", color)}><Icon /></span><span className="min-w-0 flex-1"><b className="text-lg">{name}</b><span className="block truncate text-sm text-muted-foreground">{intro}</span></span><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{topics.length} topics</span></button><div className={cn("grid transition-[grid-template-rows] duration-300", open === name ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><div className="overflow-hidden"><div className="grid grid-cols-2 gap-2 border-t p-4">{topics.map(topic => <button key={topic} className="rounded-xl bg-muted p-3 text-left text-sm font-bold hover:bg-secondary">{topic}</button>)}</div></div></div></div>)}</div></>; }

function PapersScreen({ go }: { go: (s: Screen) => void }) { const [subject, setSubject] = useState<Subject>("Mathematics"); const [year, setYear] = useState(2025); return <><PageTitle title="Past Papers" copy="Practise under exam conditions, timer included."/><p className="mt-7 text-sm font-bold text-muted-foreground">Subject</p><div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2">{subjects.map(s => <Button key={s.name} variant={subject === s.name ? "default" : "outline"} className="h-12 shrink-0 rounded-full" onClick={() => setSubject(s.name)}><s.icon/>{s.name}</Button>)}</div><p className="mt-6 text-sm font-bold text-muted-foreground">Year</p><div className="mt-3 grid grid-cols-4 gap-2">{[2018,2019,2020,2021,2022,2023,2024,2025].map(y => <Button key={y} variant={year === y ? "default" : "outline"} className="h-12 rounded-full" onClick={() => setYear(y)}>{y}</Button>)}</div><div className="mt-6 rounded-[2rem] bg-primary p-7 text-primary-foreground"><p className="opacity-75">Selected paper</p><h2 className="mt-2 text-2xl font-black">{subject} · {year}</h2><Button variant="secondary" className="mt-6 rounded-full" onClick={() => go("tutor")}>Start practice session <ArrowRight /></Button></div></>; }

function TutorScreen({ name }: { name: string }) {
  const [exam, setExam] = useState(false); const [examOpen, setExamOpen] = useState(false); const [phase, setPhase] = useState<"topic"|"subtopic"|"summary"|"test"|"done">("topic"); const [topic, setTopic] = useState(""); const [messages, setMessages] = useState<{ role: "user"|"assistant"; text: string }[]>([]); const [clearing, setClearing] = useState(false); const inputRef = useRef<HTMLTextAreaElement>(null);
  const greeting = useMemo(() => new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening", []);
  const submit = (text: string) => { if (!text.trim()) return; setTopic(text); setMessages([{ role: "user", text }, { role: "assistant", text: "That sounds closest to **Matrices** in the official Mathematics syllabus. Which part are you currently learning?" }]); setPhase("subtopic"); };
  const transition = () => { setClearing(true); window.setTimeout(() => { setMessages([{ role: "assistant", text: "Great work on Mathematics. Let’s move on to **Cell structure in Biology**." }]); setPhase("done"); setClearing(false); }, 350); };
  return <div className="flex min-h-[calc(100vh-8rem)] flex-col"><header className="flex items-start justify-between gap-4"><div><p className="text-sm font-extrabold text-primary">AI Tutor</p><h1 className="mt-1 text-3xl font-black">{greeting}, {name}.</h1><p className="mt-2 text-muted-foreground">What topic did you learn recently in Mathematics or Biology?</p></div><label className="flex shrink-0 flex-col items-center gap-1 text-[10px] font-bold text-primary"><Switch checked={exam} onCheckedChange={(v) => { setExam(v); if (v) setExamOpen(true); }} className="shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_45%,transparent)]"/>Exam</label></header>
    <div className="mt-5 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"><Conversation className="min-h-[390px]"><ConversationContent className={cn("gap-5 p-5", clearing && "clean-slate")}>
      {messages.length === 0 && <div className="my-auto text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary text-primary"><BrainCircuit className="size-8"/></div><h2 className="mt-4 text-xl font-black">Let’s start with today</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Name the topic you covered in class. I’ll match it to the ECZ syllabus.</p><div className="mt-5 flex flex-wrap justify-center gap-2">{["Matrices", "Trigonometry", "Cell structure"].map(x => <Button key={x} size="sm" variant="secondary" className="rounded-full" onClick={() => submit(`I learnt ${x}`)}>{x}</Button>)}</div></div>}
      {messages.map((m, i) => <Message from={m.role} key={`${m.role}-${i}`}><MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}><MessageResponse>{m.text}</MessageResponse></MessageContent></Message>)}
      {phase === "subtopic" && <div className="flex flex-wrap gap-2">{["Matrix notation", "Determinants", "Inverse matrices"].map(x => <Button key={x} size="sm" variant="outline" className="rounded-full" onClick={() => { setMessages([...messages, { role: "user", text: x }, { role: "assistant", text: "Good choice. Here is a focused summary before we test it." }]); setPhase("summary"); }}>{x}</Button>)}</div>}
      {phase === "summary" && <Accordion type="single" defaultValue="summary" collapsible><AccordionItem value="summary" className="rounded-xl border bg-muted px-4"><AccordionTrigger className="duration-300">Your summary · Inverse matrices</AccordionTrigger><AccordionContent><p>An inverse matrix reverses the effect of the original matrix. For a 2×2 matrix, swap the diagonal entries, change the signs of the other two, then divide by the determinant.</p><Button className="mt-4 rounded-full" size="sm" onClick={() => { setMessages([...messages, { role: "assistant", text: "Ready for an ECZ-style question?" }]); setPhase("test"); }}>I’ve written it down</Button></AccordionContent></AccordionItem></Accordion>}
      {phase === "test" && <div className="rounded-xl border-l-4 border-primary bg-secondary p-4"><p className="text-xs font-black uppercase text-primary">ECZ-style check</p><p className="mt-2 font-bold">Find the determinant of A = [ 3  2 ; 1  4 ].</p><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={transition}>10</Button><Button size="sm" variant="outline" onClick={() => setMessages([...messages, { role: "assistant", text: "Almost. Multiply the main diagonal first: 3 × 4, then subtract 2 × 1. Try once more." }])}>14</Button></div></div>}
      {phase === "done" && <div className="rounded-2xl bg-success-soft p-5 text-center text-primary"><Trophy className="mx-auto"/><b className="mt-2 block">You completed today’s Mathematics task.</b><p className="text-sm">Biology is ready when you are.</p></div>}
      <ConversationScrollButton />
    </ConversationContent></Conversation>
    <div className="border-t p-3"><PromptInput onSubmit={(m) => submit(m.text)} className="rounded-xl shadow-none"><PromptInputTextarea ref={inputRef} placeholder={topic ? "Write your answer…" : "I learnt…"} className="min-h-16"/><PromptInputFooter className="justify-end"><PromptInputSubmit /></PromptInputFooter></PromptInput></div></div>
    <ExamDialog open={examOpen} setOpen={setExamOpen} />
  </div>;
}

function ExamDialog({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) { const [step, setStep] = useState(0); const topics = ["Trigonometry", "Matrices", "Earth geometry"]; return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle className="flex items-center gap-2 text-2xl"><Target className="text-primary"/> Exam Mode</DialogTitle><DialogDescription>{step === 0 ? "When is the actual exam?" : "Rate your confidence on high-yield topics."}</DialogDescription></DialogHeader>{step === 0 ? <><Input type="date" defaultValue="2026-11-04" className="h-12 rounded-xl"/><Button className="h-11 rounded-xl" onClick={() => setStep(1)}>Find high-yield topics</Button></> : <><div className="space-y-5">{topics.map((t, i) => <div key={t}><div className="mb-2 flex justify-between text-sm font-bold"><span>{t}</span><span className="text-primary">{i === 0 ? "Low" : i === 1 ? "Medium" : "High"}</span></div><Slider defaultValue={[i === 0 ? 12 : i === 1 ? 52 : 86]} /></div>)}</div><div className="rounded-xl bg-secondary p-4 text-sm"><b className="text-primary">Priority order</b><ol className="mt-2 list-inside list-decimal"><li>Trigonometry</li><li>Matrices</li><li>Earth geometry</li></ol></div><Button className="h-11 rounded-xl" onClick={() => setOpen(false)}>Activate exam plan</Button></>}</DialogContent></Dialog>; }

function SettingsScreen({ name, setName, scores, setScores, routine, setRoutine, saved }: { name: string; setName: (v:string)=>void; scores: Record<Subject,number>; setScores:(v:Record<Subject,number>)=>void; routine: typeof schedule; setRoutine:(v:typeof schedule)=>void; saved:(v:string)=>void }) { const [tab,setTab]=useState<"profile"|"baseline"|"routine">("profile"); return <><PageTitle title="Settings" copy="Adjust the information behind your study plan."/><div className="mt-5 flex gap-2 overflow-x-auto">{(["profile","baseline","routine"] as const).map(x => <Button key={x} variant={tab===x?"default":"outline"} className="shrink-0 rounded-full capitalize" onClick={()=>setTab(x)}>{x === "baseline" ? "Starting Point" : x === "routine" ? "Study Rhythm" : "Profile"}</Button>)}</div><div className="mt-6">{tab === "profile" && <div className="space-y-4"><label className="block text-sm font-bold">Display name<Input value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-12 bg-card"/></label><Button onClick={()=>saved("Profile saved")}>Confirm profile</Button></div>}{tab === "baseline" && <><div className="rounded-2xl border bg-card p-4">{subjects.map(s => <label key={s.name} className="mb-3 flex items-center justify-between gap-3 text-sm font-bold"><span>{s.name}</span><Input type="number" value={scores[s.name]} onChange={e=>setScores({...scores,[s.name]:Number(e.target.value)})} className="w-24 text-center"/></label>)}</div><Button className="mt-4" onClick={()=>saved("Starting Point confirmed. Your routine was recalculated.")}>Confirm Starting Point</Button></>}{tab === "routine" && <><RoutineScreen compact routine={routine} setRoutine={setRoutine}/><Button className="mt-5" onClick={()=>saved("Study Rhythm confirmed")}>Confirm Study Rhythm</Button></>}</div><Button variant="ghost" className="mt-10 text-destructive"><LogOut/>Sign out</Button></>; }

function PageTitle({ title, copy }: { title: string; copy: string }) { return <div><h1 className="text-3xl font-black">{title}</h1><p className="mt-2 text-muted-foreground">{copy}</p></div>; }
function BottomNav({ current, go }: { current: Screen; go: (s: Screen) => void }) { const nav = [{s:"home" as Screen,l:"Home",i:Home},{s:"subjects" as Screen,l:"Subjects",i:BookOpen},{s:"papers" as Screen,l:"Papers",i:FileText},{s:"tutor" as Screen,l:"Tutor",i:BrainCircuit},{s:"settings" as Screen,l:"Settings",i:Settings}]; return <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur"><div className="mx-auto grid h-20 max-w-3xl grid-cols-5">{nav.map(({s,l,i:Icon}) => <button key={s} onClick={()=>go(s)} className={cn("flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors",current===s?"text-primary":"text-muted-foreground")}><Icon className="size-5"/><span>{l}</span></button>)}</div></nav>; }