'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { Language, Problem } from '@/types/content';
import type { Progress } from '@/lib/progress';

const MIN_NOTES = 60;

function Pick({ label, options, answer, onRight }: { label: string; options: string[]; answer: string; onRight: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const chosen = picked === o;
          const tone = !chosen ? 'border-line hover:border-muted' : o === answer ? 'border-mint bg-mint/10 text-mint' : 'border-coral/60 bg-coral/10 text-coral';
          return (
            <button
              key={o}
              onClick={() => {
                setPicked(o);
                if (o === answer) onRight();
              }} aria-pressed={chosen} className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${tone}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked && picked !== answer && <p className="mt-2 text-xs text-muted">Not quite. Count how the work (or the memory) grows when the input doubles.</p>}
    </div>
  );
}

type Props = {
  problem: Problem;
  next: Problem | undefined;
  lang: Language;
  progress: Progress;
  update: (patch: Partial<Progress>) => void;
  /** Reopens the editor in the language not solved yet. */
  onTryOther: () => void;
};

export function ReflectStage({ problem, next, lang, progress, update, onTryOther }: Props) {
  const [timeRight, setTimeRight] = useState(false);
  const [spaceRight, setSpaceRight] = useState(false);
  const enough = progress.notes.trim().length >= MIN_NOTES;
  const other = lang === 'python' ? 'java' : 'python';

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div>
        <h2 className="text-xl font-semibold">Teach it back</h2>
        <p className="mt-1 text-sm text-muted">You solved it. Now make it stick: if you can explain it without the code in front of you, you own it.</p>
      </div>

      <Pick label="What is the time complexity of your solution?" options={problem.reflect.time.options} answer={problem.reflect.time.answer} onRight={() => setTimeRight(true)} />
      <Pick label="And the extra space it uses?" options={problem.reflect.space.options} answer={problem.reflect.space.answer} onRight={() => setSpaceRight(true)} />

      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium">
          {problem.reflect.prompt}
        </label>
        <textarea
          id="notes"
          rows={6}
          value={progress.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Write it the way you would explain it to a friend…"
          className="w-full rounded-lg border border-line bg-panel p-4 text-sm leading-6"
        />
        <p className="mt-1 text-xs text-muted">
          {enough ? 'Saved. These are your notes; they show on the problem list.' : `${MIN_NOTES - progress.notes.trim().length} more characters. A full thought, not a label.`}
        </p>
      </div>

      {progress.slowCode?.[lang] && (
        <details className="rounded-lg border border-line bg-panel">
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">
            Your first version{progress.slow?.time ? ` (${progress.slow.time})` : ''}, for comparison
          </summary>
          <pre className="overflow-x-auto border-t border-line p-4 font-mono text-xs leading-5">{progress.slowCode[lang]}</pre>
        </details>
      )}

      {!progress.done ? (
        <button
          onClick={() => update({ done: true })}
          disabled={!enough || !timeRight || !spaceRight}
          title="Get both complexities right and write your explanation first"
          className="inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-30"
        >
          <Check size={16} /> Mark as learned
        </button>
      ) : (
        <div className="rounded-xl border border-mint/40 bg-mint/10 p-5">
          <p className="font-semibold text-mint">Learned. Here is how to lock it in:</p>
          <ul className="mt-3 space-y-2 text-sm">
            {!progress.solved[other] && (
              <li>
                <button onClick={onTryOther} className="underline decoration-line underline-offset-4 hover:text-mint">
                  Solve it again in {other === 'java' ? 'Java' : 'Python'}
                </button>{' '}
                — same idea, different syntax.
              </li>
            )}
            <li>
              <a
                href={`https://leetcode.com/problemset/?search=${problem.leetcode}`}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-line underline-offset-4 hover:text-mint"
              >
                Submit it on LeetCode (#{problem.leetcode})
              </a>{' '}
              without looking back here.
            </li>
          </ul>
          <Link
            href={next ? `/p/${next.slug}` : '/'}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink"
          >
            {next ? `Next: ${next.title}` : 'Back to all problems'} <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
