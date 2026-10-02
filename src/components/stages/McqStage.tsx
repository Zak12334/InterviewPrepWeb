'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, PlayCircle, X } from 'lucide-react';
import type { Language, Mcq, McqOption, Problem } from '@/types/content';
import type { TraceResponse } from '@/types/trace';
import { runTrace } from '@/lib/runClient';
import { showJson } from '@/lib/viz/scene';
import { PlayerControls, usePlayer } from '@/components/viz/Player';
import { Visualizer } from '@/components/viz/Visualizer';
import { LANGUAGE_NAME } from '@/components/LanguageToggle';

/** Plays an approach on the demo input with the code hidden, so the idea is visible but the answer is not. */
function Demo({ problem, option, lang, onSteps }: { problem: Problem; option: McqOption; lang: Language; onSteps: (n: number) => void }) {
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [failed, setFailed] = useState('');
  const steps = trace?.steps ?? [];
  const player = usePlayer(steps.length);
  const { playFromStart, setSpeed } = player;

  useEffect(() => {
    const abort = new AbortController();
    runTrace({ slug: problem.slug, lang: 'python', code: option.demo!, args: problem.demoArgs }, abort.signal)
      .then((t) => {
        setTrace(t);
        onSteps(t.steps.length);
        setSpeed(2);
        playFromStart();
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setFailed(e.message);
      });
    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.slug, option.demo]);

  if (failed) return <p className="mt-3 text-sm text-coral">{failed}</p>;
  if (!trace) return <p className="mt-3 text-sm text-muted">Running this idea…</p>;

  const input = problem.signature.params.map((p, i) => `${p.name} = ${showJson(problem.demoArgs[i], lang)}`).join(', ');
  return (
    <div className="mt-3 rounded-lg border border-line bg-ink p-4">
      <p className="mb-3 text-xs text-muted">
        Input: <span className="font-mono text-text">{input}</span>
      </p>
      <Visualizer steps={steps} index={player.index} code={option.demo!} lang="python" displayLang={lang} hideSource />
      <div className="mt-4 border-t border-line pt-3">
        <PlayerControls {...player} length={steps.length} />
      </div>
      <p className="mt-2 text-xs text-muted">
        This idea needs <span className="font-mono text-gold">{steps.length} steps</span> on this input and returns{' '}
        <span className="font-mono text-text">{showJson(trace.result, lang)}</span>.
      </p>
    </div>
  );
}

type Props = {
  problem: Problem;
  lang: Language;
  questions: Mcq[];
  /** Text on the button that leaves the stage. */
  doneLabel: string;
  onDone: () => void;
  onMiss: () => void;
  /** Lets the learner go and code an approach that works but is not the fastest. */
  onCodeSlower?: (option: McqOption) => void;
  /** Label of the slower approach the learner has already coded. */
  built?: string;
};

export function McqStage({ problem, lang, questions, doneLabel, onDone, onMiss, onCodeSlower, built }: Props) {
  const [q, setQ] = useState(0);
  // picked[q] = option indexes opened so far, in order
  const [picked, setPicked] = useState<number[][]>(() => questions.map(() => []));
  const [open, setOpen] = useState<number | null>(null);
  const [watching, setWatching] = useState<number | null>(null);
  const [stepCounts, setStepCounts] = useState<Record<string, number>>({});

  const question = questions[q];
  const mine = picked[q];
  const solved = mine.some((i) => question.options[i].correct);
  const last = question.options[mine[mine.length - 1]];

  const pick = (i: number) => {
    setOpen(i);
    setWatching(null);
    if (mine.includes(i)) return;
    if (!solved && !question.options[i].correct && !question.options[i].valid) onMiss();
    setPicked((all) => all.map((list, j) => (j === q ? [...list, i] : list)));
  };

  const next = () => {
    if (q === questions.length - 1) return onDone();
    setQ(q + 1);
    setOpen(null);
    setWatching(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {questions.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < q ? 'bg-mint' : i === q ? 'bg-mint/50' : 'bg-line'}`} />
        ))}
        <span className="ml-2 text-xs text-muted">
          {q + 1} of {questions.length}
        </span>
      </div>

      <motion.div key={q} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>
        {question.lang && (
          <p className="mb-2 inline-block rounded bg-iris/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-iris">
            {LANGUAGE_NAME[question.lang]} specifics
          </p>
        )}
        <h2 className="mb-5 text-xl font-semibold leading-snug">{question.prompt}</h2>
        <div className="space-y-2">
          {question.options.map((option, i) => {
            const seen = mine.includes(i);
            const tone = !seen
              ? 'border-line hover:border-muted'
              : option.correct
                ? 'border-mint bg-mint/5'
                : option.valid
                  ? 'border-gold/60 bg-gold/5'
                  : 'border-coral/60 bg-coral/5';
            const dot = option.correct ? 'border-mint bg-mint text-ink' : option.valid ? 'border-gold bg-gold text-ink' : 'border-coral bg-coral text-ink';
            const count = stepCounts[`${q}:${i}`];
            return (
              <div key={i} className={`rounded-lg border transition-colors ${tone}`}>
                <button onClick={() => pick(i)} className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm">
                  <span
                    className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] ${
                      !seen ? 'border-line text-muted' : dot
                    }`}
                  >
                    {!seen ? String.fromCharCode(65 + i) : option.correct || option.valid ? <Check size={12} /> : <X size={12} />}
                  </span>
                  <span className={`flex-1 ${question.lang ? 'font-mono text-[13px]' : ''}`}>
                    {option.label}
                    {built === option.label && <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-[11px] font-medium text-gold">you built this</span>}
                  </span>
                  {seen && option.complexity && (
                    <span className="shrink-0 font-mono text-xs text-muted">
                      time {option.complexity.time} · space {option.complexity.space}
                    </span>
                  )}
                </button>
                {seen && open === i && (
                  <div className="px-4 pb-4 pl-12 text-sm">
                    {option.valid && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold">Works, but not the fastest</p>}
                    {option.correct && question.options.some((o) => o.valid) && (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-mint">The efficient way</p>
                    )}
                    <p className={option.correct ? 'text-mint' : 'text-text'}>{option.feedback}</p>
                    {option.demo && (
                      <button
                        onClick={() => setWatching(watching === i ? null : i)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:border-mint hover:text-mint"
                      >
                        <PlayCircle size={14} />
                        {watching === i ? 'Hide the run' : 'Watch this idea run'}
                        {count !== undefined && <span className="font-mono text-gold">· {count} steps</span>}
                      </button>
                    )}
                    {option.valid && onCodeSlower && (
                      <button
                        onClick={() => onCodeSlower(option)}
                        className="ml-2 mt-3 inline-flex items-center gap-1.5 rounded-md border border-gold/50 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/10"
                      >
                        Code it this way first <ArrowRight size={13} />
                      </button>
                    )}
                    {watching === i && option.demo && (
                      <Demo problem={problem} option={option} lang={lang} onSteps={(n) => setStepCounts((c) => ({ ...c, [`${q}:${i}`]: n }))} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            {solved
              ? 'Open the other options too. Knowing why they fail is half of the understanding.'
              : last?.valid
                ? onCodeSlower
                  ? 'That works. Code it this way first if you like, or look for the faster idea now.'
                  : 'That works, but there is a faster idea. Which is it?'
                : mine.length > 0
                  ? 'Not that one. Read why, then try again.'
                : 'Commit to an answer before reading on.'}
          </p>
          <button
            onClick={next}
            disabled={!solved}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink disabled:opacity-30"
          >
            {q === questions.length - 1 ? doneLabel : 'Next question'}
            <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
