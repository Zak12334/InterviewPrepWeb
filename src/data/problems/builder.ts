import type { Language, Mcq, McqOption, PatternId, Problem, ValueType } from '@/types/content';

/** A compact way to write problems: tuples instead of objects, and starter code derived from the signature. */

export const BIG_O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];

type Extra = { time?: string; space?: string; demo?: string };

const option = (label: string, feedback: string, extra: Extra, kind: 'correct' | 'valid' | 'wrong'): McqOption => ({
  label,
  feedback,
  ...(kind === 'correct' ? { correct: true } : {}),
  ...(kind === 'valid' ? { valid: true } : {}),
  ...(extra.time ? { complexity: { time: extra.time, space: extra.space ?? 'O(1)' } } : {}),
  ...(extra.demo ? { demo: extra.demo } : {}),
});

/** The right answer to a question. */
export const yes = (label: string, feedback: string, extra: Extra = {}) => option(label, feedback, extra, 'correct');
/** An answer that works but is slower or heavier than the best one. */
export const ok = (label: string, feedback: string, extra: Extra = {}) => option(label, feedback, extra, 'valid');
/** A wrong answer; the feedback says what goes wrong. */
export const no = (label: string, feedback: string, extra: Extra = {}) => option(label, feedback, extra, 'wrong');

export const q = (prompt: string, ...options: McqOption[]): Mcq => ({ prompt, options });

const JAVA_DEFAULT: Partial<Record<ValueType, string>> = {
  int: '0',
  long: '0L',
  double: '0.0',
  boolean: 'false',
  char: "' '",
  String: '""',
  ListNode: 'null',
  TreeNode: 'null',
};

function javaDefault(type: ValueType) {
  if (JAVA_DEFAULT[type]) return JAVA_DEFAULT[type];
  if (type.startsWith('List<')) return 'new ArrayList<>()';
  return `new ${type.replace('[]', '[0]')}`;
}

const NODE_NOTE: Record<string, Record<Language, string>> = {
  ListNode: {
    python: '# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\n',
    java: '// class ListNode { int val; ListNode next; }\n\n',
  },
  TreeNode: {
    python: '# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n',
    java: '// class TreeNode { int val; TreeNode left; TreeNode right; }\n\n',
  },
};

function starter(fn: [string, string], params: [string, ValueType][], returns: ValueType): Record<Language, string> {
  const node = [...params.map((p) => p[1]), returns].find((t) => t in NODE_NOTE);
  const note = node ? NODE_NOTE[node] : { python: '', java: '' };
  return {
    python: `${note.python}def ${fn[0]}(${params.map((p) => p[0]).join(', ')}):\n    pass\n`,
    java: `${note.java}class Solution {\n    public ${returns} ${fn[1]}(${params.map((p) => `${p[1]} ${p[0]}`).join(', ')}) {\n        return ${javaDefault(returns)};\n    }\n}\n`,
  };
}

/**
 * The third hint: the solution's shape with the work blanked out. Loops, conditions and
 * returns stay visible; every other statement becomes ___.
 */
function skeleton(code: string, lang: Language) {
  const keep = lang === 'python' ? /^(def |for |while |if |elif |else:|class |from |import )/ : /^(for |while |if |\} else|else|\}|class |public |private )/;
  return code
    .trimEnd()
    .split('\n')
    .map((line) => {
      const text = line.trim();
      const indent = line.slice(0, line.length - line.trimStart().length);
      if (text === '' || keep.test(text)) return line;
      if (text.startsWith('return')) return `${indent}return ___${lang === 'java' ? ';' : ''}`;
      return `${indent}___`;
    })
    .join('\n');
}

export type Spec = {
  slug: string;
  title: string;
  pattern: PatternId;
  difficulty: Problem['difficulty'];
  leetcode: number;
  statement: string;
  constraints: string[];
  /** [input, output, explanation] */
  examples: [string, string, string][];
  /** [python name, java name] */
  fn: [string, string];
  params: [string, ValueType][];
  returns: ValueType;
  understanding: Mcq[];
  approach: Mcq[];
  /** One question per language about how the approach is actually written. */
  langQ: Record<Language, Mcq>;
  plan: string[];
  /** A question to ask yourself, then the pattern in words. The skeleton hint is generated. */
  hints: [string, string];
  solution: Record<Language, string>;
  /** [args, expected] */
  tests: [unknown[], unknown][];
  demoArgs?: unknown[];
  /** [prompt, time, space] plus any extra complexity choices beyond BIG_O */
  reflect: [string, string, string];
  anyOrder?: boolean;
};

export function make(spec: Spec): Problem {
  const options = (answer: string) => (BIG_O.includes(answer) ? BIG_O : [...BIG_O, answer]);
  const [prompt, time, space] = spec.reflect;
  return {
    slug: spec.slug,
    title: spec.title,
    pattern: spec.pattern,
    difficulty: spec.difficulty,
    leetcode: spec.leetcode,
    statement: spec.statement,
    constraints: spec.constraints,
    examples: spec.examples.map(([input, output, explanation]) => ({ input, output, explanation })),
    signature: {
      python: spec.fn[0],
      java: spec.fn[1],
      params: spec.params.map(([name, type]) => ({ name, type })),
      returns: spec.returns,
    },
    understanding: spec.understanding,
    approach: spec.approach,
    langQuestions: [
      { ...spec.langQ.python, lang: 'python' },
      { ...spec.langQ.java, lang: 'java' },
    ],
    planSteps: spec.plan,
    hints: [spec.hints[0], spec.hints[1], ''],
    skeleton: { python: skeleton(spec.solution.python, 'python'), java: skeleton(spec.solution.java, 'java') },
    starter: starter(spec.fn, spec.params, spec.returns),
    solution: spec.solution,
    tests: spec.tests.map(([args, expected]) => ({ args, expected })),
    demoArgs: spec.demoArgs ?? spec.tests[0][0],
    reflect: { prompt, time: { options: options(time), answer: time }, space: { options: options(space), answer: space } },
    anyOrder: spec.anyOrder,
  };
}
