'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import type { PatternId } from '@/types/content';
import { getPattern, patterns } from '@/data/patterns';
import { problemsOf } from '@/data/problems';
import { useLanguage } from '@/lib/language';
import { useAllProgress } from '@/lib/progress';
import { LanguageToggle } from './LanguageToggle';
import { DIFFICULTY, ProblemRow } from './ProblemRow';

export function PatternPage({ id }: { id: PatternId }) {
  const pattern = getPattern(id);
  const index = patterns.indexOf(pattern);
  const next = patterns[index + 1];
  const list = problemsOf(id);
  const store = useAllProgress();
  const [lang] = useLanguage();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
          <ArrowLeft size={15} /> All patterns
        </Link>
        <LanguageToggle />
      </div>

      <p className="mt-8 font-mono text-xs text-mint">
        Pattern {String(index + 1).padStart(2, '0')} of {patterns.length}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{pattern.name}</h1>
      <p className="mt-3 text-lg leading-7 text-text">{pattern.idea}</p>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">How to spot it</h2>
        <ul className="space-y-2">
          {pattern.spot.map((signal) => (
            <li key={signal} className="flex gap-3 rounded-lg border border-line bg-panel px-4 py-2.5 text-sm">
              <span className="text-mint">→</span>
              {signal}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">The template</h2>
        <pre className="overflow-x-auto rounded-lg border border-line bg-panel p-4 font-mono text-[13px] leading-6">{pattern.template[lang]}</pre>
        <p className="mt-2 text-xs text-muted">Do not memorise this. Work the problems below and come back: it should read like something you would have written.</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Problems, easiest first</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
          {list.map((problem) => (
            <li key={problem.slug}>
              <ProblemRow problem={problem} progress={store?.[problem.slug]} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Then try these on LeetCode</h2>
        <ul className="space-y-1.5 text-sm">
          {pattern.more.map(([number, title, difficulty]) => (
            <li key={number}>
              <a
                href={`https://leetcode.com/problemset/?search=${number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-mint"
              >
                <span className="font-mono text-xs text-muted">#{number}</span>
                {title}
                <span className={`text-xs ${DIFFICULTY[difficulty]}`}>{difficulty}</span>
                <ExternalLink size={12} className="text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {next && (
        <Link href={`/patterns/${next.id}`} className="mt-10 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-mint hover:text-mint">
          Next pattern: {next.name} <ArrowRight size={15} />
        </Link>
      )}
    </main>
  );
}
