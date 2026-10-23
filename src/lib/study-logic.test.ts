import { describe, expect, it } from "vitest";
import { DAYS, SUBJECT_IDS, buildRoutine, outcomeAfterWrong, type Day } from "./study-logic";
import { TOPICS, buildDailyQuestions, buildTopicQuestions, generateQuestion } from "./question-bank";

describe("weekly routine", () => {
  it("gives each chosen study day exactly 2 different subjects", () => {
    const days: Day[] = ["Mon", "Wed", "Fri"];
    const routine = buildRoutine(days);
    for (const d of days) {
      expect(routine[d]).toHaveLength(2);
      expect(new Set(routine[d]).size).toBe(2);
    }
    expect(routine.Tue).toBeUndefined();
  });

  it("spreads the core subjects equally across the week", () => {
    for (let n = 1; n <= 7; n++) {
      const routine = buildRoutine(DAYS.slice(0, n));
      const counts = SUBJECT_IDS.map((s) => Object.values(routine).filter((x) => x?.includes(s)).length);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });

  it("with 4 study days, every subject comes up twice", () => {
    const routine = buildRoutine(["Mon", "Tue", "Thu", "Fri"]);
    for (const s of SUBJECT_IDS) expect(Object.values(routine).filter((x) => x?.includes(s))).toHaveLength(2);
  });
});

describe("daily drill", () => {
  it("has 15 questions per subject, 5 from each of 3 topics", () => {
    const topics = ["math-sets", "math-linear", "math-matrices"];
    const qs = buildDailyQuestions(topics, 42);
    expect(qs).toHaveLength(15);
    for (const t of topics) expect(qs.filter((q) => q.topicId === t)).toHaveLength(5);
  });
});

describe("topic practice", () => {
  it("has 10 questions from the chosen topic", () => {
    const qs = buildTopicQuestions("phy-forces", 7);
    expect(qs).toHaveLength(10);
    expect(qs.every((q) => q.topicId === "phy-forces")).toBe(true);
  });
});

describe("strikes", () => {
  it("first wrong answer allows a retry", () => {
    expect(outcomeAfterWrong(0)).toEqual({ strikes: 1, outcome: "retry" });
  });
  it("second wrong answer reveals the solution", () => {
    expect(outcomeAfterWrong(1)).toEqual({ strikes: 2, outcome: "reveal" });
  });
});

describe("question variations", () => {
  it("always gives 4 different options including the right answer", () => {
    for (const t of TOPICS) {
      for (let seed = 1; seed <= 150; seed++) {
        const q = generateQuestion(t.id, seed);
        expect(new Set(q.options).size, `${t.id} seed ${seed}`).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
