import { NextResponse } from 'next/server';
import { problems } from '@/data/problems';
import { execute } from '@/lib/server/run';
import type { Language } from '@/types/content';
import type { TestResponse, TraceResponse } from '@/types/trace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Content self-check: runs every reference solution (and every approach demo) through the real
 * runners. Open /api/verify (or /api/verify?slug=two-sum) after adding or editing a problem.
 */
export async function GET(request: Request) {
  // ?slug=a,b limits the check to those problems
  const only = new URL(request.url).searchParams.get('slug')?.split(',');
  const report: Record<string, unknown>[] = [];
  for (const problem of problems.filter((p) => !only || only.includes(p.slug))) {
    for (const lang of ['python', 'java'] as Language[]) {
      const code = problem.solution[lang];
      const tests = (await execute(problem, { slug: problem.slug, lang, code, mode: 'test' })) as TestResponse;
      const trace = (await execute(problem, { slug: problem.slug, lang, code, mode: 'trace' })) as TraceResponse;
      const failed = tests.results.filter((r) => !r.pass);
      report.push({
        problem: problem.slug,
        lang,
        ok: !tests.compileError && failed.length === 0 && tests.results.length === problem.tests.length && trace.pass === true,
        tests: `${tests.results.length - failed.length}/${problem.tests.length}`,
        traceSteps: trace.steps.length,
        problems: [tests.compileError, trace.compileError, trace.error, ...failed.map((f) => ({ i: f.i, got: f.got, error: f.error }))].filter(Boolean),
      });
    }
    for (const option of problem.approach.flatMap((q) => q.options)) {
      if (!option.demo) continue;
      const demo = (await execute(problem, { slug: problem.slug, lang: 'python', code: option.demo, mode: 'trace', args: problem.demoArgs })) as TraceResponse;
      report.push({
        problem: problem.slug,
        demo: option.label,
        ok: !demo.compileError && !demo.error && !demo.limit && demo.steps.length > 0,
        traceSteps: demo.steps.length,
        result: demo.result,
        problems: [demo.compileError, demo.error].filter(Boolean),
      });
    }
  }
  return NextResponse.json({ ok: report.every((r) => r.ok), report });
}
