import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import type { Problem } from '@/types/content';
import type { RunError, RunRequest, Step, TestResponse, TestResult, TraceResponse } from '@/types/trace';
import { LIST_NODE, TREE_NODE, mainSource } from './javaHarness';

const TIMEOUT_MS = 10_000;
const MAX_STEPS = 1500;
const MARKER = '@@TF@@';
const RUNNER_DIR = path.join(process.cwd(), 'runner');

type Spawned = { code: number | null; stdout: string; stderr: string; timedOut: boolean; missing: boolean };

/** Kills a process and everything it started (the JVM under the java launcher, the traced JVM under the tracer). */
function killTree(pid: number | undefined) {
  if (!pid) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(pid), '/T', '/F']).on('error', () => {});
  } else {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // already gone
    }
  }
}

function exec(cmd: string, args: string[], opts: { cwd?: string; input?: string } = {}): Promise<Spawned> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child.pid);
      // Do not wait for 'close': a surviving grandchild can hold the pipes open forever.
      resolve({ code: null, stdout, stderr, timedOut, missing: false });
    }, TIMEOUT_MS);
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', () => {
      clearTimeout(timer);
      resolve({ code: null, stdout, stderr, timedOut, missing: true });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut, missing: false });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(opts.input ?? '');
  });
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Sorts the outer list, so a list of answers can be compared regardless of the order they were found in. */
function sorted(v: unknown): unknown {
  if (!Array.isArray(v)) return v;
  return [...v].sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
}
const TIMED_OUT: RunError = { message: 'Timed out after 10s — is there a loop that never ends?', line: null };

type Raw = {
  compileError?: RunError;
  steps?: Step[];
  limit?: boolean;
  stdout?: string;
  result?: unknown;
  error?: RunError;
  results?: { i: number; got?: unknown; error?: RunError; stdout: string }[];
};

// ---- Python ---------------------------------------------------------------------------

async function runPython(problem: Problem, req: RunRequest, cases: unknown[][]): Promise<Raw> {
  const input = JSON.stringify({
    code: req.code,
    fn: problem.signature.python,
    altFn: problem.signature.java,
    params: problem.signature.params.map((p) => p.type),
    cases,
    mode: req.mode,
    maxSteps: MAX_STEPS,
  });
  const script = path.join(RUNNER_DIR, 'tracer.py');
  let run = await exec('python', [script], { input });
  if (run.missing) run = await exec('py', ['-3', script], { input });
  if (run.missing) return { compileError: { message: 'Python was not found on this machine (tried `python` and `py`).', line: null } };
  if (run.timedOut) return { compileError: TIMED_OUT };
  try {
    return JSON.parse(run.stdout) as Raw;
  } catch {
    return { compileError: { message: run.stderr.trim().split('\n').pop() || 'Python runner crashed.', line: null } };
  }
}

// ---- Java -----------------------------------------------------------------------------

let tracerDir: Promise<string> | null = null;

/** Compiles runner/Tracer.java once per source change into a temp dir. */
function compiledTracer(): Promise<string> {
  const build = async () => {
    const source = path.join(RUNNER_DIR, 'Tracer.java');
    const dir = path.join(os.tmpdir(), 'thinkfirst-tracer');
    await fs.mkdir(dir, { recursive: true });
    const [src, cls] = await Promise.all([
      fs.stat(source),
      fs.stat(path.join(dir, 'Tracer.class')).catch(() => null),
    ]);
    if (!cls || cls.mtimeMs < src.mtimeMs) {
      const javac = await exec('javac', ['-nowarn', '-encoding', 'UTF-8', '-d', dir, source]);
      if (javac.missing || javac.code !== 0) throw new Error(javac.stderr || 'javac not found');
    }
    return dir;
  };
  tracerDir ??= build().catch((e) => {
    tracerDir = null;
    throw e;
  });
  return tracerDir;
}

function javacError(stderr: string): RunError {
  const match = /^(\w+)\.java:(\d+): error: (.*)$/m.exec(stderr);
  if (!match) return { message: stderr.trim() || 'Compilation failed.', line: null };
  const [, file, line, message] = match;
  if (file !== 'Solution') {
    return { message: `Your Solution class doesn't match the expected method signature (${message}).`, line: null };
  }
  return { message, line: Number(line) };
}

/** Splits program output into the learner's prints and our per-case result lines. */
function splitMarkers(stdout: string) {
  const entries: { i: number; got?: unknown; error?: RunError; stdout: string }[] = [];
  const printed: string[] = [];
  let pending: string[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.startsWith(MARKER)) {
      pending.push(line);
      continue;
    }
    // Main prints a newline before each marker in case the learner's last print had none.
    if (pending[pending.length - 1] === '') pending.pop();
    entries.push({ ...JSON.parse(line.slice(MARKER.length)), stdout: pending.join('\n') });
    printed.push(...pending);
    pending = [];
  }
  printed.push(...pending);
  return { entries, printed: printed.join('\n') };
}

async function runJava(problem: Problem, req: RunRequest, cases: unknown[][]): Promise<Raw> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'thinkfirst-'));
  try {
    // Imports go on line 1 so the learner's line numbers stay intact.
    await Promise.all([
      fs.writeFile(path.join(dir, 'Solution.java'), `import java.util.*; ${req.code}`),
      fs.writeFile(path.join(dir, 'Main.java'), mainSource(problem, cases)),
      fs.writeFile(path.join(dir, 'ListNode.java'), LIST_NODE),
      fs.writeFile(path.join(dir, 'TreeNode.java'), TREE_NODE),
    ]);
    const javac = await exec(
      'javac',
      ['-g', '-nowarn', '-encoding', 'UTF-8', 'Solution.java', 'Main.java', 'ListNode.java', 'TreeNode.java'],
      { cwd: dir },
    );
    if (javac.missing) {
      return { compileError: { message: 'A JDK was not found on this machine (`javac` is not on the PATH).', line: null } };
    }
    if (javac.code !== 0) return { compileError: javacError(javac.stderr) };

    if (req.mode === 'test') {
      const run = await exec('java', ['-cp', '.', '-Xss16m', 'Main', 'all'], { cwd: dir });
      const { entries } = splitMarkers(run.stdout);
      // A hang stops every later case from reporting; blame the first one that is missing.
      const results = cases.map((_, i) => entries.find((e) => e.i === i) ?? { i, error: TIMED_OUT, stdout: '' });
      return { results };
    }

    const run = await exec('java', ['-cp', await compiledTracer(), 'Tracer', '0', String(MAX_STEPS), 'trace.json'], { cwd: dir });
    if (run.timedOut) return { compileError: TIMED_OUT };
    const raw = JSON.parse(await fs.readFile(path.join(dir, 'trace.json'), 'utf8')) as { steps: Step[]; limit: boolean; stdout: string };
    const { entries, printed } = splitMarkers(raw.stdout);
    return { steps: raw.steps, limit: raw.limit, stdout: printed, result: entries[0]?.got, error: entries[0]?.error };
  } catch (e) {
    return { compileError: { message: `Java runner failed: ${(e as Error).message}`, line: null } };
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

// ---- entry point ----------------------------------------------------------------------

export async function execute(problem: Problem, req: RunRequest): Promise<TraceResponse | TestResponse> {
  const matches = (got: unknown, expected: unknown) => (problem.anyOrder ? same(sorted(got), sorted(expected)) : same(got, expected));
  const known = problem.tests.find((t) => req.args && same(t.args, req.args));
  const cases = req.mode === 'test' ? problem.tests.map((t) => t.args) : [req.args ?? problem.tests[0].args];
  const raw = await (req.lang === 'java' ? runJava(problem, req, cases) : runPython(problem, req, cases));

  // An empty linked list / tree comes back as null; tests describe it as [].
  const nodes = problem.signature.returns === 'ListNode' || problem.signature.returns === 'TreeNode';
  const normal = (got: unknown) => (nodes && got === null ? [] : got);
  if (raw.result !== undefined) raw.result = normal(raw.result);
  raw.results?.forEach((r) => {
    if (!r.error) r.got = normal(r.got);
  });

  if (req.mode === 'test') {
    if (raw.compileError) return { results: [], compileError: raw.compileError };
    const results: TestResult[] = (raw.results ?? []).map((r) => ({
      ...r,
      args: problem.tests[r.i].args,
      expected: problem.tests[r.i].expected,
      pass: !r.error && matches(r.got, problem.tests[r.i].expected),
    }));
    return { results };
  }

  const expected = req.args ? known?.expected : problem.tests[0].expected;
  const finished = !raw.compileError && !raw.error && !raw.limit;
  return {
    steps: raw.steps ?? [],
    limit: raw.limit ?? false,
    stdout: raw.stdout ?? '',
    result: raw.result,
    error: raw.error,
    compileError: raw.compileError,
    expected,
    pass: finished && expected !== undefined ? matches(raw.result, expected) : undefined,
  };
}
