'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, Eye } from 'lucide-react';
import { patterns } from '@/data/patterns';
import { problems, problemsOf } from '@/data/problems';
import { DIFFICULTIES, useDifficulty } from '@/lib/difficulty';
import { useAllProgress } from '@/lib/progress';
import { LanguageToggle } from './LanguageToggle';
import { DIFFICULTY, ProblemRow } from './ProblemRow';

const PICKED = { All: 'bg-text text-ink', Easy: 'bg-mint text-ink', Medium: 'bg-gold text-ink', Hard: 'bg-coral text-ink' };

export function Dashboard() {
  const store = useAllProgress();
  const [difficulty, setDifficulty] = useDifficulty();
  const matches = (d: string) => difficulty === 'All' || d === difficulty;

  const shown = problems.filter((p) => matches(p.difficulty));
  const learned = shown.filter((p) => store?.[p.slug]?.done).length;
  // Roadmap order within the chosen difficulty.
  const resume = shown.find((p) => !store?.[p.slug]?.done) ?? shown[0];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10">
      <header>
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

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-3 text-sm text-muted">
            I am practising in
            <LanguageToggle size="lg" />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            Difficulty
            <div className="inline-flex rounded-lg border border-line bg-panel p-0.5" role="radiogroup" aria-label="Difficulty to practise">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  role="radio"
                  aria-checked={difficulty === d}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium ${difficulty === d ? PICKED[d] : 'text-muted hover:text-text'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/spot" className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold hover:border-mint hover:text-mint">
            <Eye size={16} /> Spot the pattern
          </Link>
          {resume && (
            <Link href={`/p/${resume.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink">
              {learned === 0 && !store?.[resume.slug] ? 'Start' : 'Continue'}: {resume.title}
              {difficulty === 'All' && <span className={`text-xs font-medium opacity-70`}>({resume.difficulty})</span>}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </header>

      <div className="mb-3 mt-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          The roadmap{difficulty !== 'All' && <span className={`ml-2 normal-case tracking-normal ${DIFFICULTY[difficulty]}`}>· {difficulty} only</span>}
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${shown.length ? (learned / shown.length) * 100 : 0}%` }} />
          </div>
          {learned} of {shown.length} {difficulty === 'All' ? '' : `${difficulty.toLowerCase()} `}problems learned
        </div>
      </div>

      <ol className="space-y-3">
        {patterns.map((pattern, i) => {
          const all = problemsOf(pattern.id);
          const list = all.filter((p) => matches(p.difficulty));
          const done = list.filter((p) => store?.[p.slug]?.done).length;
          // Practice problems of the chosen difficulty when the site has none of its own.
          const elsewhere = difficulty === 'All' ? [] : pattern.more.filter((m) => m[2] === difficulty);
          return (
            <li key={pattern.id} className={`overflow-hidden rounded-xl border border-line bg-panel ${list.length === 0 ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-start gap-x-4 gap-y-1 border-b border-line px-4 py-3">
                <span className="mt-0.5 font-mono text-xs text-mint">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/patterns/${pattern.id}`} className="font-semibold hover:text-mint">
                    {pattern.name}
                  </Link>
                  <p className="mt-0.5 text-xs leading-5 text-muted">{pattern.idea}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  {list.length > 0 && (
                    <span className={done === list.length ? 'text-mint' : ''}>
                      {done} / {list.length}
                    </span>
                  )}
                  <Link href={`/patterns/${pattern.id}`} className="rounded-md border border-line px-2.5 py-1 font-medium text-text hover:border-mint hover:text-mint">
                    How to spot it
                  </Link>
                </div>
              </div>
              {list.length > 0 ? (
                <ul className="divide-y divide-line">
                  {list.map((problem) => (
                    <li key={problem.slug}>
                      <ProblemRow problem={problem} progress={store?.[problem.slug]} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-xs text-muted">
                  <span>No {difficulty.toLowerCase()} problem on the site for this pattern yet.</span>
                  {elsewhere.map(([number, title]) => (
                    <a
                      key={number}
                      href={`https://leetcode.com/problemset/?search=${number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-text hover:text-mint"
                    >
                      Try #{number} {title} on LeetCode <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
