/** A runtime value as captured by runner/tracer.py and runner/Tracer.java. */
export type Value =
  | null
  | number
  | boolean
  | { t: 'str'; v: string }
  | { t: 'list'; kind: 'list' | 'tuple' | 'set' | 'deque' | 'stack' | 'heap'; n: number; v: Value[] }
  | { t: 'map'; n: number; v: [Value, Value][] }
  | { t: 'ref'; id: string }
  | { t: 'obj'; v: string };

export type HeapNode =
  | { k: 'list'; val: Value; next: string | null }
  | { k: 'tree'; val: Value; left: string | null; right: string | null };

export type Frame = { fn: string; args: string; refs: [string, string][] };

export type Step = {
  /** The line about to run ('line') or the line returning ('return'). */
  line: number;
  fn: string;
  depth: number;
  ev: 'line' | 'return';
  vars: [string, Value][];
  /** Call stack, outermost first. */
  frames: Frame[];
  heap?: Record<string, HeapNode>;
  ret?: Value;
  /** How much of stdout had been printed by this step. */
  o: number;
};

export type RunError = { message: string; line: number | null };

export type TraceResponse = {
  steps: Step[];
  limit: boolean;
  stdout: string;
  result?: unknown;
  error?: RunError;
  compileError?: RunError;
  expected?: unknown;
  pass?: boolean;
};

export type TestResult = {
  i: number;
  args: unknown[];
  expected: unknown;
  got?: unknown;
  error?: RunError;
  stdout: string;
  pass: boolean;
};

export type TestResponse = { results: TestResult[]; compileError?: RunError };

export type RunRequest = {
  slug: string;
  lang: 'python' | 'java';
  code: string;
  mode: 'trace' | 'test';
  /** Trace mode: the input to animate. Defaults to the first test. */
  args?: unknown[];
};
