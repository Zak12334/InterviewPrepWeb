'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { PatternId } from '@/types/content';
import { getPattern, patterns } from '@/data/patterns';
import { spotPrompts } from '@/data/spotting';

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Reads a one-line problem and asks which pattern it is: the recognition skill on its own. */
export function SpotDrill() {
  // Shuffled after mount so the server and the browser render the same first frame.
  const [order, setOrder] = useState<number[] | null>(null);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<PatternId | null>(null);
  const [score, setScore] = useState({ right: 0, seen: 0 });

  useEffect(() => setOrder(shuffle(spotPrompts.map((_, i) => i))), []);

  const prompt = order ? spotPrompts[order[at % order.length]] : null;
  const choices = useMemo(() => {
    if (!prompt) return [];
    const others = shuffle(patterns.filter((p) => p.id !== prompt.pattern)).slice(0, 3);
    return shuffle([getPattern(prompt.pattern), ...others]);
  }, [prompt]);

  const pick = (id: PatternId) => {
    if (picked || !prompt) return;
    setPicked(id);
    setScore((s) => ({ right: s.right + (id === prompt.pattern ? 1 : 0), seen: s.seen + 1 }));
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Patterns
      </Link>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Spot the pattern</h1>
          <p className="mt-1 text-sm text-muted">Do not solve it. Just say which pattern you would reach for, and notice the words that gave it away.</p>
        </div>
        <span className="shrink-0 font-mono text-sm text-muted">
          {score.right} / {score.seen}
        </span>
      </div>

      {prompt && (
        <section className="mt-8 rounded-xl border border-line bg-panel p-6">
          <p className="text-lg leading-7">{prompt.text}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {choices.map((choice) => {
              const correct = choice.id === prompt.pattern;
              const tone = !picked
                ? 'border-line hover:border-muted'
                : correct
                  ? 'border-mint bg-mint/10'
                  : picked === choice.id
                    ? 'border-coral/60 bg-coral/10'
                    : 'border-line opacity-50';
              return (
                <button key={choice.id} onClick={() => pick(choice.id)} disabled={picked !== null} className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left text-sm ${tone}`}>
                  {picked && correct && <Check size={15} className="shrink-0 text-mint" />}
                  {picked === choice.id && !correct && <X size={15} className="shrink-0 text-coral" />}
                  {choice.name}
                </button>
              );
            })}
          </div>

          {picked && (
            <div className="mt-5 border-t border-line pt-5" role="status">
              <p className="text-sm">
                <span className={picked === prompt.pattern ? 'font-semibold text-mint' : 'font-semibold text-coral'}>
                  {picked === prompt.pattern ? 'Yes.' : `It is ${getPattern(prompt.pattern).name}.`}
                </span>{' '}
                {prompt.why}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <Link href={`/patterns/${prompt.pattern}`} className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-mint">
                  Open {getPattern(prompt.pattern).name}
                </Link>
                <button
                  onClick={() => {
                    setAt(at + 1);
                    setPicked(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink"
                >
                  Next <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
