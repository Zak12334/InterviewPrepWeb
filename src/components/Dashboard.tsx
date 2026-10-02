'use client';

import Link from 'next/link';
import { ArrowRight, Eye } from 'lucide-react';
import { patterns } from '@/data/patterns';
import { problems, problemsOf } from '@/data/problems';
import { useAllProgress } from '@/lib/progress';
import { LanguageToggle } from './LanguageToggle';
import { ProblemRow } from './ProblemRow';

export function Dashboard() {
  const store = useAllProgress();
  const learned = problems.filter((p) => store?.[p.slug]?.done).length;
  // Roadmap order: pattern by pattern, easy before medium before hard.
  const resume = problems.find((p) => !store?.[p.slug]?.done) ?? problems[0];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint font-black text-ink">T</span>
            <span className="text-lg font-semibold">ThinkFirst</span>
          </div>
          <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-tight">
            {patterns.length} patterns. Learn to spot them, and most problems stop being new.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Each pattern below has its tell-tale signs, a code template, and problems from easy to hard. For every problem you reason first, plan, then watch your own code run.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-3 text-sm text-muted">
            I am practising in
            <LanguageToggle size="lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/spot" className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold hover:border-mint hover:text-mint">
              <Eye size={16} /> Spot the pattern
            </Link>
            <Link href={`/p/${resume.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink">
              {learned === 0 && !store?.[resume.slug] ? 'Start' : 'Continue'}: {resume.title} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mb-3 mt-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">The roadmap</h2>
        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${(learned / problems.length) * 100}%` }} />
          </div>
          {learned} of {problems.length} problems learned
        </div>
      </div>

      <ol className="space-y-3">
        {patterns.map((pattern, i) => {
          const list = problemsOf(pattern.id);
          const done = list.filter((p) => store?.[p.slug]?.done).length;
          return (
            <li key={pattern.id} className="overflow-hidden rounded-xl border border-line bg-panel">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-1 border-b border-line px-4 py-3">
                <span className="mt-0.5 font-mono text-xs text-mint">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/patterns/${pattern.id}`} className="font-semibold hover:text-mint">
                    {pattern.name}
                  </Link>
                  <p className="mt-0.5 text-xs leading-5 text-muted">{pattern.idea}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className={done === list.length && done > 0 ? 'text-mint' : ''}>
                    {done} / {list.length}
                  </span>
                  <Link href={`/patterns/${pattern.id}`} className="rounded-md border border-line px-2.5 py-1 font-medium text-text hover:border-mint hover:text-mint">
                    How to spot it
                  </Link>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {list.map((problem) => (
                  <li key={problem.slug}>
                    <ProblemRow problem={problem} progress={store?.[problem.slug]} />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
