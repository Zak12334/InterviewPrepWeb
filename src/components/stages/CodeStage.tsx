'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Monaco, OnMount } from '@monaco-editor/react';
import { ArrowRight, Check, FlaskConical, Lightbulb, Play, RotateCcw, X, Zap } from 'lucide-react';
import type { Language, Problem } from '@/types/content';
import type { RunError, TestResult, TraceResponse } from '@/types/trace';
import type { Progress } from '@/lib/progress';
import { runTests, runTrace } from '@/lib/runClient';
import { registerMemberCompletions, setCompletionContext } from '@/lib/editor/completions';
import { showJson } from '@/lib/viz/scene';
import { PlayerControls, usePlayer } from '@/components/viz/Player';
import { Visualizer } from '@/components/viz/Visualizer';
import { Story } from '@/components/viz/Story';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-muted">Loading the editor…</p>,
});

type EditorInstance = Parameters<OnMount>[0];
type Traced = { response: TraceResponse; code: string; lang: Language };
type Tab = 'tests' | 'output' | 'hints';

function defineTheme(monaco: Monaco) {
  monaco.editor.defineTheme('thinkfirst', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#111826',
      'editor.lineHighlightBackground': '#18213299',
      'editorLineNumber.foreground': '#4a5a75',
      'editorLineNumber.activeForeground': '#8a97ab',
      'editorGutter.background': '#111826',
    },
  });
}

type Props = {
  problem: Problem;
  lang: Language;
  progress: Progress;
  update: (patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => void;
  onReflect: () => void;
  /** Set while the learner is coding a slower approach on purpose. */
  slow?: { label: string; time?: string };
  /** The slower version works (or is too slow to finish): go and find the faster idea. */
  onUpgrade: (code: string) => void;
};

export function CodeStage({ problem, lang, progress, update, onReflect, slow, onUpgrade }: Props) {
  const code = progress.code[lang] ?? problem.starter[lang];

  const [live, setLive] = useState(true);
  const [traced, setTraced] = useState<Traced | null>(null);
  const [issue, setIssue] = useState<RunError | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState<number | 'custom'>(0);
  const [customText, setCustomText] = useState(() => JSON.stringify(problem.tests[0].args).slice(1, -1));
  const [tab, setTab] = useState<Tab>('tests');
  const [tests, setTests] = useState<{ results: TestResult[]; lang: Language; code: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [confirmSolution, setConfirmSolution] = useState(false);
  const [compare, setCompare] = useState<{ mine: number; capped: boolean; fast: number } | null>(null);

  const editorRef = useRef<EditorInstance | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorations = useRef<ReturnType<EditorInstance['createDecorationsCollection']> | null>(null);
  const request = useRef<AbortController | null>(null);
  /** What the most recent run was asked to execute, so live mode does not repeat it. */
  const lastRun = useRef('');

  const custom = useMemo(() => {
    try {
      const parsed = JSON.parse(`[${customText}]`) as unknown[];
      if (parsed.length !== problem.signature.params.length) {
        return { error: `Expected ${problem.signature.params.length} value(s): ${problem.signature.params.map((p) => p.name).join(', ')}` };
      }
      return { args: parsed };
    } catch {
      return { error: 'Not valid yet. Write values like [1, 2, 3], 9 or "abc".' };
    }
  }, [customText, problem]);
  const args = input === 'custom' ? custom.args : problem.tests[input].args;
  const argsKey = JSON.stringify(args);
  const signature = `${lang}\u0000${argsKey}\u0000${code}`;

  const steps = traced?.response.steps ?? [];
  const player = usePlayer(steps.length);
  const { setIndex, setPlaying, playFromStart } = player;
  const stale = !traced || traced.code !== code || traced.lang !== lang;
  const step = steps[player.index];
  const atEnd = steps.length > 0 && player.index === steps.length - 1;

  const visualize = useCallback(
    async (play: boolean) => {
      if (!args) return;
      lastRun.current = signature;
      request.current?.abort();
      const abort = new AbortController();
      request.current = abort;
      setBusy(true);
      try {
        const response = await runTrace({ slug: problem.slug, lang, code, args }, abort.signal);
        if (response.compileError) {
          setIssue(response.compileError);
        } else {
          setIssue(null);
          setTraced({ response, code, lang });
          if (play) playFromStart();
          else {
            setPlaying(false);
            setIndex(Math.max(response.steps.length - 1, 0));
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setIssue({ message: (e as Error).message, line: null });
      }
      if (request.current === abort) setBusy(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.slug, lang, code, argsKey, playFromStart, setIndex, setPlaying],
  );
  const visualizeRef = useRef(visualize);
  visualizeRef.current = visualize;

  // Live mode: re-run shortly after the learner stops typing. Java needs a compile, so it waits longer.
  useEffect(() => {
    if (!live) return;
    const timer = setTimeout(() => {
      if (lastRun.current !== signature) visualizeRef.current(false);
    }, lang === 'java' ? 1600 : 900);
    return () => clearTimeout(timer);
  }, [live, lang, signature]);

  // Mirror the animation in the editor: current line in green, failing line in red.
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const marks: { line: number; className: string }[] = [];
    if (!stale && step) marks.push({ line: step.line, className: 'tf-line' });
    const failing = issue?.line ?? (!stale && atEnd ? traced?.response.error?.line : null);
    if (failing) marks.push({ line: failing, className: 'tf-error-line' });
    decorations.current?.clear();
    decorations.current = editor.createDecorationsCollection(
      marks.map((m) => ({ range: new monaco.Range(m.line, 1, m.line, 1), options: { isWholeLine: true, className: m.className } })),
    );
    if (!stale && step && player.playing) editor.revealLineInCenterIfOutsideViewport(step.line);
  }, [step, stale, issue, atEnd, traced, player.playing]);

  // The method list after "." needs the parameter types of the problem that is open.
  useEffect(() => setCompletionContext(problem.signature.params), [problem]);

  const onMount: OnMount = (editor, monaco) => {
    registerMemberCompletions(monaco);
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => visualizeRef.current(true));
  };

  const setCode = (value: string) => update((p) => ({ code: { ...p.code, [lang]: value } }));

  const test = async () => {
    setTesting(true);
    setTab('tests');
    try {
      const response = await runTests({ slug: problem.slug, lang, code });
      if (response.compileError) {
        setIssue(response.compileError);
        setTests(null);
      } else {
        setIssue(null);
        setTests({ results: response.results, lang, code });
        if (response.results.every((r) => r.pass)) update((p) => ({ solved: { ...p.solved, [lang]: true } }));
      }
    } catch (e) {
      setIssue({ message: (e as Error).message, line: null });
    }
    setTesting(false);
  };

  const allPass = tests !== null && tests.lang === lang && tests.results.every((r) => r.pass);
  const timedOut = tests !== null && tests.lang === lang && tests.results.some((r) => r.error?.message.startsWith('Timed out'));
  const isSlow = Boolean(slow);

  // On the slower path, measure the passing code against the efficient approach on a bigger input.
  useEffect(() => {
    if (!isSlow || !allPass || !tests) return;
    let cancelled = false;
    setCompare(null);
    const run = (source: string) => runTrace({ slug: problem.slug, lang, code: source, args: problem.demoArgs });
    Promise.all([run(tests.code), run(problem.solution[lang])])
      .then(([mine, fast]) => {
        if (!cancelled) setCompare({ mine: mine.steps.length, capped: mine.limit, fast: fast.steps.length });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlow, allPass, tests]);
  const alreadyFast = compare !== null && !compare.capped && compare.mine <= compare.fast * 1.3;

  const response = traced?.response;
  const output = response ? (atEnd ? response.stdout : response.stdout.slice(0, step?.o ?? 0)) : '';
  const hintsShown = Math.min(progress.hints, 3);
  const solutionShown = progress.hints >= 4;

  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:h-[calc(100vh-178px)] xl:min-h-[600px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(340px,0.85fr)]">
      {/* ---- editor column ---- */}
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex min-h-[340px] flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <span className="font-mono text-xs text-muted">
              solution.{lang === 'python' ? 'py' : 'java'}
              {progress.solved[lang] && <Check size={11} className="ml-1 inline text-mint" />}
            </span>
            <button
              onClick={() => setLive(!live)}
              aria-pressed={live}
              title="Re-run the animation automatically as you type"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                live ? 'border-mint/50 bg-mint/10 text-mint' : 'border-line text-muted'
              }`}
            >
              <Zap size={13} /> Live {live ? 'on' : 'off'}
            </button>
            <button
              onClick={() => update((p) => ({ code: { ...p.code, [lang]: problem.starter[lang] } }))}
              title="Reset to the empty starter code"
              className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-raised hover:text-text"
              aria-label="Reset code"
            >
              <RotateCcw size={14} />
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => visualize(true)}
                disabled={!args}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:border-mint hover:text-mint disabled:opacity-40"
                title="Ctrl + Enter"
              >
                <Play size={13} /> Animate
              </button>
              <button
                onClick={test}
                disabled={testing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-50"
              >
                <FlaskConical size={13} /> {testing ? 'Running…' : 'Run tests'}
              </button>
            </div>
          </div>
          {slow && (
            <p className="border-b border-line bg-gold/5 px-3 py-1.5 text-xs text-gold">
              Your approach: {slow.label}
              {slow.time && ` (${slow.time})`}. Get it working first. Speed comes next.
            </p>
          )}
          <div className="min-h-0 flex-1">
            <Editor
              language={lang}
              path={`solution.${lang === 'python' ? 'py' : 'java'}`}
              theme="thinkfirst"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              beforeMount={defineTheme}
              onMount={onMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13.5,
                lineHeight: 22,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'none',
                // Only the method list after "." (see lib/editor/completions). No word guessing,
                // no snippets, no inline suggestions: the code you write is all yours.
                quickSuggestions: false,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: 'off',
                snippetSuggestions: 'none',
                inlineSuggest: { enabled: false },
                tabCompletion: 'off',
                parameterHints: { enabled: false },
                suggest: { showWords: false, showSnippets: false, showKeywords: false, preview: false, insertMode: 'replace' },
              }}
            />
          </div>
          {issue && (
            <div className="border-t border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral" role="alert">
              {issue.line ? `line ${issue.line}: ` : ''}
              {issue.message}
              {live && <span className="ml-2 font-sans text-muted">(the animation shows your last version that ran)</span>}
            </div>
          )}
        </div>

        <div className="flex h-64 shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex items-center gap-1 border-b border-line px-2 py-1.5" role="tablist">
            {(['tests', 'output', 'hints'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${tab === t ? 'bg-raised text-text' : 'text-muted hover:text-text'}`}
              >
                {t}
                {t === 'hints' && progress.hints > 0 && ` (${Math.min(progress.hints, 4)}/4)`}
              </button>
            ))}
            {allPass && !slow && (
              <button onClick={onReflect} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1 text-xs font-semibold text-ink">
                All tests pass. Reflect <ArrowRight size={13} />
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 text-sm">
            {tab === 'tests' && (
              <>
                {slow && (allPass || timedOut) && (
                  <div className="mb-3 rounded-lg border border-gold/40 bg-gold/10 p-3" role="status">
                    <p className="text-sm font-semibold text-gold">
                      {!allPass ? 'Right idea, but too slow to finish.' : alreadyFast ? 'It works, and it is already fast.' : 'Good. It works.'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text">
                      {!allPass
                        ? `This approach ran out of time on the larger tests. That is the cost of ${slow.time ?? 'a slow approach'}.`
                        : alreadyFast
                          ? 'Your code does about as much work as the efficient approach, so there is nothing left to speed up.'
                          : `Every test passes${slow.time ? `, but it costs ${slow.time}` : ''}. On small inputs nobody notices; on large ones this is what gets a solution rejected.`}
                      {compare && !alreadyFast && (
                        <>
                          {' '}
                          On a bigger input your code took <span className="font-mono text-gold">{compare.capped ? 'more than ' : ''}{compare.mine} steps</span>; the efficient
                          approach needs <span className="font-mono text-mint">{compare.fast}</span>.
                        </>
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!alreadyFast && (
                        <button onClick={() => onUpgrade(code)} className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-ink">
                          Now find the faster way <ArrowRight size={13} />
                        </button>
                      )}
                      {alreadyFast && (
                        <button onClick={onReflect} className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-ink">
                          Reflect <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {!tests && <p className="text-muted">Run the tests when your animation does what you planned. Click any result to watch that case.</p>}
                {tests && (tests.code !== code || tests.lang !== lang) && <p className="mb-2 text-xs text-gold">Results are from an earlier version of your code.</p>}
                <ul className="space-y-1">
                  {tests?.results.map((r) => (
                    <li key={r.i}>
                      <button
                        onClick={() => {
                          setInput(r.i);
                          setTimeout(() => visualizeRef.current(true), 0);
                        }}
                        className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs hover:bg-raised"
                      >
                        {r.pass ? <Check size={14} className="mt-px shrink-0 text-mint" /> : <X size={14} className="mt-px shrink-0 text-coral" />}
                        <span className="min-w-0 flex-1 break-words">
                          <span className="text-muted">{r.args.map((a) => showJson(a, lang)).join(', ')}</span>
                          {r.pass ? (
                            <span> → {showJson(r.got, lang)}</span>
                          ) : r.error ? (
                            <span className="text-coral"> → {r.error.message}</span>
                          ) : (
                            <span>
                              {' '}→ <span className="text-coral">{showJson(r.got, lang)}</span>, expected <span className="text-mint">{showJson(r.expected, lang)}</span>
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {tab === 'output' && (
              <pre className="whitespace-pre-wrap font-mono text-xs text-text">
                {output || <span className="text-muted">Anything your code prints shows up here, in step with the animation.</span>}
              </pre>
            )}
            {tab === 'hints' && (
              <div className="space-y-3">
                {problem.hints.slice(0, hintsShown).map((hint, i) => (
                  <div key={i} className="rounded-lg border border-iris/30 bg-iris/10 p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-iris">{['A question', 'The pattern', 'A skeleton'][i]}</p>
                    <p className={`whitespace-pre-wrap text-sm ${i === 2 ? 'font-mono text-xs' : ''}`}>{hint}</p>
                  </div>
                ))}
                {solutionShown && (
                  <div className="rounded-lg border border-gold/40 bg-gold/10 p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gold">Full solution</p>
                    <pre className="overflow-x-auto font-mono text-xs">{problem.solution[lang]}</pre>
                    <p className="mt-2 text-xs text-muted">Read it, close it, then write it yourself from memory. Typing it in while looking does not count.</p>
                  </div>
                )}
                {hintsShown < 3 && (
                  <button
                    onClick={() => update((p) => ({ hints: p.hints + 1 }))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-iris hover:text-iris"
                  >
                    <Lightbulb size={13} /> {hintsShown === 0 ? 'Give me a nudge' : 'A stronger hint'}
                  </button>
                )}
                {hintsShown === 3 && !solutionShown && !confirmSolution && (
                  <button onClick={() => setConfirmSolution(true)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-gold">
                    Show the full solution
                  </button>
                )}
                {confirmSolution && !solutionShown && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted">Have you stepped through your own code line by line first?</span>
                    <button onClick={() => update({ hints: 4 })} className="rounded-lg border border-gold/50 px-3 py-1.5 font-medium text-gold">
                      Yes, show it
                    </button>
                    <button onClick={() => setConfirmSolution(false)} className="rounded-lg border border-line px-3 py-1.5 font-medium">
                      Keep trying
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- animation column ---- */}
      <div className="flex min-h-[480px] flex-col overflow-hidden rounded-xl border border-line bg-panel lg:min-h-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          <span className="text-sm font-semibold">Your code, running</span>
          {busy && <span className="h-2 w-2 animate-pulse rounded-full bg-mint" aria-label="Running" />}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted">
            Input
            <select
              value={String(input)}
              onChange={(e) => setInput(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
              className="rounded-md border border-line bg-raised px-2 py-1 text-xs text-text"
            >
              {problem.tests.map((t, i) => (
                <option key={i} value={i}>
                  {`Case ${i + 1}: ${t.args.map((a) => showJson(a, lang)).join(', ')}`.slice(0, 48)}
                </option>
              ))}
              <option value="custom">My own input…</option>
            </select>
          </label>
        </div>
        {input === 'custom' && (
          <div className="border-b border-line px-3 py-2">
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              spellCheck={false}
              aria-label="Custom input"
              className="w-full rounded-md border border-line bg-ink px-2 py-1.5 font-mono text-xs"
            />
            <p className={`mt-1 text-[11px] ${custom.error ? 'text-coral' : 'text-muted'}`}>
              {custom.error ?? `${problem.signature.params.map((p) => p.name).join(', ')} — separated by commas`}
            </p>
          </div>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto p-4 transition-opacity ${stale && !live ? 'opacity-50' : ''}`}>
          {steps.length === 0 ? (
            <p className="text-sm text-muted">
              {busy ? 'Running your code…' : 'Start typing. Every line you write is executed for real and drawn here: arrays, pointers, maps, stacks, linked lists, trees and the call stack.'}
            </p>
          ) : (
            <Visualizer steps={steps} index={player.index} code={traced!.code} lang={traced!.lang} />
          )}
        </div>

        {response && atEnd && (
          <div className="border-t border-line px-3 py-2" role="status">
            {response.error ? (
              <p className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral">
                Crashed{response.error.line ? ` on line ${response.error.line}` : ''}: {response.error.message}
              </p>
            ) : response.limit ? (
              <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
                Stopped after {steps.length} steps. That usually means a loop whose condition never becomes false. Step back and watch which variable is not changing.
              </p>
            ) : (
              <p className={`rounded-lg border px-3 py-2 font-mono text-xs ${response.pass === false ? 'border-coral/40 bg-coral/10' : response.pass ? 'border-mint/40 bg-mint/10' : 'border-line'}`}>
                returned {showJson(response.result, traced!.lang)}
                {response.pass === true && <span className="text-mint"> ✓ correct for this input</span>}
                {response.pass === false && <span className="text-coral"> ✗ expected {showJson(response.expected, traced!.lang)}</span>}
              </p>
            )}
          </div>
        )}


        {stale && !live && traced && (
          <p className="border-t border-line px-3 py-1.5 text-xs text-gold">Your code changed since this animation. Press Animate (Ctrl + Enter) to refresh.</p>
        )}
        <div className="border-t border-line px-3 py-2.5">
          <PlayerControls {...player} length={steps.length} />
        </div>
      </div>

      {/* ---- story column ---- */}
      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-panel lg:col-span-2 xl:col-span-1 xl:min-h-0">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-sm font-semibold">What your code did</span>
          {stale && traced && <span className="text-xs text-gold">from your last run</span>}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {traced && steps.length > 0 ? (
            <Story
              code={traced.code}
              lang={traced.lang}
              steps={steps}
              currentLine={stale ? undefined : step?.line}
              result={traced.response.result}
              error={traced.response.error?.message}
              onJump={(i) => {
                setPlaying(false);
                setIndex(i);
              }}
            />
          ) : (
            <p className="text-sm leading-6 text-muted">
              Once your code runs, this column tells its story in plain words, line by line: what you create, what each loop goes through, what every check decides, and the values things took on this run.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
