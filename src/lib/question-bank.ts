// Past-paper style question templates. Each template varies numbers, wording
// and option order so learners can't memorise answers.
import {
  type Rng,
  type SubjectId,
  QUESTIONS_PER_TOPIC_DAILY,
  QUESTIONS_PER_TOPIC_SESSION,
  int,
  interleave,
  mulberry32,
  pick,
  shuffle,
} from "./study-logic";

export type Question = {
  id: string;
  topicId: string;
  prompt: string;
  options: string[];
  answer: number;
  hint: string;
  steps: string[];
  source: string;
};

type Draft = { prompt: string; correct: string; wrong: Array<string | number>; hint: string; steps: string[] };
type Template = (r: Rng) => Draft;
export type Topic = { id: string; subject: SubjectId; name: string; templates: Template[]; grades?: number[] };

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const sup = (n: number) => String(n).replace(/\d/g, (d) => SUP[Number(d)] ?? d).replace("-", "⁻");
const sub = (n: number) => String(n).replace(/\d/g, (d) => SUB[Number(d)] ?? d);
const alkane = (c: number, h: number) => `C${c === 1 ? "" : sub(c)}H${sub(h)}`;
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const units = (unit: string, values: number[]) => values.map((v) => `${v} ${unit}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Fact = { stems: string[]; a: string; hint: string; why: string; pool?: string[] };
const facts =
  (items: Fact[], pool: string[]): Template =>
  (r) => {
    const f = pick(r, items);
    return {
      prompt: pick(r, f.stems),
      correct: f.a,
      wrong: shuffle(r, (f.pool ?? pool).filter((x) => x !== f.a)),
      hint: f.hint,
      steps: [f.hint, f.why, `Answer: ${f.a}.`],
    };
  };

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (n: number, d: number) => {
  const g = gcd(n, d) || 1;
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
};

/* ---------------- Mathematics ---------------- */
const sets: Template = (r) => {
  const a = int(r, 12, 30), b = int(r, 10, 25), both = int(r, 3, Math.min(a, b) - 2), u = a + b - both;
  return {
    prompt: pick(r, [
      `In a class, ${a} learners take Art and ${b} take Music. ${both} take both. How many learners take at least one of the two?`,
      `Given that n(A) = ${a}, n(B) = ${b} and n(A ∩ B) = ${both}, find n(A ∪ B).`,
      `A survey found ${a} people like tea, ${b} like coffee and ${both} like both. How many like tea or coffee?`,
    ]),
    correct: String(u),
    wrong: [a + b, u - both, Math.max(a, b), u + 1, u - 1, u + 2],
    hint: "Anything in both sets gets counted twice when you add n(A) and n(B).",
    steps: ["n(A ∪ B) = n(A) + n(B) − n(A ∩ B)", `= ${a} + ${b} − ${both}`, `= ${u}`],
  };
};
const linear: Template = (r) => {
  const x = int(r, 2, 12), a = int(r, 2, 9), b = int(r, 1, 20), c = a * x + b;
  return {
    prompt: pick(r, [`Solve ${a}x + ${b} = ${c}.`, `Find the value of x if ${a}x + ${b} = ${c}.`, `Given that ${c} = ${a}x + ${b}, find x.`]),
    correct: `x = ${x}`,
    wrong: [x + 1, x - 1, x + 2, c - b, Math.round((c + b) / a)].map((v) => `x = ${v}`),
    hint: `Undo the + ${b} first, then divide by ${a}.`,
    steps: [`${a}x = ${c} − ${b}`, `${a}x = ${c - b}`, `x = ${c - b} ÷ ${a} = ${x}`],
  };
};
const indices: Template = (r) => {
  const v = pick(r, ["x", "a", "y", "m"]), m = int(r, 2, 8), n = int(r, 2, 8), p = int(r, 1, m + n - 1), e = m + n - p;
  const f = (k: number) => `${v}${sup(k)}`;
  return {
    prompt: pick(r, [`Simplify ${f(m)} × ${f(n)} ÷ ${f(p)}.`, `Express ${f(m)} × ${f(n)} ÷ ${f(p)} as a single power of ${v}.`]),
    correct: f(e),
    wrong: [m * n - p, m + n + p, e + 1, e - 1, m * n].map(f),
    hint: "Multiplying powers of the same base: add the indices. Dividing: subtract them.",
    steps: [`${f(m)} × ${f(n)} = ${f(m + n)}`, `${f(m + n)} ÷ ${f(p)} = ${f(e)}`],
  };
};
const vectors: Template = (r) => {
  const [p, q, m] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]] as const);
  const k = m > 15 ? 1 : int(r, 1, 2), x = p * k, y = q * k, mag = m * k;
  const v = pick(r, ["a", "b", "p", "AB"]);
  return {
    prompt: pick(r, [
      `Given that ${v} = (${x}, ${y}), find |${v}|.`,
      `Find the magnitude of the vector ${v} = (${x}, ${y}).`,
      `The column vector ${v} has components ${x} and ${y}. Calculate its length.`,
    ]),
    correct: String(mag),
    wrong: [x + y, x * x + y * y, Math.abs(y - x), mag + 1, mag - 1],
    hint: "The magnitude is the length of the arrow — use Pythagoras on the two components.",
    steps: [`|${v}| = √(${x}² + ${y}²)`, `= √(${x * x} + ${y * y}) = √${x * x + y * y}`, `= ${mag}`],
  };
};
const probability: Template = (r) => {
  const red = int(r, 2, 9), blue = int(r, 2, 9), green = int(r, 1, 6), t = red + blue + green;
  const correct = frac(red, t);
  return {
    prompt: pick(r, [
      `A bag contains ${red} red, ${blue} blue and ${green} green balls. One ball is picked at random. Find the probability that it is red.`,
      `A box holds ${red} red pens, ${blue} blue pens and ${green} green pens. A pen is taken at random. What is P(red)?`,
    ]),
    correct,
    wrong: [frac(blue, t), frac(green, t), frac(t - red, t), `${red}/${blue + green}`, `1/${red}`, frac(red + 1, t)].filter((w) => w !== correct),
    hint: "Probability = number of ways it can happen ÷ total number of outcomes.",
    steps: [`Total balls = ${red} + ${blue} + ${green} = ${t}`, `P(red) = ${red}/${t}`, `= ${correct}`],
  };
};
const matrices: Template = (r) => {
  let a = 1, b = 1, c = 1, d = 1;
  do {
    a = int(r, 1, 9); b = int(r, 1, 9); c = int(r, 1, 9); d = int(r, 1, 9);
  } while (a * d === b * c);
  const det = a * d - b * c;
  return {
    prompt: `${pick(r, ["Find the determinant of the matrix", "Calculate the determinant of", "Evaluate the determinant of"])}\n( ${a}   ${b} )\n( ${c}   ${d} )`,
    correct: String(det),
    wrong: [a * d + b * c, a * c - b * d, b * c - a * d, det + 1, det - 1],
    hint: "For the matrix (a b / c d), the determinant is ad − bc.",
    steps: [`det = (${a} × ${d}) − (${b} × ${c})`, `= ${a * d} − ${b * c}`, `= ${det}`],
  };
};
const trig: Template = (r) => {
  const [o, adj, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [4, 3, 5], [12, 5, 13]] as const);
  const fn = pick(r, ["sin", "cos", "tan"] as const);
  const all = { sin: `${o}/${h}`, cos: `${adj}/${h}`, tan: `${o}/${adj}` };
  return {
    prompt: `In a right-angled triangle, the side opposite angle θ is ${o} cm, the adjacent side is ${adj} cm and the hypotenuse is ${h} cm. Find ${fn} θ.`,
    correct: all[fn],
    wrong: [...Object.values(all), `${h}/${o}`, `${h}/${adj}`, `${adj}/${o}`],
    hint: "SOH CAH TOA: sin = opp/hyp, cos = adj/hyp, tan = opp/adj.",
    steps: [fn === "sin" ? "sin θ = opposite ÷ hypotenuse" : fn === "cos" ? "cos θ = adjacent ÷ hypotenuse" : "tan θ = opposite ÷ adjacent", `= ${all[fn]}`],
  };
};
const mean: Template = (r) => {
  const m = int(r, 30, 50);
  const d = [int(r, -6, 6), int(r, -6, 6), int(r, -6, 6), int(r, -6, 6)];
  const vals = [...d, -d.reduce((s, x) => s + x, 0)].map((x) => m + x);
  const sum = vals.reduce((s, x) => s + x, 0);
  return {
    prompt: pick(r, [`Find the mean of ${vals.join(", ")}.`, `The marks of five learners were ${vals.join(", ")}. Calculate the mean mark.`]),
    correct: String(m),
    wrong: [m + 1, m - 1, m + 2, Math.round(sum / 4), sum],
    hint: "Mean = total of the values ÷ number of values.",
    steps: [`Total = ${vals.join(" + ")} = ${sum}`, `Mean = ${sum} ÷ 5 = ${m}`],
  };
};

/* ------- Mathematics: Grade 11 ECZ syllabus topics ------- */
const ord = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);
const sgn = (v: number) => (v >= 0 ? `+ ${v}` : `− ${-v}`);
const fr = (n: number, d: number) => (d < 0 ? frac(-n, -d) : frac(n, d));
const pair = (x: number, y: number) => `(${x}, ${y})`;

const sequences: Template = (r) => {
  const a = int(r, 2, 9), d = int(r, 2, 7), n = int(r, 8, 15);
  const t = a + (n - 1) * d;
  return {
    prompt: pick(r, [
      `Find the ${ord(n)} term of the sequence ${a}, ${a + d}, ${a + 2 * d}, …`,
      `The first three terms of an arithmetic sequence are ${a}, ${a + d} and ${a + 2 * d}. What is its ${ord(n)} term?`,
    ]),
    correct: String(t),
    wrong: [t + d, t - d, t + 1, t - 1],
    hint: "The nth term of an arithmetic sequence is a + (n − 1)d.",
    steps: [`a = ${a}, d = ${d}`, `T${n} = ${a} + (${n} − 1) × ${d}`, `= ${a} + ${(n - 1) * d} = ${t}`],
  };
};
const seriesSum: Template = (r) => {
  const a = int(r, 2, 9), d = int(r, 1, 6), n = int(r, 3, 8) * 2;
  const S = (n * (2 * a + (n - 1) * d)) / 2;
  return {
    prompt: pick(r, [
      `Find the sum of the first ${n} terms of the arithmetic sequence whose first term is ${a} and common difference is ${d}.`,
      `An arithmetic sequence starts at ${a} and increases by ${d} each time. Calculate the sum of its first ${n} terms.`,
    ]),
    correct: String(S),
    wrong: [S + n, S - d, S + a, n * (2 * a + (n - 1) * d)],
    hint: "Sum = n/2 × [2a + (n − 1)d].",
    steps: ["S = n/2 × [2a + (n − 1)d]", `= ${n}/2 × [${2 * a} + (${n} − 1) × ${d}]`, `= ${S}`],
  };
};
const mensuration: Template = (r) => {
  const kind = pick(r, ["volume", "area", "circumference"] as const);
  const rad = int(r, 2, 9), h = int(r, 3, 12);
  if (kind === "volume")
    return {
      prompt: `A cylinder has radius ${rad} cm and height ${h} cm. Calculate its volume in terms of π.`,
      correct: `${rad * rad * h}π cm³`,
      wrong: [`${2 * rad * rad * h}π cm³`, `${rad * h}π cm³`, `${rad * rad}π cm³`, `${rad * rad * (h + 1)}π cm³`],
      hint: "Volume of a cylinder = πr²h.",
      steps: ["V = πr²h", `= π × ${rad}² × ${h}`, `= ${rad * rad * h}π cm³`],
    };
  if (kind === "area")
    return {
      prompt: `A circle has radius ${rad} cm. Calculate its area in terms of π.`,
      correct: `${rad * rad}π cm²`,
      wrong: [`${2 * rad}π cm²`, `${4 * rad * rad}π cm²`, `${rad}π cm²`, `${2 * rad * rad}π cm²`],
      hint: "Area of a circle = πr².",
      steps: ["A = πr²", `= π × ${rad}²`, `= ${rad * rad}π cm²`],
    };
  return {
    prompt: `A circle has radius ${rad} cm. Calculate its circumference in terms of π.`,
    correct: `${2 * rad}π cm`,
    wrong: [`${rad * rad}π cm`, `${rad}π cm`, `${4 * rad}π cm`, `${2 * rad * rad}π cm`],
    hint: "Circumference = 2πr.",
    steps: ["C = 2πr", `= 2 × π × ${rad}`, `= ${2 * rad}π cm`],
  };
};
const cuboid: Template = (r) => {
  const l = int(r, 2, 9), w = int(r, 2, 9), h = int(r, 2, 9);
  const total = 2 * (l * w + w * h + l * h);
  return {
    prompt: `A closed rectangular tank measures ${l} cm by ${w} cm by ${h} cm. Calculate its total surface area.`,
    correct: `${total} cm²`,
    wrong: [`${l * w * h} cm²`, `${l * w + w * h + l * h} cm²`, `${2 * (l * w + w * h)} cm²`, `${total + 2} cm²`],
    hint: "A closed box has 6 faces: two of each size.",
    steps: ["Surface area = 2(lw + wh + lh)", `= 2(${l * w} + ${w * h} + ${l * h})`, `= ${total} cm²`],
  };
};
const quadraticEq: Template = (r) => {
  let p = int(r, -9, 9), q = int(r, -9, 9);
  while (p === 0 || q === 0 || p === q || Math.abs(p + q) < 2) {
    p = int(r, -9, 9);
    q = int(r, -9, 9);
  }
  const b = -(p + q), c = p * q;
  const lo = Math.min(p, q), hi = Math.max(p, q);
  const eq = `x² ${sgn(b)}x ${sgn(c)} = 0`;
  return {
    prompt: pick(r, [`Solve the equation ${eq}.`, `Find the values of x that satisfy ${eq}.`]),
    correct: `x = ${lo} or x = ${hi}`,
    wrong: [`x = ${-lo} or x = ${-hi}`, `x = ${lo} or x = ${-hi}`, `x = ${-lo} or x = ${hi}`, `x = ${lo + 1} or x = ${hi - 1}`],
    hint: "Factorise so that the product of the two brackets is zero.",
    steps: [`(x ${sgn(-lo)})(x ${sgn(-hi)}) = 0`, `x = ${lo} or x = ${hi}`],
  };
};
const rootSumProduct: Template = (r) => {
  let p = int(r, -8, 8), q = int(r, -8, 8);
  while (p === 0 || q === 0 || p === q || Math.abs(p + q) < 2) {
    p = int(r, -8, 8);
    q = int(r, -8, 8);
  }
  const sum = p + q, prod = p * q, b = -sum, c = prod;
  const askSum = r() < 0.5;
  const eq = `x² ${sgn(b)}x ${sgn(c)} = 0`;
  return {
    prompt: askSum
      ? pick(r, [`Without solving, find the sum of the roots of ${eq}.`, `What is the sum of the roots of ${eq}?`])
      : pick(r, [`Without solving, find the product of the roots of ${eq}.`, `What is the product of the roots of ${eq}?`]),
    correct: String(askSum ? sum : prod),
    wrong: askSum ? [String(-sum), String(prod), String(c + 1), String(sum + 1)] : [String(sum), String(-prod), String(b), String(prod + 1)],
    hint: "For x² + bx + c = 0: sum of roots = −b and product of roots = c.",
    steps: [`Here b = ${b} and c = ${c}.`, askSum ? `Sum = −b = ${sum}` : `Product = c = ${prod}`],
  };
};
const relations: Template = (r) => {
  const a = int(r, 2, 9), b = int(r, -9, 9), k = int(r, 2, 9);
  const f = a * k + b;
  const fx = `${a}x ${sgn(b)}`;
  return {
    prompt: pick(r, [`If f(x) = ${fx}, find f(${k}).`, `Given that f(x) = ${fx}, what is the value of f(${k})?`]),
    correct: String(f),
    wrong: [String(a * k - b), String(a * (k + 1) + b), String(a + b), String(f + a)],
    hint: "Substitute the value of x into the formula.",
    steps: [`f(${k}) = ${a}(${k}) ${sgn(b)}`, `= ${a * k} ${sgn(b)}`, `= ${f}`],
  };
};
const solveFn: Template = (r) => {
  const a = int(r, 2, 6), b = int(r, -9, 9), x = int(r, 2, 9), c = a * x + b;
  return {
    prompt: `If f(x) = ${a}x ${sgn(b)} and f(x) = ${c}, find the value of x.`,
    correct: `x = ${x}`,
    wrong: [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${x + 2}`, `x = ${c - b}`],
    hint: "Set the formula equal to the value, then undo the operations.",
    steps: [`${a}x ${sgn(b)} = ${c}`, `${a}x = ${c - b}`, `x = ${x}`],
  };
};
const relPairs: Template = (r) => {
  const xs = shuffle(r, [1, 3, 5, 7, 9]).slice(0, 3);
  const ys = shuffle(r, [2, 4, 6, 8, 10]).slice(0, 3);
  const set = (arr: number[]) => `{ ${[...arr].sort((p, q) => p - q).join(", ")} }`;
  const pairs = xs.map((x, i) => pair(x, ys[i]!)).join(", ");
  return {
    prompt: `A relation is given by R = { ${pairs} }. Write down the range of R.`,
    correct: set(ys),
    wrong: [set(xs), set([...ys.slice(0, 2), pick(r, [12, 14, 16])]), set([...xs, 12])],
    hint: "The range is the set of second coordinates of the ordered pairs.",
    steps: [`Second coordinates: ${ys.join(", ")}`, `Range = ${set(ys)}`],
  };
};
const variation: Template = (r) => {
  if (r() < 0.5) {
    const k = int(r, 2, 8), x1 = int(r, 2, 6), y1 = k * x1, x2 = int(r, 2, 9), y2 = k * x2;
    return {
      prompt: `y varies directly as x. If y = ${y1} when x = ${x1}, find y when x = ${x2}.`,
      correct: String(y2),
      wrong: [String(y1 * x2), String(y2 + k), String(y2 - k), String(k + x2)],
      hint: "Direct variation means y = kx. Find k first.",
      steps: [`k = y ÷ x = ${y1} ÷ ${x1} = ${k}`, `y = ${k} × ${x2} = ${y2}`],
    };
  }
  const x1 = int(r, 2, 6), y1 = int(r, 2, 9), k = x1 * y1;
  const divisors = Array.from({ length: 11 }, (_, i) => i + 2).filter((d) => k % d === 0 && d !== x1);
  const x2 = pick(r, divisors.length ? divisors : [k]);
  const y2 = k / x2;
  return {
    prompt: `y varies inversely as x. If y = ${y1} when x = ${x1}, find y when x = ${x2}.`,
    correct: String(y2),
    wrong: [String(y1 * x2), String(y2 + 1), String(y2 - 1), String(k - x2)],
    hint: "Inverse variation means y = k ÷ x, so xy stays constant.",
    steps: [`k = x × y = ${x1} × ${y1} = ${k}`, `y = ${k} ÷ ${x2} = ${y2}`],
  };
};
const jointVariation: Template = (r) => {
  const k = int(r, 1, 4), x1 = int(r, 2, 4), y1 = k * x1 * x1, x2 = int(r, 2, 6), y2 = k * x2 * x2;
  return {
    prompt: `y varies directly as the square of x. If y = ${y1} when x = ${x1}, find y when x = ${x2}.`,
    correct: String(y2),
    wrong: [String(k * x2), String(y1 * x2), String(y2 + k), String(y2 - k)],
    hint: "y = kx². Use the first pair of values to find k.",
    steps: [`k = y ÷ x² = ${y1} ÷ ${x1 * x1} = ${k}`, `y = ${k} × ${x2}² = ${y2}`],
  };
};
const gradient: Template = (r) => {
  const dx = int(r, 1, 6);
  const dy = pick(r, [-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8].filter((v) => Math.abs(v) !== dx));
  const x1 = int(r, -6, 4), y1 = int(r, -6, 4);
  const x2 = x1 + dx, y2 = y1 + dy;
  const correct = fr(dy, dx);
  return {
    prompt: `Find the gradient of the line joining ${pair(x1, y1)} and ${pair(x2, y2)}.`,
    correct,
    wrong: [fr(dx, dy), fr(-dy, dx), fr(dy + 1, dx), fr(dy, dx + 1)],
    hint: "Gradient = change in y ÷ change in x.",
    steps: [`m = (${y2} − ${y1}) ÷ (${x2} − ${x1})`, `= ${dy} ÷ ${dx}`, `= ${correct}`],
  };
};
const midpoint: Template = (r) => {
  const x1 = int(r, -6, 4), y1 = int(r, -6, 4);
  const dx = int(r, 1, 5) * 2, dy = int(r, 1, 5) * 2;
  const x2 = x1 + dx, y2 = y1 + dy;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return {
    prompt: `Find the midpoint of the line segment joining ${pair(x1, y1)} and ${pair(x2, y2)}.`,
    correct: pair(mx, my),
    wrong: [pair(x1 + x2, y1 + y2), pair(x2, y2), pair(x1, y1), pair(mx + 1, my)],
    hint: "The midpoint is the average of the x-coordinates and the average of the y-coordinates.",
    steps: [`M = ((${x1} + ${x2}) ÷ 2, (${y1} + ${y2}) ÷ 2)`, `= ${pair(mx, my)}`],
  };
};
const coordDistance: Template = (r) => {
  const [p, q, m] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]] as const);
  const x1 = int(r, -5, 5), y1 = int(r, -5, 5);
  const x2 = x1 + p, y2 = y1 + q;
  return {
    prompt: `Calculate the distance between the points ${pair(x1, y1)} and ${pair(x2, y2)}.`,
    correct: `${m} units`,
    wrong: [`${p + q} units`, `${m + 1} units`, `${m - 1} units`, `${Math.abs(q - p)} units`],
    hint: "Distance = √((x₂ − x₁)² + (y₂ − y₁)²).",
    steps: [`d = √(${p}² + ${q}²)`, `= √(${p * p} + ${q * q})`, `= ${m} units`],
  };
};
const circleAngles: Template = (r) => {
  if (r() < 0.5) {
    const c = int(r, 2, 30) * 4;
    return {
      prompt: `In a circle, the angle at the centre standing on an arc is ${c}°. Find the angle at the circumference standing on the same arc.`,
      correct: `${c / 2}°`,
      wrong: [`${c}°`, `${180 - c}°`, `${c * 2}°`, `${c / 2 + 5}°`],
      hint: "The angle at the centre is twice the angle at the circumference.",
      steps: ["Angle at centre = 2 × angle at circumference", `= ${c} ÷ 2 = ${c / 2}°`],
    };
  }
  const a = int(r, 6, 17) * 10;
  return {
    prompt: `A cyclic quadrilateral has one of its angles equal to ${a}°. Find the angle opposite to it.`,
    correct: `${180 - a}°`,
    wrong: [`${a}°`, `${360 - a}°`, `${90 - a / 2}°`, `${180 - a + 10}°`],
    hint: "Opposite angles of a cyclic quadrilateral add up to 180°.",
    steps: ["Opposite angles are supplementary", `= 180° − ${a}° = ${180 - a}°`],
  };
};
const CIRCLE_POOL = ["Equal", "Twice", "Half", "180°", "90°", "360°"];
const circleFacts = facts(
  [
    { stems: ["The angle in a semicircle is…", "What is the angle in a semicircle?"], a: "90°", hint: "It is a right angle.", why: "Thales' theorem: the angle in a semicircle is 90°." },
    { stems: ["The angle between a tangent and the radius at the point of contact is…"], a: "90°", hint: "The tangent meets the radius squarely.", why: "A tangent is perpendicular to the radius at the point of contact." },
    { stems: ["Angles in the same segment of a circle are…"], a: "Equal", hint: "They stand on the same arc.", why: "Angles in the same segment are equal." },
    { stems: ["Opposite angles of a cyclic quadrilateral add up to…"], a: "180°", hint: "They are supplementary.", why: "Opposite angles of a cyclic quadrilateral sum to 180°." },
    { stems: ["The angle at the centre of a circle is … the angle at the circumference standing on the same arc."], a: "Twice", hint: "The centre angle is the bigger one.", why: "Angle at centre = 2 × angle at circumference." },
  ],
  CIRCLE_POOL,
);
const quadraticFn: Template = (r) => {
  const p = int(r, -6, 6), q = int(r, -8, 8);
  const form = `y = (x ${sgn(-p)})² ${sgn(q)}`;
  return {
    prompt: pick(r, [`The curve has equation ${form}. What is the minimum value of y?`, `For the curve ${form}, find the least possible value of y.`]),
    correct: String(q),
    wrong: [String(p), String(-p), String(-q), String(p + q)],
    hint: "A squared term is never negative, so its smallest value is 0.",
    steps: [`(${sgn(-p)})² ≥ 0 for every x`, `So the smallest y is ${q}, when x = ${p}.`],
  };
};
const quadraticIntercepts: Template = (r) => {
  let p = int(r, -8, 8), q = int(r, -8, 8);
  while (p === 0 || q === 0 || p === q) {
    p = int(r, -8, 8);
    q = int(r, -8, 8);
  }
  const lo = Math.min(p, q), hi = Math.max(p, q);
  const form = `y = (x ${sgn(-p)})(x ${sgn(-q)})`;
  return {
    prompt: `The curve has equation ${form}. Where does the curve cross the x-axis?`,
    correct: `x = ${lo} and x = ${hi}`,
    wrong: [`x = ${-lo} and x = ${-hi}`, `x = ${lo} and x = ${-hi}`, `x = ${-lo} and x = ${hi}`, `x = ${lo + 1} and x = ${hi - 1}`],
    hint: "The curve crosses the x-axis where y = 0.",
    steps: [`Set (x ${sgn(-p)})(x ${sgn(-q)}) = 0`, `x = ${lo} and x = ${hi}`],
  };
};
const approxSf: Template = (r) => {
  const v = int(r, 1024, 9876) / 100;
  const correct = String(Number(v.toPrecision(3)));
  return {
    prompt: `Correct ${v} to three significant figures.`,
    correct,
    wrong: [String(Number(v.toPrecision(2))), String(Number(v.toPrecision(4))), String(Number((v + 0.1).toPrecision(3))), String(Number(v.toPrecision(5)))],
    hint: "Count significant figures from the first non-zero digit.",
    steps: [`Count three significant figures from the first non-zero digit of ${v}.`, `The next digit decides whether to round up.`, `Answer: ${correct}.`],
  };
};
const approxDp: Template = (r) => {
  const v = int(r, 10241, 98769) / 1000;
  const n = int(r, 1, 2);
  const correct = v.toFixed(n);
  return {
    prompt: `Write ${v} correct to ${n} decimal place${n > 1 ? "s" : ""}.`,
    correct,
    wrong: [v.toFixed(n + 1), v.toFixed(n + 2), (v + 0.05).toFixed(n), String(Math.round(v))],
    hint: "Look at the digit after the one you are rounding to.",
    steps: [`Keep ${n} digit${n > 1 ? "s" : ""} after the decimal point of ${v}.`, `Answer: ${correct}.`],
  };
};
const LOCI = ["A circle", "The perpendicular bisector of the line joining the points", "A straight line parallel to the given line", "The bisector of the angle", "A pair of intersecting lines"];
const INSTRUMENTS = ["A compass and a ruler", "A protractor and a ruler", "A set square and a protractor", "A ruler and a pencil"];
const ARC_RADII = ["More than half the length of the segment", "Exactly half the length of the segment", "Less than half the length of the segment", "Equal to the whole segment"];
const construction = facts(
  [
    { stems: ["Which instruments are needed to bisect an angle?", "Which pair of instruments is used to construct the bisector of an angle?"], a: "A compass and a ruler", hint: "You draw arcs, then join them with a straight line.", why: "Arcs are drawn with a compass and the line is ruled with a straightedge.", pool: INSTRUMENTS },
    { stems: ["The locus of points equidistant from two fixed points is…"], a: "The perpendicular bisector of the line joining the points", hint: "Every point on it is the same distance from both points.", why: "Points equidistant from two fixed points lie on the perpendicular bisector.", pool: LOCI },
    { stems: ["The locus of points at a fixed distance from a fixed point is…"], a: "A circle", hint: "Think of a string tied to a pin.", why: "A circle is the set of points a fixed distance from a centre.", pool: LOCI },
    { stems: ["To bisect a line segment with arcs, the radius of each arc must be…"], a: "More than half the length of the segment", hint: "The arcs have to cross each other.", why: "Arcs only intersect when the radius is greater than half the segment.", pool: ARC_RADII },
    { stems: ["Which instrument is used to measure an angle in a construction?", "Which instrument is used to check the size of an angle?"], a: "A protractor", hint: "It has degrees marked round a half-circle.", why: "A protractor measures angles in degrees.", pool: INSTRUMENTS },
  ],
  LOCI,
);

/* ---------------- Physics ---------------- */
const speed: Template = (r) => {
  const v = int(r, 2, 15), t = int(r, 2, 12), d = v * t;
  return {
    prompt: pick(r, [`A cyclist travels ${d} m in ${t} s. Calculate the average speed.`, `A car covers ${d} m in ${t} seconds. What is its average speed?`]),
    correct: `${v} m/s`,
    wrong: units("m/s", [d * t, v + 2, v * 2, v + 1, t]),
    hint: "Speed = distance ÷ time.",
    steps: [`speed = ${d} m ÷ ${t} s`, `= ${v} m/s`],
  };
};
const distance: Template = (r) => {
  const v = int(r, 2, 12), t = int(r, 3, 15), d = v * t;
  return {
    prompt: `A runner moves at a steady ${v} m/s for ${t} s. How far does she travel?`,
    correct: `${d} m`,
    wrong: units("m", [v + t, d + v, d * 2, d - t, d + t]),
    hint: "Distance = speed × time.",
    steps: [`distance = ${v} m/s × ${t} s`, `= ${d} m`],
  };
};
const force: Template = (r) => {
  const m = int(r, 2, 20), a = int(r, 2, 10), F = m * a;
  return {
    prompt: pick(r, [`A ${m} kg box accelerates at ${a} m/s². What resultant force acts on it?`, `Calculate the force needed to give a ${m} kg mass an acceleration of ${a} m/s².`]),
    correct: `${F} N`,
    wrong: units("N", [m + a, F + a, F * 2, F + m, F - a]),
    hint: "Newton's second law: F = ma.",
    steps: ["F = m × a", `= ${m} × ${a}`, `= ${F} N`],
  };
};
const potential: Template = (r) => {
  const m = int(r, 2, 10), h = int(r, 2, 20), E = 10 * m * h;
  return {
    prompt: pick(r, [`A ${m} kg object is lifted through ${h} m. Find its gain in potential energy. (g = 10 N/kg)`, `How much potential energy does a ${m} kg mass gain when raised ${h} m? (g = 10 N/kg)`]),
    correct: `${E} J`,
    wrong: units("J", [m * h, 10 * m + h, 10 * h, 2 * E, E + 10]),
    hint: "Potential energy = mgh.",
    steps: ["PE = m × g × h", `= ${m} × 10 × ${h}`, `= ${E} J`],
  };
};
const kinetic: Template = (r) => {
  const m = int(r, 1, 10) * 2, v = int(r, 2, 10), KE = (m * v * v) / 2;
  return {
    prompt: `A ${m} kg trolley moves at ${v} m/s. Calculate its kinetic energy.`,
    correct: `${KE} J`,
    wrong: units("J", [m * v, m * v * v, KE + m, (m * v) / 2, KE + 10]),
    hint: "Kinetic energy = ½mv².",
    steps: ["KE = ½ × m × v²", `= ½ × ${m} × ${v}²`, `= ${KE} J`],
  };
};
const ohmV: Template = (r) => {
  const I = int(r, 2, 6), R = int(r, 2, 12), V = I * R;
  return {
    prompt: pick(r, [`A current of ${I} A flows through a ${R} Ω resistor. Find the potential difference across it.`, `What voltage drives ${I} A through a ${R} Ω resistor?`]),
    correct: `${V} V`,
    wrong: units("V", [I + R, V * 2, V + I, R, V + 1]),
    hint: "Ohm's law: V = IR.",
    steps: ["V = I × R", `= ${I} × ${R}`, `= ${V} V`],
  };
};
const ohmR: Template = (r) => {
  const I = int(r, 1, 6), R = int(r, 2, 12), V = I * R;
  return {
    prompt: `A ${V} V supply drives a current of ${I} A through a resistor. What is its resistance?`,
    correct: `${R} Ω`,
    wrong: units("Ω", [V * I, V + I, R + 1, R * 2, V]),
    hint: "Rearrange Ohm's law: R = V ÷ I.",
    steps: ["R = V ÷ I", `= ${V} ÷ ${I}`, `= ${R} Ω`],
  };
};
const pressure: Template = (r) => {
  const P = int(r, 5, 50), A = int(r, 2, 8), F = P * A;
  return {
    prompt: pick(r, [`A force of ${F} N acts on an area of ${A} m². Calculate the pressure.`, `A crate weighing ${F} N rests on a base of ${A} m². What pressure does it exert?`]),
    correct: `${P} Pa`,
    wrong: units("Pa", [F * A, P + A, F - A, P * 2, P + 1]),
    hint: "Pressure = force ÷ area.",
    steps: ["P = F ÷ A", `= ${F} ÷ ${A}`, `= ${P} Pa`],
  };
};
const waves: Template = (r) => {
  const f = int(r, 2, 20), l = int(r, 2, 10), v = f * l;
  return {
    prompt: pick(r, [`A wave of frequency ${f} Hz has a wavelength of ${l} m. Find its speed.`, `Water waves have wavelength ${l} m and frequency ${f} Hz. How fast do they travel?`]),
    correct: `${v} m/s`,
    wrong: units("m/s", [f + l, v * 2, v + 10, f, l]),
    hint: "Wave speed = frequency × wavelength.",
    steps: ["v = f × λ", `= ${f} × ${l}`, `= ${v} m/s`],
  };
};

/* ---------------- Chemistry ---------------- */
const ELEMENTS = [["sodium", 11, 23], ["magnesium", 12, 24], ["aluminium", 13, 27], ["chlorine", 17, 35], ["potassium", 19, 39], ["calcium", 20, 40], ["carbon", 6, 12], ["oxygen", 8, 16], ["nitrogen", 7, 14], ["fluorine", 9, 19]] as const;
const atomic: Template = (r) => {
  const [name, Z, A] = pick(r, ELEMENTS);
  const ask = pick(r, ["neutrons", "electrons", "protons"] as const);
  if (ask === "neutrons")
    return {
      prompt: `An atom of ${name} has atomic number ${Z} and mass number ${A}. How many neutrons does it have?`,
      correct: String(A - Z),
      wrong: [A, Z, A + Z, A - Z + 1, A - Z - 1],
      hint: "Mass number counts protons + neutrons.",
      steps: ["Neutrons = mass number − atomic number", `= ${A} − ${Z}`, `= ${A - Z}`],
    };
  return {
    prompt: `A neutral atom of ${name} has atomic number ${Z} and mass number ${A}. How many ${ask} does it have?`,
    correct: String(Z),
    wrong: [A - Z, A, A + Z, Z + 1, Z - 1],
    hint: "The atomic number is the number of protons. A neutral atom has equal protons and electrons.",
    steps: ["Atomic number = number of protons", "Neutral atom: electrons = protons", `= ${Z}`],
  };
};
const IONIC = ["NaCl", "MgO", "CaCl₂", "KBr", "Na₂O"];
const COVALENT = ["H₂O", "CO₂", "CH₄", "NH₃", "HCl"];
const bonding: Template = (r) => {
  const ionic = r() < 0.5;
  const correct = pick(r, ionic ? IONIC : COVALENT);
  return {
    prompt: ionic
      ? pick(r, ["Which of these compounds is ionic?", "Which substance is held together by ionic bonds?"])
      : pick(r, ["Which of these compounds is covalent?", "Which substance is made of molecules with covalent bonds?"]),
    correct,
    wrong: shuffle(r, ionic ? COVALENT : IONIC),
    hint: "Ionic bonds form between a metal and a non-metal; covalent bonds form between non-metals.",
    steps: ["Look for a metal in each formula.", ionic ? `${correct} contains a metal bonded to a non-metal, so it is ionic.` : `${correct} contains only non-metals, so it is covalent.`],
  };
};
const PH = [
  { label: "Strongly acidic", values: [1, 2] },
  { label: "Weakly acidic", values: [4, 5, 6] },
  { label: "Neutral", values: [7] },
  { label: "Weakly alkaline", values: [8, 9, 10] },
  { label: "Strongly alkaline", values: [12, 13, 14] },
];
const acids: Template = (r) => {
  const g = pick(r, PH), p = pick(r, g.values);
  return {
    prompt: pick(r, [`A solution has a pH of ${p}. How would you describe it?`, `Universal indicator shows that a solution has pH ${p}. The solution is…`]),
    correct: g.label,
    wrong: shuffle(r, PH.map((x) => x.label).filter((l) => l !== g.label)),
    hint: "pH 7 is neutral. Below 7 is acidic, above 7 is alkaline — the further from 7, the stronger.",
    steps: ["pH 7 = neutral", p < 7 ? `${p} is below 7, so it is acidic.` : p > 7 ? `${p} is above 7, so it is alkaline.` : "It is exactly 7.", `Answer: ${g.label}.`],
  };
};
const COMPOUNDS = [["water", "H₂O", 18], ["carbon dioxide", "CO₂", 44], ["sodium hydroxide", "NaOH", 40], ["calcium carbonate", "CaCO₃", 100], ["methane", "CH₄", 16], ["magnesium oxide", "MgO", 40]] as const;
const moles: Template = (r) => {
  const [name, f, M] = pick(r, COMPOUNDS), n = int(r, 1, 5), m = n * M;
  return {
    prompt: pick(r, [`How many moles are in ${m} g of ${name} (${f})? (Mr = ${M})`, `Calculate the number of moles in ${m} g of ${f}. (Relative formula mass = ${M})`]),
    correct: `${n} mol`,
    wrong: units("mol", [n + 1, n * 2, n + 0.5, m, M]),
    hint: "Moles = mass ÷ molar mass.",
    steps: ["n = mass ÷ Mr", `= ${m} ÷ ${M}`, `= ${n} mol`],
  };
};
const periodic: Template = (r) => {
  const v = int(r, 1, 7), inner = pick(r, [[2], [2, 8]] as const), arr = [...inner, v].join(",");
  return {
    prompt: pick(r, [`An element has the electron arrangement ${arr}. In which group of the Periodic Table is it?`, `Element X has the electronic configuration ${arr}. Which group does X belong to?`]),
    correct: `Group ${ROMAN[v]}`,
    wrong: shuffle(r, [1, 2, 3, 4, 5, 6, 7].filter((k) => k !== v)).map((k) => `Group ${ROMAN[k]}`),
    hint: "The number of electrons in the outermost shell gives the group number.",
    steps: [`The outer shell holds ${v} electron${v > 1 ? "s" : ""}.`, `So the element is in Group ${ROMAN[v]}.`],
  };
};
const ALKANES = ["", "methane", "ethane", "propane", "butane", "pentane", "hexane"];
const organic: Template = (r) => {
  const n = int(r, 2, 6), h = 2 * n + 2, name = ALKANES[n] ?? "ethane";
  return {
    prompt: pick(r, [`What is the molecular formula of ${name}?`, `${cap(name)} is an alkane with ${n} carbon atoms. What is its molecular formula?`]),
    correct: alkane(n, h),
    wrong: [alkane(n, 2 * n), alkane(n, 2 * n - 2), alkane(n + 1, h), alkane(n - 1, h)],
    hint: "Alkanes follow the general formula CₙH₂ₙ₊₂.",
    steps: [`n = ${n}`, `H = 2(${n}) + 2 = ${h}`, `Formula: ${alkane(n, h)}`],
  };
};

/* ---------------- Biology ---------------- */
const cells = facts(
  [
    { stems: ["Which organelle is the site of aerobic respiration?", "Name the part of a cell where most energy is released from glucose."], a: "Mitochondrion", hint: "Think of the cell's powerhouse.", why: "Aerobic respiration mostly happens inside mitochondria." },
    { stems: ["Which part of the cell controls all its activities?", "Which structure contains the chromosomes that control the cell?"], a: "Nucleus", hint: "It holds the genetic material.", why: "The nucleus contains DNA, which controls the cell." },
    { stems: ["Where does photosynthesis take place in a leaf cell?", "Which organelle contains chlorophyll?"], a: "Chloroplast", hint: "It is green and only found in plant cells.", why: "Chloroplasts contain chlorophyll that traps light." },
    { stems: ["Which organelle is the site of protein synthesis?", "Where are proteins made in a cell?"], a: "Ribosome", hint: "Tiny structures, often attached to the endoplasmic reticulum.", why: "Ribosomes join amino acids into proteins." },
    { stems: ["Which structure controls what enters and leaves a cell?", "Which part of the cell is partially permeable?"], a: "Cell membrane", hint: "Found in both plant and animal cells, around the cytoplasm.", why: "The cell membrane is partially permeable." },
    { stems: ["Which structure gives a plant cell its fixed shape?", "Which part of a plant cell is made of cellulose?"], a: "Cell wall", hint: "Animal cells don't have one.", why: "The cellulose cell wall supports the plant cell." },
  ],
  ["Mitochondrion", "Nucleus", "Chloroplast", "Ribosome", "Cell membrane", "Cell wall", "Vacuole"],
);
const REAGENTS = ["Iodine solution", "Benedict's solution", "Biuret reagent", "Ethanol"];
const FOODS = ["Starch", "Reducing sugar", "Protein", "Fat"];
const foodTests = facts(
  [
    { stems: ["Which reagent is used to test for starch?", "A learner wants to check a potato for starch. Which reagent should she use?"], a: "Iodine solution", hint: "A positive result turns blue-black.", why: "Iodine turns blue-black with starch.", pool: REAGENTS },
    { stems: ["Which reagent is used to test for reducing sugar?", "Which solution, when heated with glucose, gives a brick-red precipitate?"], a: "Benedict's solution", hint: "It must be heated in a water bath.", why: "Benedict's solution turns brick-red with reducing sugars.", pool: REAGENTS },
    { stems: ["Which reagent is used to test for protein?", "Which reagent turns purple when added to egg white?"], a: "Biuret reagent", hint: "A positive result is purple / violet.", why: "Biuret reagent turns purple with protein.", pool: REAGENTS },
    { stems: ["A food sample turns blue-black with iodine solution. Which food is present?"], a: "Starch", hint: "Blue-black is the iodine test result.", why: "Iodine turns blue-black only with starch.", pool: FOODS },
    { stems: ["A cloudy white emulsion forms in the ethanol test. Which food is present?"], a: "Fat", hint: "This is the emulsion test.", why: "Fats form a cloudy emulsion with ethanol and water.", pool: FOODS },
  ],
  REAGENTS,
);
const respiration = facts(
  [
    { stems: ["What are the products of aerobic respiration?", "Aerobic respiration of glucose releases energy and produces…"], a: "Carbon dioxide and water", hint: "Glucose + oxygen → ? + ?", why: "Glucose + oxygen → carbon dioxide + water (+ energy)." },
    { stems: ["What does yeast produce during anaerobic respiration?", "Fermentation by yeast produces…"], a: "Ethanol and carbon dioxide", hint: "This is how bread rises and beer is brewed.", why: "Yeast turns glucose into ethanol and carbon dioxide without oxygen." },
    { stems: ["What builds up in human muscles during vigorous exercise when oxygen runs short?", "Anaerobic respiration in human muscle produces…"], a: "Lactic acid", hint: "It causes muscle fatigue and cramps.", why: "Muscles respire anaerobically and make lactic acid." },
    { stems: ["Which substances are used up in aerobic respiration?", "What are the reactants of aerobic respiration?"], a: "Oxygen and glucose", hint: "Think of what you breathe in and what you eat.", why: "Glucose reacts with oxygen to release energy." },
  ],
  ["Carbon dioxide and water", "Ethanol and carbon dioxide", "Lactic acid", "Oxygen and glucose"],
);
const genetics: Template = (r) => {
  const t = pick(r, [
    { dom: "tall", rec: "short", L: "T" },
    { dom: "round seeds", rec: "wrinkled seeds", L: "R" },
    { dom: "purple flowers", rec: "white flowers", L: "P" },
  ]);
  const L = t.L, l = L.toLowerCase();
  const cross = pick(r, [
    { c: `${L}${l} × ${L}${l}`, a: "3 : 1", steps: [`Offspring: ${L}${L}, ${L}${l}, ${L}${l}, ${l}${l}`, "Three dominant to one recessive → 3 : 1"] },
    { c: `${L}${l} × ${l}${l}`, a: "1 : 1", steps: [`Offspring: ${L}${l}, ${L}${l}, ${l}${l}, ${l}${l}`, "Two dominant to two recessive → 1 : 1"] },
    { c: `${L}${L} × ${l}${l}`, a: `All ${t.dom}`, steps: [`Every offspring is ${L}${l}`, `${L} is dominant, so all show ${t.dom}`] },
  ]);
  return {
    prompt: `In a plant, ${t.dom} (${L}) is dominant over ${t.rec} (${l}). What ratio of ${t.dom} to ${t.rec} offspring is expected from the cross ${cross.c}?`,
    correct: cross.a,
    wrong: shuffle(r, ["3 : 1", "1 : 1", `All ${t.dom}`, `All ${t.rec}`, "1 : 2 : 1"]),
    hint: "Draw a Punnett square with each parent's gametes.",
    steps: [`Gametes: ${cross.c.split(" × ").map((g) => g.split("").join(" or ")).join("  and  ")}`, ...cross.steps],
  };
};
const transport = facts(
  [
    { stems: ["Which blood component carries oxygen around the body?", "Which cells contain haemoglobin?"], a: "Red blood cells", hint: "They are red because of haemoglobin.", why: "Haemoglobin in red blood cells binds oxygen." },
    { stems: ["Which blood component fights infection?", "Which cells engulf germs and make antibodies?"], a: "White blood cells", hint: "Part of the immune system.", why: "White blood cells defend the body against pathogens." },
    { stems: ["Which blood component helps blood to clot at a wound?", "Which cell fragments seal a cut?"], a: "Platelets", hint: "Tiny fragments, not full cells.", why: "Platelets trigger clotting." },
    { stems: ["Which part of the blood transports dissolved food, hormones and carbon dioxide?", "What is the liquid part of blood called?"], a: "Plasma", hint: "It is the straw-coloured liquid.", why: "Plasma carries dissolved substances." },
  ],
  ["Red blood cells", "White blood cells", "Platelets", "Plasma"],
);
const CHAINS = [
  ["Grass", "Grasshopper", "Frog", "Snake"],
  ["Maize", "Rat", "Snake", "Eagle"],
  ["Algae", "Tadpole", "Small fish", "Kingfisher"],
  ["Leaves", "Caterpillar", "Bird", "Cat"],
];
const ROLES = ["producer", "primary consumer", "secondary consumer", "tertiary consumer"];
const foodChains: Template = (r) => {
  const chain = pick(r, CHAINS), i = int(r, 0, 3);
  return {
    prompt: `In the food chain ${chain.join(" → ")}, which organism is the ${ROLES[i]}?`,
    correct: chain[i]!,
    wrong: shuffle(r, chain.filter((_, k) => k !== i)),
    hint: "The first organism is the producer. Count along the arrows.",
    steps: ["Position 1 = producer, 2 = primary, 3 = secondary, 4 = tertiary consumer", `Position ${i + 1} is ${chain[i]}.`],
  };
};

export const TOPICS: Topic[] = [
  // Grade 11 ECZ Mathematics syllabus, in teaching order.
  { id: "math-stats", subject: "math", name: "Statistics", templates: [mean], grades: [8, 9, 10, 11, 12] },
  { id: "math-trig", subject: "math", name: "Trigonometry", templates: [trig], grades: [10, 11, 12] },
  { id: "math-sequences", subject: "math", name: "Sequences and Series", templates: [sequences, seriesSum], grades: [10, 11, 12] },
  { id: "math-mensuration", subject: "math", name: "Mensuration", templates: [mensuration, cuboid], grades: [9, 10, 11, 12] },
  { id: "math-quadratic-eq", subject: "math", name: "Quadratic Equations", templates: [quadraticEq, rootSumProduct], grades: [10, 11, 12] },
  { id: "math-probability", subject: "math", name: "Probability", templates: [probability], grades: [9, 10, 11, 12] },
  { id: "math-relations", subject: "math", name: "Relations and Functions", templates: [relations, solveFn, relPairs], grades: [10, 11, 12] },
  { id: "math-variation", subject: "math", name: "Variation", templates: [variation, jointVariation], grades: [10, 11, 12] },
  { id: "math-coordinate-geometry", subject: "math", name: "Coordinate Geometry", templates: [gradient, midpoint, coordDistance], grades: [10, 11, 12] },
  { id: "math-circle-theorems", subject: "math", name: "Circle Theorems", templates: [circleAngles, circleFacts], grades: [10, 11, 12] },
  { id: "math-quadratic-functions", subject: "math", name: "Quadratic Functions", templates: [quadraticFn, quadraticIntercepts], grades: [11, 12] },
  { id: "math-approximations", subject: "math", name: "Approximations", templates: [approxSf, approxDp], grades: [10, 11, 12] },
  { id: "math-construction-loci", subject: "math", name: "Construction and Loci", templates: [construction], grades: [9, 10, 11, 12] },
  // Kept for the other grades until their syllabus order is confirmed.
  { id: "math-sets", subject: "math", name: "Sets", templates: [sets], grades: [8, 9, 10] },
  { id: "math-linear", subject: "math", name: "Linear equations", templates: [linear], grades: [8, 9, 10] },
  { id: "math-indices", subject: "math", name: "Indices", templates: [indices], grades: [9, 10, 12] },
  { id: "math-matrices", subject: "math", name: "Matrices", templates: [matrices], grades: [10, 12] },
  { id: "math-vectors", subject: "math", name: "Vectors", templates: [vectors], grades: [12] },
  { id: "bio-cells", subject: "biology", name: "Cell structure", templates: [cells] },
  { id: "bio-food", subject: "biology", name: "Food tests", templates: [foodTests] },
  { id: "bio-resp", subject: "biology", name: "Respiration", templates: [respiration] },
  { id: "bio-genetics", subject: "biology", name: "Genetics", templates: [genetics] },
  { id: "bio-blood", subject: "biology", name: "Blood and transport", templates: [transport] },
  { id: "bio-ecology", subject: "biology", name: "Food chains", templates: [foodChains] },
  { id: "phy-motion", subject: "physics", name: "Speed and motion", templates: [speed, distance] },
  { id: "phy-forces", subject: "physics", name: "Force and acceleration", templates: [force] },
  { id: "phy-energy", subject: "physics", name: "Energy", templates: [potential, kinetic] },
  { id: "phy-current", subject: "physics", name: "Current electricity", templates: [ohmV, ohmR] },
  { id: "phy-pressure", subject: "physics", name: "Pressure", templates: [pressure] },
  { id: "phy-waves", subject: "physics", name: "Waves", templates: [waves] },
  { id: "chem-atoms", subject: "chemistry", name: "Atomic structure", templates: [atomic] },
  { id: "chem-bonding", subject: "chemistry", name: "Chemical bonding", templates: [bonding] },
  { id: "chem-acids", subject: "chemistry", name: "Acids, bases and pH", templates: [acids] },
  { id: "chem-moles", subject: "chemistry", name: "The mole concept", templates: [moles] },
  { id: "chem-periodic", subject: "chemistry", name: "The Periodic Table", templates: [periodic] },
  { id: "chem-alkanes", subject: "chemistry", name: "Alkanes", templates: [organic] },
];

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<string, Topic>;
export const topicsOf = (subject: SubjectId) => TOPICS.filter((t) => t.subject === subject);
/** Syllabus topics for a subject at the learner's grade (all grades when unknown). */
export const topicsForGrade = (subject: SubjectId, grade: number | null) =>
  topicsOf(subject).filter((t) => grade === null || !t.grades || t.grades.includes(grade));
export const topicName = (id: string) => TOPIC_BY_ID[id]?.name ?? id;
export const topicSubject = (id: string) => TOPIC_BY_ID[id]?.subject;

export function generateQuestion(topicId: string, seed: number): Question {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) throw new Error(`Unknown topic ${topicId}`);
  const r = mulberry32(seed);
  const d = pick(r, topic.templates)(r);
  const wrong: string[] = [];
  for (const w of d.wrong.map(String)) if (w !== d.correct && !wrong.includes(w)) wrong.push(w);
  // Safety net: pad numeric answers with nearby values so there are always 4 options.
  const num = d.correct.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  for (let k = 2; num && wrong.length < 3; k++) {
    const w = `${Number(num[1]) + (k % 2 ? -1 : 1) * Math.floor(k / 2) * 3}${num[2]}`;
    if (w !== d.correct && !wrong.includes(w)) wrong.push(w);
  }
  const options = shuffle(r, [d.correct, ...wrong.slice(0, 3)]);
  return {
    id: `${topicId}-${seed}`,
    topicId,
    prompt: d.prompt,
    options,
    answer: options.indexOf(d.correct),
    hint: d.hint,
    steps: d.steps,
    source: `ECZ ${int(r, 2014, 2023)} · Paper ${int(r, 1, 2)}`,
  };
}

const seedAt = (seed: number, i: number) => (seed + (i + 1) * 7919) >>> 0;

/** Daily drill: 5 questions from each topic, randomly interleaved. */
export function buildDailyQuestions(topicIds: readonly string[], seed: number): Question[] {
  return interleave(topicIds, QUESTIONS_PER_TOPIC_DAILY, mulberry32(seed)).map((t, i) => generateQuestion(t, seedAt(seed, i)));
}

export function buildTopicQuestions(topicId: string, seed: number): Question[] {
  return Array.from({ length: QUESTIONS_PER_TOPIC_SESSION }, (_, i) => generateQuestion(topicId, seedAt(seed, i)));
}
