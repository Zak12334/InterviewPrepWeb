'use client';

import { useMemo } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { Language } from '@/types/content';
import type { Step, Value } from '@/types/trace';
import { buildScene, forEachCursors, show } from '@/lib/viz/scene';
import type { ArrayView, BagView, GridView, MapView, Scalar } from '@/lib/viz/scene';
import { LinkedListView, TreeView, layoutLists } from './NodeViews';

const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;
const FLASH_FROM = { backgroundColor: 'rgba(94,233,181,0.45)' };
const FLASH_TO = { backgroundColor: 'rgba(94,233,181,0)' };

function Section({ label, kind, children }: { label: string; kind: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-sm text-text">{label}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted">{kind}</span>
      </h4>
      {children}
    </section>
  );
}

function Arrays({ view, lang }: { view: ArrayView; lang: Language }) {
  const cell = view.isString ? 32 : 46;
  const gap = 5;
  const pitch = cell + gap;
  const width = Math.max(view.items.length * pitch - gap, 0);
  const at = (i: number) => view.pointers.find((p) => p.index === i);

  return (
    <Section label={view.name} kind={view.isString ? 'string' : 'array'}>
      {view.items.length === 0 ? (
        <p className="text-xs text-muted">empty</p>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="relative" style={{ width }}>
            {view.range && (
              <motion.div
                initial={false}
                animate={{ left: view.range[0] * pitch - 3, width: (view.range[1] - view.range[0] + 1) * pitch - gap + 6 }}
                transition={SPRING}
                className="absolute -top-[3px] rounded-lg bg-mint/10 ring-1 ring-mint/30"
                style={{ height: cell + 6 }}
              />
            )}
            <div className="relative flex" style={{ gap }}>
              {view.items.map((item, i) => {
                const pointer = at(i);
                const outside = view.range && (i < view.range[0] || i > view.range[1]);
                return (
                  <div key={i} className="shrink-0 text-center" style={{ width: cell }}>
                    <motion.div
                      key={view.changed.has(i) ? `${i}:${JSON.stringify(item)}` : i}
                      initial={view.changed.has(i) ? { scale: 1.2 } : false}
                      animate={{ scale: 1, opacity: outside ? 0.4 : 1 }}
                      className="grid place-items-center rounded-md border bg-raised font-mono text-sm"
                      style={{ height: cell, borderColor: pointer?.color ?? '#25324a', borderWidth: pointer ? 2 : 1 }}
                    >
                      {view.isString ? (item as { v: string }).v : show(item, lang)}
                    </motion.div>
                    <span className="font-mono text-[10px] text-muted">{i}</span>
                  </div>
                );
              })}
            </div>
            {/* one lane per pointer, so labels slide without colliding */}
            {view.pointers.map((p) => (
              <div key={p.name} className="relative h-[20px]">
                <motion.div
                  initial={false}
                  animate={{ x: p.index * pitch + cell / 2 }}
                  transition={SPRING}
                  className="absolute left-0 top-0"
                >
                  <span
                    className="block -translate-x-1/2 whitespace-nowrap rounded px-1.5 font-mono text-[11px] font-semibold leading-[18px] text-ink"
                    style={{ background: p.color }}
                  >
                    {p.name}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )}
      {view.total > view.items.length && <p className="text-[11px] text-muted">showing the first {view.items.length} of {view.total}</p>}
    </Section>
  );
}

function Grids({ view, lang }: { view: GridView; lang: Language }) {
  return (
    <Section label={view.name} kind="grid">
      <div className="inline-flex flex-col gap-1 overflow-x-auto">
        {view.rows.map((row, r) => (
          <div key={r} className="flex items-center gap-1">
            <span className="w-5 text-right font-mono text-[10px] text-muted">{r}</span>
            {row.map((cell, c) => {
              const here = view.row?.index === r && (view.col ? view.col.index === c : true);
              return (
                <motion.div
                  key={view.changed.has(`${r},${c}`) ? `${c}:${JSON.stringify(cell)}` : c}
                  initial={view.changed.has(`${r},${c}`) ? { scale: 1.25 } : false}
                  animate={{ scale: 1 }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded border bg-raised font-mono text-xs"
                  style={{ borderColor: here ? view.row!.color : '#25324a', borderWidth: here ? 2 : 1 }}
                >
                  {typeof cell === 'object' && cell !== null && cell.t === 'str' ? cell.v : show(cell, lang)}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      {(view.row || view.col) && (
        <p className="mt-1 font-mono text-[11px] text-muted">
          {[view.row, view.col].filter(Boolean).map((p) => `${p!.name} = ${p!.index}`).join(' · ')}
        </p>
      )}
    </Section>
  );
}

function Maps({ view, lang }: { view: MapView; lang: Language }) {
  return (
    <Section label={view.name} kind="hash map">
      <div className="max-w-xs overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-2 bg-ink px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted">
          <span>key</span>
          <span>value</span>
        </div>
        {view.entries.length === 0 && <p className="px-3 py-3 text-xs text-muted">empty</p>}
        <AnimatePresence initial={false}>
          {view.entries.map(([k, v]) => {
            const id = JSON.stringify(k);
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="grid grid-cols-2 border-t border-line px-3 py-1.5 font-mono text-sm"
              >
                <span className="text-iris">{show(k, lang)}</span>
                <motion.span key={JSON.stringify(v)} initial={view.changed.has(id) ? FLASH_FROM : false} animate={FLASH_TO} transition={{ duration: 0.8 }} className="rounded px-1">
                  {show(v, lang)}
                </motion.span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Section>
  );
}

const BAG_KIND = { set: 'set', stack: 'stack', queue: 'queue', heap: 'heap (internal order)' };

function Bags({ view, lang, heap }: { view: BagView; lang: Language; heap: Step['heap'] }) {
  const chip = (item: Value, i: number, extra = '') => (
    <motion.div
      key={view.kind === 'set' ? JSON.stringify(item) : i}
      layout
      initial={{ opacity: 0, scale: 0.5, y: view.kind === 'stack' ? -14 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: view.kind === 'stack' ? -14 : 0 }}
      transition={SPRING}
      className={`grid h-9 min-w-9 place-items-center rounded-md border border-line bg-raised px-2 font-mono text-sm ${extra}`}
    >
      {typeof item === 'object' && item !== null && item.t === 'str' ? item.v : show(item, lang, heap)}
    </motion.div>
  );

  return (
    <Section label={view.name} kind={BAG_KIND[view.kind]}>
      {view.kind === 'stack' ? (
        <div className="inline-flex min-h-[52px] w-28 flex-col-reverse gap-1 rounded-b-lg border-x-2 border-b-2 border-line px-2 pb-2 pt-3">
          <AnimatePresence initial={false}>
            {view.items.map((item, i) => chip(item, i, i === view.items.length - 1 ? '!border-mint' : ''))}
          </AnimatePresence>
          {view.items.length === 0 && <span className="py-1 text-center text-xs text-muted">empty</span>}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {view.kind === 'queue' && view.items.length > 0 && <span className="text-[10px] uppercase tracking-widest text-muted">front</span>}
          <AnimatePresence initial={false}>{view.items.map((item, i) => chip(item, i))}</AnimatePresence>
          {view.kind === 'queue' && view.items.length > 0 && <span className="text-[10px] uppercase tracking-widest text-muted">back</span>}
          {view.items.length === 0 && <span className="text-xs text-muted">empty</span>}
        </div>
      )}
      {view.kind === 'stack' && view.items.length > 0 && <p className="mt-1 text-[11px] text-muted">top is highlighted</p>}
    </Section>
  );
}

function Scalars({ scalars, lang, heap }: { scalars: Scalar[]; lang: Language; heap: Step['heap'] }) {
  if (scalars.length === 0) return null;
  return (
    <Section label="variables" kind="">
      <div className="flex flex-wrap gap-2">
        {scalars.map((s) => (
          <div key={s.name} className="rounded-lg border bg-raised px-3 py-1.5" style={{ borderColor: s.color ?? '#25324a' }}>
            <div className="font-mono text-[11px]" style={{ color: s.color ?? '#8a97ab' }}>{s.name}</div>
            <motion.div
              key={JSON.stringify(s.value)}
              initial={s.changed ? FLASH_FROM : false}
              animate={FLASH_TO}
              transition={{ duration: 0.8 }}
              className="max-w-[260px] truncate rounded font-mono text-sm"
            >
              {show(s.value, lang, heap)}
            </motion.div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CallStack({ step }: { step: Step }) {
  return (
    <Section label="call stack" kind="recursion">
      <div className="flex max-h-56 flex-col-reverse gap-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {step.frames.map((frame, i) => {
            const running = i === step.frames.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={SPRING}
                className={`w-fit rounded-md border px-2.5 py-1 font-mono text-xs ${running ? 'border-mint bg-mint/10 text-mint' : 'border-line bg-raised text-muted'}`}
              >
                {frame.fn}({frame.args})
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Section>
  );
}

export type VisualizerProps = {
  steps: Step[];
  index: number;
  code: string;
  lang: Language;
  /** Hide the line of source (used by the approach demos, where the code is the spoiler). */
  hideSource?: boolean;
  /** Write values (None/null, True/true) in this language instead of the one the code is in. */
  displayLang?: Language;
};

export function Visualizer({ steps, index, code, lang: codeLang, hideSource, displayLang }: VisualizerProps) {
  const cursors = useMemo(() => forEachCursors(steps, code, codeLang), [steps, code, codeLang]);
  const lang = displayLang ?? codeLang;
  const listLayout = useMemo(() => layoutLists(steps), [steps]);
  const recursive = useMemo(() => steps.some((s) => s.depth > 1), [steps]);

  const step = steps[index];
  const scene = useMemo(
    () => (step ? buildScene(step, steps[index - 1], code, cursors[index] ?? []) : null),
    [step, steps, index, code, cursors],
  );
  if (!step || !scene) return null;

  const source = code.split('\n')[step.line - 1]?.trim();
  const empty =
    scene.arrays.length + scene.grids.length + scene.maps.length + scene.bags.length + scene.scalars.length === 0 && !step.heap;

  return (
    <LayoutGroup>
      <div className="space-y-5">
        {!hideSource && (
          <div className="rounded-lg border border-line bg-ink px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="rounded bg-mint/15 px-1.5 py-0.5 font-mono text-mint">line {step.line}</span>
              <span>{step.ev === 'return' ? 'returning from' : 'about to run'}</span>
            </div>
            <code className="mt-1 block truncate font-mono text-sm text-text">{source}</code>
            {step.ev === 'return' && (
              <div className="mt-1 font-mono text-sm text-gold">
                ↩ {step.fn} returns {step.ret === undefined ? 'nothing' : show(step.ret, lang, step.heap)}
              </div>
            )}
          </div>
        )}
        {hideSource && step.ev === 'return' && (
          <div className="font-mono text-sm text-gold">↩ returns {step.ret === undefined ? 'nothing' : show(step.ret, lang, step.heap)}</div>
        )}

        {scene.arrays.map((v) => <Arrays key={v.name} view={v} lang={lang} />)}
        {scene.grids.map((v) => <Grids key={v.name} view={v} lang={lang} />)}
        {step.heap && Object.values(step.heap).some((n) => n.k === 'list') && (
          <Section label="linked list" kind="nodes"><LinkedListView step={step} layout={listLayout} lang={lang} /></Section>
        )}
        {step.heap && Object.values(step.heap).some((n) => n.k === 'tree') && (
          <Section label="tree" kind="nodes"><TreeView step={step} lang={lang} /></Section>
        )}
        {scene.bags.map((v) => <Bags key={v.name} view={v} lang={lang} heap={step.heap} />)}
        {scene.maps.map((v) => <Maps key={v.name} view={v} lang={lang} />)}
        <Scalars scalars={scene.scalars} lang={lang} heap={step.heap} />
        {recursive && <CallStack step={step} />}
        {empty && <p className="text-sm text-muted">No variables yet. They appear here the moment your code creates them.</p>}
      </div>
    </LayoutGroup>
  );
}
