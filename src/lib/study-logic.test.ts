import { describe, expect, it } from "vitest";
import { DAYS, SUBJECT_IDS, buildRoutine, outcomeAfterWrong, type Day } from "./study-logic";
import { TOPICS, buildDailyQuestions, buildTopicQuestions, generateQuestion, topicsForGrade } from "./question-bank";

describe("weekly routine", () => {
  it("every chosen study day is Mathematics only", () => {
    const days: Day[] = ["Mon", "Wed", "Fri"];
    const routine = buildRoutine(days);
    for (const d of days) expect(routine[d]).toEqual(["math"]);
    expect(routine.Tue).toBeUndefined();
  });

  it("can still spread several subjects equally when given them", () => {
    for (let n = 1; n <= 7; n++) {
      const routine = buildRoutine(DAYS.slice(0, n), SUBJECT_IDS);
      const counts = SUBJECT_IDS.map((s) => Object.values(routine).filter((x) => x?.includes(s)).length);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });
});

describe("grade syllabus", () => {
  it("every grade has at least 3 Maths topics for the daily drill", () => {
    for (const g of [8, 9, 10, 11, 12]) expect(topicsForGrade("math", g).length).toBeGreaterThanOrEqual(3);
  });
  it("Vectors is a Grade 11-12 topic, not Grade 8", () => {
    expect(topicsForGrade("math", 8).map((t) => t.id)).not.toContain("math-vectors");
    expect(topicsForGrade("math", 12).map((t) => t.id)).toContain("math-vectors");
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
