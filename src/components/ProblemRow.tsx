'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, RotateCcw } from 'lucide-react';
import type { Problem } from '@/types/content';
import { STAGES, redoCode } from '@/lib/progress';
import type { Progress } from '@/lib/progress';

export const DIFFICULTY = { Easy: 'text-mint', Medium: 'text-gold', Hard: 'text-coral' };

function status(p: Progress | undefined) {
  if (!p || (p.unlocked === 0 && !p.done)) return { text: 'Not started', tone: 'text-muted' };
  if (p.done) return { text: 'Learned', tone: 'text-mint' };
  return { text: `In progress · ${STAGES[p.unlocked]}`, tone: 'text-gold' };
}

/** One problem in a list, with its difficulty and how far the learner has got. */
export function ProblemRow({ problem, progress }: { problem: Problem; progress: Progress | undefined }) {
  const router = useRouter();
  const s = status(progress);
  return (
    <div className="flex items-center hover:bg-raised">
      <Link href={`/p/${problem.slug}`} className="grid min-w-0 flex-1 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-2.5">
        <span className={`grid h-5 w-5 place-items-center rounded-full border ${progress?.done ? 'border-mint bg-mint text-ink' : 'border-line'}`}>
          {progress?.done && <Check size={12} />}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="truncate text-sm font-medium">{problem.title}</span>
            <span className={`text-xs ${DIFFICULTY[problem.difficulty]}`}>{problem.difficulty}</span>
            {progress?.solved.python && <span className="text-xs text-muted">Python ✓</span>}
            {progress?.solved.java && <span className="text-xs text-muted">Java ✓</span>}
          </span>
          {progress?.notes && <span className="mt-0.5 block truncate text-xs italic text-muted">“{progress.notes}”</span>}
        </span>
        <span className={`text-xs ${s.tone}`}>{s.text}</span>
      </Link>
      {progress?.done && (
        <button
          onClick={() => {
            redoCode(problem.slug);
            router.push(`/p/${problem.slug}`);
          }}
          title="Clear your code and write it again. The thinking stages stay done."
          className="mr-3 inline-flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-muted hover:border-mint hover:text-mint"
        >
          <RotateCcw size={12} /> Redo code
        </button>
      )}
    </div>
  );
}
