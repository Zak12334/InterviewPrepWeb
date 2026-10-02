export type Language = 'python' | 'java';

/** Parameter / return types, written the way Java spells them. */
export type ValueType =
  | 'int'
  | 'long'
  | 'double'
  | 'boolean'
  | 'char'
  | 'String'
  | 'int[]'
  | 'char[]'
  | 'String[]'
  | 'int[][]'
  | 'char[][]'
  | 'List<Integer>'
  | 'List<String>'
  | 'List<List<Integer>>'
  | 'List<List<String>>'
  | 'ListNode'
  | 'TreeNode';

/** The patterns of the roadmap, in src/data/patterns.ts. */
export type PatternId =
  | 'arrays-hashing'
  | 'prefix-sum'
  | 'two-pointers'
  | 'sliding-window'
  | 'fast-slow'
  | 'linked-list'
  | 'stack'
  | 'monotonic-stack'
  | 'binary-search'
  | 'tree-dfs'
  | 'tree-bfs'
  | 'heap'
  | 'backtracking'
  | 'graphs'
  | 'topological-sort'
  | 'union-find'
  | 'dp-1d'
  | 'dp-2d'
  | 'greedy'
  | 'intervals';

export type Complexity = { time: string; space: string };

export type McqOption = {
  label: string;
  correct?: boolean;
  /** Solves the problem, just not as efficiently as the correct option. The learner may code it first. */
  valid?: boolean;
  /** Shown after the option is picked: why it works, or what goes wrong. */
  feedback: string;
  complexity?: Complexity;
  /** Python implementation of this idea, animated (code hidden) so the learner can watch it play out. */
  demo?: string;
};

export type Mcq = {
  prompt: string;
  options: McqOption[];
  /** Only asked when the learner is working in this language. */
  lang?: Language;
};

export type TestCase = { args: unknown[]; expected: unknown };

export type Problem = {
  slug: string;
  title: string;
  pattern: PatternId;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  /** The LeetCode problem this one mirrors, for practising the real submission afterwards. */
  leetcode: number;
  statement: string;
  constraints: string[];
  examples: { input: string; output: string; explanation: string }[];
  signature: {
    python: string;
    java: string;
    params: { name: string; type: ValueType }[];
    returns: ValueType;
  };
  understanding: Mcq[];
  approach: Mcq[];
  /** Questions about how the approach is written in one language; each is tagged with its lang. */
  langQuestions?: Mcq[];
  /** Fill-in-the-blanks outline per language; replaces the third hint. */
  skeleton?: Record<Language, string>;
  /** The answer is a list of results that may come in any order. */
  anyOrder?: boolean;
  /** In the correct order; the plan stage shuffles them. */
  planSteps: string[];
  /** Three nudges of increasing strength. The full solution is a separate, gated reveal. */
  hints: [string, string, string];
  starter: Record<Language, string>;
  solution: Record<Language, string>;
  /** The first test is the one animated by default. */
  tests: TestCase[];
  /** Input used by the approach demos; big enough to make slow ideas look slow. */
  demoArgs: unknown[];
  reflect: {
    prompt: string;
    time: { options: string[]; answer: string };
    space: { options: string[]; answer: string };
  };
};
