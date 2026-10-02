'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Check, CheckCircle2, ExternalLink, Eye, ListTodo, RotateCcw, Trophy } from 'lucide-react';
import type { Problem } from '@/types/content';
import { patterns } from '@/data/patterns';
import { problems, problemsOf } from '@/data/problems';
import { DIFFICULTIES, useDifficulty } from '@/lib/difficulty';
import { redoCode, useAllProgress } from '@/lib/progress';
import type { Progress } from '@/lib/progress';
import { LanguageToggle } from './LanguageToggle';

const PICKED = { All: 'bg-text text-ink', Easy: 'bg-mint text-ink', Medium: 'bg-gold text-ink', Hard: 'bg-coral text-ink' };
const PILL = { Easy: 'bg-mint/15 text-mint', Medium: 'bg-gold/15 text-gold', Hard: 'bg-coral/15 text-coral' };

/** Faint mountains with a winding path to a flag, behind the progress card. */
function Landscape() {
  return (
    <svg viewBox="0 0 700 260" className="pointer-events-none absolute -top-24 right-0 hidden h-[260px] w-[700px] lg:block" aria-hidden>
      <defs>
        <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ee9b5" stopOpacity="0.10" />
          <stop offset="1" stopColor="#5ee9b5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 260 L120 150 L200 190 L320 70 L420 160 L520 60 L620 140 L700 90 L700 260 Z" fill="url(#ridge)" />
      <path d="M0 260 L90 200 L190 230 L300 140 L400 210 L500 130 L600 200 L700 160 L700 260 Z" fill="#5ee9b5" fillOpacity="0.04" />
      <path d="M300 250 C 380 230, 360 190, 450 180 S 560 170, 520 130 S 600 80, 640 60" fill="none" stroke="#5ee9b5" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
      {[
        [300, 250],
        [450, 180],
        [520, 130],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="5" fill="#5ee9b5" fillOpacity="0.7" />
      ))}
      <circle cx="640" cy="60" r="7" fill="#5ee9b5" />
      <path d="M640 60 V22 L662 30 L640 38" fill="#5ee9b5" />
    </svg>
  );
}

function Ring({ value }: { value: number }) {
  const r = 34;
  const length = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 84 84" className="h-20 w-20 shrink-0 -rotate-90" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#25324a" strokeWidth="7" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="#5ee9b5"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${length * value} ${length}`}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function Tile({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-ink/60 px-3 py-2.5">
      {icon}
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="mt-1 text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}

/** One problem inside a pattern card. */
function Row({ problem, progress }: { problem: Problem; progress: Progress | undefined }) {
  const router = useRouter();
  const done = progress?.done;
  const started = !done && progress && progress.unlocked > 0;
  return (
    <div className="group flex items-center gap-2.5 rounded-lg border border-line bg-ink/40 px-3 py-2 hover:border-muted/60">
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          done ? 'border-mint bg-mint text-ink' : started ? 'border-gold' : 'border-line'
        }`}
        title={done ? 'Learned' : started ? 'In progress' : 'Not started'}
      >
        {done && <Check size={12} strokeWidth={3} />}
      </span>
      <Link href={`/p/${problem.slug}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-mint" title={progress?.notes || problem.title}>
        {problem.title}
      </Link>
      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${PILL[problem.difficulty]}`}>{problem.difficulty}</span>
      {progress?.solved.python && <span className="shrink-0 rounded-md bg-raised px-2 py-0.5 text-[11px] text-muted">Python ✓</span>}
      {progress?.solved.java && <span className="shrink-0 rounded-md bg-raised px-2 py-0.5 text-[11px] text-muted">Java ✓</span>}
      {done && (
        <button
          onClick={() => {
            redoCode(problem.slug);
            router.push(`/p/${problem.slug}`);
          }}
          title="Redo code: clear your code and write it again (the thinking stages stay done)"
          aria-label={`Redo the code for ${problem.title}`}
          className="shrink-0 rounded p-1 text-muted hover:text-mint"
        >
          <RotateCcw size={14} />
        </button>
      )}
      <a
        href={`https://leetcode.com/problemset/?search=${problem.leetcode}`}
        target="_blank"
        rel="noreferrer"
        title={`LeetCode #${problem.leetcode}`}
        aria-label={`Open ${problem.title} on LeetCode`}
        className="shrink-0 rounded p-1 text-muted hover:text-mint"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

export function Dashboard() {
  const store = useAllProgress();
  const [difficulty, setDifficulty] = useDifficulty();
  const matches = (d: string) => difficulty === 'All' || d === difficulty;

  const shown = problems.filter((p) => matches(p.difficulty));
  const learned = shown.filter((p) => store?.[p.slug]?.done).length;
  // Roadmap order within the chosen difficulty.
  const resume = shown.find((p) => !store?.[p.slug]?.done) ?? shown[0];
  const share = shown.length ? learned / shown.length : 0;
  const label = difficulty === 'All' ? '' : `${difficulty.toLowerCase()} `;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-line/70">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint font-black text-ink">T</span>
            <span className="text-lg font-semibold">ThinkFirst</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="border-b-2 border-mint pb-1 font-medium text-text">
              Roadmap
            </Link>
            <Link href="/spot" className="border-b-2 border-transparent pb-1 text-muted hover:text-text">
              Spot the pattern
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1600px] px-5 pb-16 sm:px-8">
        {/* ---- hero ---- */}
        <header className="relative grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
              <span className="text-mint">{patterns.length}</span> patterns. Learn to spot them,
              <br className="hidden sm:block" /> and most problems stop being <span className="text-mint">new.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Each pattern has its tell-tale signs, a code template, and problems from easy to hard. For every problem you reason first, plan, then watch your own code
              run.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-3 text-sm text-muted">
                I am practising in
                <LanguageToggle size="lg" />
              </div>
              <span className="hidden h-7 w-px bg-line sm:block" />
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

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/spot" className="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-3 text-sm font-semibold hover:border-mint hover:text-mint">
                <Eye size={17} /> Spot the pattern
              </Link>
              {resume && (
                <Link
                  href={`/p/${resume.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-3 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(94,233,181,0.25)]"
                >
                  {learned === 0 && !store?.[resume.slug] ? 'Start' : 'Continue'}: {resume.title} <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <Landscape />
            <div className="relative rounded-2xl border border-line bg-panel/90 p-5 backdrop-blur">
              <div className="flex items-center gap-5">
                <Ring value={share} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {learned} of {shown.length} {label}problems learned
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-mint transition-all duration-700" style={{ width: `${share * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted">{Math.round(share * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Tile icon={<CheckCircle2 size={22} className="text-mint" />} value={learned} label="Completed" />
                <Tile icon={<ListTodo size={22} className="text-aqua" />} value={shown.length - learned} label="To do" />
                <Tile icon={<Trophy size={22} className="text-gold" />} value={patterns.length} label="Patterns" />
              </div>
            </div>
          </div>
        </header>

        {/* ---- roadmap ---- */}
        <div className="mb-4 mt-12 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            The roadmap
            {difficulty !== 'All' && <span className={`ml-2 normal-case tracking-normal ${PILL[difficulty].split(' ')[1]}`}>· {difficulty} only</span>}
          </h2>
          <p className="text-sm text-muted">Learn pattern by pattern. Open a pattern to see how to spot it and its template, then solve its problems.</p>
        </div>

        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patterns.map((pattern, i) => {
            const list = problemsOf(pattern.id).filter((p) => matches(p.difficulty));
            const done = list.filter((p) => store?.[p.slug]?.done).length;
            const complete = list.length > 0 && done === list.length;
            const current = resume !== undefined && list.includes(resume);
            const elsewhere = difficulty === 'All' ? [] : pattern.more.filter((m) => m[2] === difficulty);
            return (
              <li
                key={pattern.id}
                className={`flex flex-col rounded-2xl border bg-panel p-4 ${
                  current ? 'border-mint/70 shadow-[0_0_0_1px_rgba(94,233,181,0.25),0_0_32px_rgba(94,233,181,0.12)]' : 'border-line'
                } ${list.length === 0 ? 'opacity-60' : ''}`}
              >
                <div className="flex gap-3">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold ${
                      complete ? 'bg-mint/15 text-mint' : 'bg-raised text-text'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/patterns/${pattern.id}`} className="truncate text-base font-semibold hover:text-mint">
                        {pattern.name}
                      </Link>
                      {complete && <CheckCircle2 size={17} className="shrink-0 text-mint" />}
                      {list.length > 0 && (
                        <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted">
                          {done} / {list.length}
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                            <span className="block h-full rounded-full bg-mint" style={{ width: `${(done / list.length) * 100}%` }} />
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-muted">{pattern.idea}</p>
                  </div>
                </div>

                <div className="mt-3 flex-1 space-y-2">
                  {list.map((problem) => (
                    <Row key={problem.slug} problem={problem} progress={store?.[problem.slug]} />
                  ))}
                  {list.length === 0 && (
                    <div className="space-y-1 rounded-lg border border-dashed border-line px-3 py-2.5 text-xs text-muted">
                      <p>No {label}problem on the site for this pattern yet.</p>
                      {elsewhere.map(([number, title]) => (
                        <a
                          key={number}
                          href={`https://leetcode.com/problemset/?search=${number}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-text hover:text-mint"
                        >
                          Try #{number} {title} on LeetCode <ExternalLink size={11} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <Link
                    href={`/patterns/${pattern.id}`}
                    className="flex items-center justify-center gap-2 rounded-lg border border-line py-2 text-sm font-medium hover:border-mint hover:text-mint"
                  >
                    <BookOpen size={15} /> How to spot it
                  </Link>
                  {current && resume && (
                    <Link href={`/p/${resume.slug}`} className="flex items-center justify-center gap-2 rounded-lg bg-mint py-2 text-sm font-semibold text-ink">
                      {store?.[resume.slug] ? 'Continue' : 'Start'}: {resume.title} <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
