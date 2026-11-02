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
  { id: "math-sets", subject: "math", name: "Sets", templates: [sets], grades: [8, 9, 10] },
  { id: "math-linear", subject: "math", name: "Linear equations", templates: [linear], grades: [8, 9, 10] },
  { id: "math-indices", subject: "math", name: "Indices", templates: [indices], grades: [9, 10, 11] },
  { id: "math-matrices", subject: "math", name: "Matrices", templates: [matrices], grades: [10, 11, 12] },
  { id: "math-trig", subject: "math", name: "Trigonometry", templates: [trig], grades: [10, 11, 12] },
  { id: "math-stats", subject: "math", name: "Statistics", templates: [mean], grades: [8, 9, 11, 12] },
  { id: "math-vectors", subject: "math", name: "Vectors", templates: [vectors], grades: [11, 12] },
  { id: "math-probability", subject: "math", name: "Probability", templates: [probability], grades: [9, 11, 12] },
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
