'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronDown, Lock, RotateCcw } from 'lucide-react';
import type { Problem } from '@/types/content';
import { getPattern } from '@/data/patterns';
import { getProblem, problems } from '@/data/problems';
import { localize } from '@/data/problems/localize';
import { useLanguage } from '@/lib/language';
import { LanguageToggle } from './LanguageToggle';
import { REDO, STAGES, useProgress } from '@/lib/progress';
import { CodeStage } from './stages/CodeStage';
import { McqStage } from './stages/McqStage';
import { PlanStage } from './stages/PlanStage';
import { ReflectStage } from './stages/ReflectStage';

const DIFFICULTY = { Easy: 'text-mint', Medium: 'text-gold', Hard: 'text-coral' };
const CODE = 3;

function Statement({ problem }: { problem: Problem }) {
  return (
    <div className="space-y-4 text-sm leading-6">
      <p>{problem.statement}</p>
      <div className="space-y-2">
        {problem.examples.map((e, i) => (
          <div key={i} className="rounded-lg border border-line bg-ink p-3 font-mono text-xs leading-5">
            <div>
              <span className="text-muted">in&nbsp;&nbsp;</span>
              {e.input}
            </div>
            <div>
              <span className="text-muted">out </span>
              <span className="text-mint">{e.output}</span>
            </div>
            <div className="mt-1 font-sans text-muted">{e.explanation}</div>
          </div>
        ))}
      </div>
      <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted">
        {problem.constraints.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export function Workspace({ slug }: { slug: string }) {
  const source = getProblem(slug)!;
  const [lang, setLang] = useLanguage();
  // Wording, questions and hints all follow the language toggle.
  const problem = useMemo(() => localize(source, lang), [source, lang]);
  const next = problems[problems.indexOf(source) + 1];
  const { progress, update, loaded } = useProgress(slug);
  const [stage, setStage] = useState<number | null>(null);
  // Bumped by "Redo code" so the editor and its runs start fresh.
  const [attempt, setAttempt] = useState(0);

  // Resume where the learner left off; a finished problem reopens on the editor.
  useEffect(() => {
    if (loaded) setStage((current) => current ?? (progress.done ? CODE : progress.path === 'upgrade' ? 1 : progress.unlocked));
  }, [loaded, progress.done, progress.unlocked, progress.path]);

  const advance = (to: number) => {
    update((p) => ({ unlocked: Math.max(p.unlocked, to) }));
    setStage(to);
  };
  const miss = () => update((p) => ({ misses: p.misses + 1 }));

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-panel/60">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
            <ArrowLeft size={15} /> Patterns
          </Link>
          <h1 className="text-base font-semibold">{problem.title}</h1>
          <Link href={`/patterns/${problem.pattern}`} className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-mint">
            {getPattern(problem.pattern).name}
          </Link>
          <span className={`text-xs ${DIFFICULTY[problem.difficulty]}`}>{problem.difficulty}</span>
          <span className="text-xs text-muted">LeetCode #{problem.leetcode}</span>
          <LanguageToggle />
          {progress.done && (
            <button
              onClick={() => {
                update(REDO);
                setAttempt((a) => a + 1);
                setStage(CODE);
              }}
              title="Clear your code and write it again. The thinking stages stay done."
              className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-muted hover:border-mint hover:text-mint"
            >
              <RotateCcw size={12} /> Redo code
            </button>
          )}

          <nav className="ml-auto flex items-center" aria-label="Stages">
            {STAGES.map((name, i) => {
              const locked = i > progress.unlocked;
              const complete = i < progress.unlocked || (i === STAGES.length - 1 && progress.done);
              return (
                <div key={name} className="flex items-center">
                  {i > 0 && <span className={`mx-1.5 h-px w-4 sm:w-7 ${i <= progress.unlocked ? 'bg-mint' : 'bg-line'}`} />}
                  <button
                    onClick={() => setStage(i)}
                    disabled={locked}
                    aria-current={stage === i ? 'step' : undefined}
                    title={locked ? 'Finish the earlier stages to unlock this' : name}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      stage === i ? 'border-mint bg-mint/10 text-mint' : locked ? 'border-line text-muted/60' : 'border-line text-text hover:border-muted'
                    }`}
                  >
                    {locked ? <Lock size={11} /> : complete ? <Check size={12} className="text-mint" /> : <span className="font-mono">{i + 1}</span>}
                    <span className="hidden sm:inline">{name}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="px-5 py-5">
        {stage === null && <p className="text-sm text-muted">Loading…</p>}

        {stage !== null && stage < CODE && (
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <aside className="h-fit rounded-xl border border-line bg-panel p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">The problem</h2>
              <Statement problem={problem} />
            </aside>
            <section className="rounded-xl border border-line bg-panel p-6">
              {stage === 0 && (
                <>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-mint">Step 1 · Do you understand what is being asked?</p>
                  <McqStage key={`understand-${lang}`} problem={problem} lang={lang} questions={problem.understanding} doneLabel="I understand it. Choose an approach" onDone={() => advance(1)} onMiss={miss} />
                </>
              )}
              {stage === 1 && (
                <>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-mint">
                    {progress.path === 'upgrade'
                      ? 'Step 2 again · Your first version works. What would make it fast?'
                      : `Step 2 · How would you attack it${lang === 'java' ? ' in Java' : ' in Python'}? No code yet.`}
                  </p>
                  <McqStage key={`approach-${lang}`} problem={problem} lang={lang} questions={problem.approach} doneLabel="Turn it into a plan"
                    onDone={() => {
                      update({ path: 'fast' });
                      advance(2);
                    }}
                    onMiss={miss}
                    built={progress.slowCode?.[lang] ? progress.slow?.label : undefined}
                    onCodeSlower={
                      progress.path === 'upgrade'
                        ? undefined
                        : (option) => {
                            update((p) => ({ path: 'slow', slow: { label: option.label, time: option.complexity?.time }, unlocked: Math.max(p.unlocked, CODE) }));
                            setStage(CODE);
                          }
                    }
                  />
                </>
              )}
              {stage === 2 && (
                <>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-mint">Step 3 · Plan before you type</p>
                  <PlanStage key={lang} problem={problem} onDone={() => advance(CODE)} />
                </>
              )}
            </section>
          </div>
        )}

        {stage === CODE && (
          <div className="space-y-3">
            <details className="group rounded-xl border border-line bg-panel">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm">
                <ChevronDown size={15} className="text-muted transition-transform group-open:rotate-180" />
                <span className="font-medium">Problem and your plan</span>
                <span className="truncate text-muted">{problem.statement}</span>
              </summary>
              <div className="grid gap-6 border-t border-line p-4 md:grid-cols-2">
                <Statement problem={problem} />
                <ol className="space-y-2 text-sm">
                  {problem.planSteps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-xs leading-6 text-mint">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
            <CodeStage key={`${lang}-${attempt}`} problem={problem} lang={lang} progress={progress} update={update}
              onReflect={() => advance(4)}
              slow={progress.path === 'slow' ? progress.slow : undefined}
              onUpgrade={(code) => {
                update((p) => ({ path: 'upgrade', slowCode: { ...p.slowCode, [lang]: code } }));
                setStage(1);
              }}
            />
          </div>
        )}

        {stage === 4 && (
          <ReflectStage
            problem={problem}
            next={next}
            lang={lang}
            progress={progress}
            update={update}
            onTryOther={() => {
              setLang(lang === 'python' ? 'java' : 'python');
              setStage(CODE);
            }}
          />
        )}
      </div>
    </main>
  );
}
