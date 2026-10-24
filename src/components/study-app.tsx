import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStudyStore, type Session } from "@/hooks/use-study-store";
import { SUBJECT_NAMES, dayKey, nextStreak, XP_PER_CORRECT, type SubjectId } from "@/lib/study-logic";
import { buildDailyQuestions, buildTopicQuestions, topicName, topicSubject } from "@/lib/question-bank";
import { AuthScreen, DaysScreen, GradeScreen, RoutineScreen } from "./study/onboarding";
import { HomeScreen, todaysPlan } from "./study/home";
import { QuizScreen } from "./study/quiz";
import { CompleteScreen } from "./study/complete";
import { SubjectsScreen, TopicsScreen } from "./study/subjects";
import { ProfileScreen } from "./study/profile";
import { BottomNav, type Tab } from "./study/bottom-nav";
import { Logo } from "./study/ui-bits";

type View =
  | { name: Tab }
  | { name: "topics"; subject: SubjectId }
  | { name: "quiz"; topicId?: string }
  | { name: "complete"; subject: SubjectId; topicId?: string; xp: number; accuracy: number; nextSubject?: SubjectId };

const seed = () => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;

export function StudyApp() {
  const { state, update, ready } = useStudyStore();
  const [view, setView] = useState<View>({ name: "home" });
  const [step, setStep] = useState<"grade" | "days" | "routine">("grade");

  if (!ready)
    return (
      <div className="grid min-h-dvh place-items-center">
        <Logo />
      </div>
    );

  if (!state.user) return <AuthScreen onSignIn={(user) => update((s) => ({ ...s, user }))} />;

  if (!state.onboarded) {
    if (step === "grade")
      return <GradeScreen value={state.grade} onBack={() => update((s) => ({ ...s, user: null }))} onNext={(grade) => { update((s) => ({ ...s, grade })); setStep("days"); }} />;
    if (step === "days")
      return <DaysScreen value={state.days} onBack={() => setStep("grade")} onNext={(days) => { update((s) => ({ ...s, days })); setStep("routine"); }} />;
    return <RoutineScreen days={state.days} onBack={() => setStep("days")} onDone={() => { update((s) => ({ ...s, onboarded: true })); setView({ name: "home" }); }} />;
  }

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const startDaily = () => {
    const plan = todaysPlan(state);
    if (!plan.session) {
      if (!plan.current) return;
      const session: Session = {
        kind: "daily",
        subject: plan.current,
        dateKey: plan.today,
        questions: buildDailyQuestions(plan.topics(plan.current), seed()),
        index: 0,
        strikes: 0,
        correct: 0,
        firstTry: 0,
      };
      update((s) => ({ ...s, dailySession: session }));
    }
    go({ name: "quiz" });
  };

  const startTopic = (topicId: string) => {
    const subject = topicSubject(topicId);
    if (!subject) return;
    if (!state.topicSessions[topicId]) {
      const session: Session = { kind: "topic", subject, topicId, questions: buildTopicQuestions(topicId, seed()), index: 0, strikes: 0, correct: 0, firstTry: 0 };
      update((s) => ({ ...s, topicSessions: { ...s.topicSessions, [topicId]: session } }));
    }
    go({ name: "quiz", topicId });
  };

  const accuracy = (s: Session) => Math.round((s.firstTry / s.questions.length) * 100);

  const finish = (s: Session) => {
    const today = dayKey(new Date());
    const xp = s.correct * XP_PER_CORRECT;
    if (s.kind === "daily") {
      const plan = todaysPlan(state);
      const nextSubject = plan.subjects.find((x) => x !== s.subject && !plan.done.includes(x));
      update((st) => {
        const done = st.daily.dateKey === today ? st.daily.done : [];
        return {
          ...st,
          dailySession: null,
          daily: { dateKey: today, done: done.includes(s.subject) ? done : [...done, s.subject] },
          xp: st.xp + xp,
          streak: nextStreak(st.streak, st.lastStreakDate, today),
          lastStreakDate: today,
        };
      });
      go({ name: "complete", subject: s.subject, xp, accuracy: accuracy(s), nextSubject });
    } else if (s.topicId) {
      const id = s.topicId;
      update((st) => {
        const { [id]: _removed, ...rest } = st.topicSessions;
        return { ...st, topicSessions: rest, topicsDone: st.topicsDone.includes(id) ? st.topicsDone : [...st.topicsDone, id], xp: st.xp + xp };
      });
      go({ name: "complete", subject: s.subject, topicId: id, xp, accuracy: accuracy(s) });
    }
  };

  let content: ReactNode = null;
  let tab: Tab | null = null;

  if (view.name === "quiz") {
    const session = view.topicId ? state.topicSessions[view.topicId] : state.dailySession;
    if (!session) {
      content = null;
      queueMicrotask(() => setView({ name: "home" }));
    } else {
      const exitTo: View = session.kind === "topic" ? { name: "topics", subject: session.subject } : { name: "home" };
      content = (
        <QuizScreen
          session={session}
          onChange={(next) =>
            update((s) => (next.kind === "topic" && next.topicId ? { ...s, topicSessions: { ...s.topicSessions, [next.topicId]: next } } : { ...s, dailySession: next }))
          }
          onExit={() => go(exitTo)}
          onFinish={finish}
        />
      );
    }
  } else if (view.name === "complete") {
    const stages = view.topicId
      ? [{ title: "Topic complete!", subtitle: `${topicName(view.topicId)} is in the bag.` }]
      : [
          { title: "Lesson complete!", subtitle: "Fifteen questions down." },
          { title: "Subject complete!", subtitle: view.nextSubject ? `Next up: ${SUBJECT_NAMES[view.nextSubject]}. Hit Start when you're ready.` : `${SUBJECT_NAMES[view.subject]} is done. That's today's path finished!` },
        ];
    const back: View = view.topicId ? { name: "topics", subject: view.subject } : { name: "home" };
    content = <CompleteScreen key={`${view.subject}-${view.topicId ?? "daily"}`} stages={stages} xp={view.xp} accuracy={view.accuracy} returnLabel={view.topicId ? "Heading back to topics…" : "Heading back to your path…"} onDone={() => go(back)} />;
  } else if (view.name === "topics") {
    content = <TopicsScreen subject={view.subject} topicsDone={state.topicsDone} sessions={state.topicSessions} onBack={() => go({ name: "subjects" })} onStart={startTopic} />;
  } else {
    tab = view.name;
    content = (
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-6">
        {view.name === "home" && <HomeScreen state={state} onStart={startDaily} onPractice={() => go({ name: "subjects" })} />}
        {view.name === "subjects" && <SubjectsScreen topicsDone={state.topicsDone} onOpen={(subject) => go({ name: "topics", subject })} />}
        {view.name === "profile" && (
          <ProfileScreen
            state={state}
            onGrade={(grade) => update((s) => ({ ...s, grade }))}
            onLogout={() => {
              update((s) => ({ ...s, user: null }));
              setView({ name: "home" });
            }}
          />
        )}
      </main>
    );
  }

  const key = view.name === "topics" ? `topics-${view.subject}` : view.name === "quiz" ? `quiz-${view.topicId ?? "daily"}` : view.name;

  return (
    <div className="min-h-dvh bg-background">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {content}
        </motion.div>
      </AnimatePresence>
      {tab && <BottomNav current={tab} go={(t) => go({ name: t })} />}
    </div>
  );
}
