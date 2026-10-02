import type { Language } from '@/types/content';
import type { HeapNode, Step, Value } from '@/types/trace';

/** Turns one trace step into things the visualizer can draw. */

export type Pointer = { name: string; index: number; color: string };

export type ArrayView = {
  name: string;
  items: Value[];
  total: number;
  isString: boolean;
  pointers: Pointer[];
  /** Inclusive range between a recognised low/high pointer pair. */
  range: [number, number] | null;
  changed: Set<number>;
};
export type GridView = { name: string; rows: Value[][]; row: Pointer | null; col: Pointer | null; changed: Set<string> };
export type MapView = { name: string; entries: [Value, Value][]; total: number; changed: Set<string> };
export type BagView = { name: string; kind: 'set' | 'stack' | 'queue' | 'heap'; items: Value[]; total: number };
export type Scalar = { name: string; value: Value; changed: boolean; isPointer: boolean; color?: string };

export type Scene = {
  arrays: ArrayView[];
  grids: GridView[];
  maps: MapView[];
  bags: BagView[];
  scalars: Scalar[];
  heap: Record<string, HeapNode>;
};

export const POINTER_COLORS = ['#5ee9b5', '#a78bfa', '#fbbf24', '#7dd3fc', '#fb7185', '#f0abfc'];
const RANGE_PAIRS = [['left', 'right'], ['l', 'r'], ['lo', 'hi'], ['low', 'high'], ['start', 'end'], ['begin', 'end']];

const isStr = (v: Value): v is { t: 'str'; v: string } => typeof v === 'object' && v !== null && v.t === 'str';
const isList = (v: Value): v is Extract<Value, { t: 'list' }> => typeof v === 'object' && v !== null && v.t === 'list';
const isFlat = (v: Value) => v === null || typeof v !== 'object' || v.t === 'str' || v.t === 'obj';

const key = (v: Value) => JSON.stringify(v);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const regexCache = new Map<string, boolean>();
function codeHas(code: string, pattern: string) {
  const id = pattern + '\u0000' + code;
  let hit = regexCache.get(id);
  if (hit === undefined) {
    if (regexCache.size > 4000) regexCache.clear();
    hit = new RegExp(pattern).test(code);
    regexCache.set(id, hit);
  }
  return hit;
}

/** Does the code index `container` with `index`, e.g. nums[i], nums[i + 1], s.charAt(i), list.get(i)? */
function indexes(code: string, container: string, index: string) {
  const c = esc(container);
  const x = esc(index);
  return (
    codeHas(code, `\\b${c}\\s*(?:\\[|\\.charAt\\(|\\.get\\()[^\\]\\)]*\\b${x}\\b`) ||
    codeHas(code, `for\\s+${x}\\s*,\\s*\\w+\\s+in\\s+enumerate\\(\\s*${c}\\b`)
  );
}

const usedAsStack = (code: string, name: string) =>
  codeHas(code, `\\b${esc(name)}\\.(?:pop\\(\\s*\\)|push\\(|peek\\()`) || /^(stack|stk|st)$/i.test(name);
const usedAsQueue = (code: string, name: string) => codeHas(code, `\\b${esc(name)}\\.(?:popleft|poll|offer|pollFirst|removeFirst)\\(`);

export type Cursor = { container: string; variable: string; index: number };

/**
 * For-each loops (`for price in prices`, `for (int price : prices)`) have no index variable,
 * so we recover the position by counting visits to the loop header line.
 */
export function forEachCursors(steps: Step[], code: string, lang: Language): Cursor[][] {
  const header =
    lang === 'python'
      ? /^\s*for\s+(\w+)\s+in\s+(\w+)\s*:/
      : /for\s*\(\s*(?:final\s+)?[\w<>\[\], ]+?\s+(\w+)\s*:\s*(\w+)(?:\.toCharArray\(\))?\s*\)/;
  const loops = new Map<number, { variable: string; container: string }>();
  code.split('\n').forEach((text, i) => {
    const m = header.exec(text);
    if (m) loops.set(i + 1, { variable: m[1], container: m[2] });
  });
  if (loops.size === 0) return steps.map(() => []);

  // Per call depth: visits to each loop header in the current call, and the last line run there.
  const counts: Map<number, number>[] = [];
  const lastLine: (number | undefined)[] = [];
  return steps.map((step, i) => {
    const prev = steps[i - 1];
    const d = step.depth;
    if (!prev || prev.depth < d || !counts[d]) {
      counts[d] = new Map();
      lastLine[d] = undefined;
    }
    const mine = counts[d];
    if (step.ev === 'line') {
      const last = lastLine[d];
      if (loops.has(step.line) && last !== step.line) {
        // Arriving from below means another trip around; arriving from above means a fresh loop.
        const fromBody = last !== undefined && last > step.line;
        mine.set(step.line, fromBody ? (mine.get(step.line) ?? 0) + 1 : 1);
      }
      lastLine[d] = step.line;
    }
    const cursors: Cursor[] = [];
    for (const [line, visits] of mine) {
      const loop = loops.get(line)!;
      // While parked on the header the next element has not been fetched yet.
      const index = visits - 1 - (step.line === line && step.ev === 'line' ? 1 : 0);
      if (index >= 0) cursors.push({ ...loop, index });
    }
    return cursors;
  });
}

export function buildScene(step: Step, prev: Step | undefined, code: string, cursors: Cursor[]): Scene {
  const before = new Map<string, Value>(prev && prev.depth === step.depth && prev.fn === step.fn ? prev.vars : []);
  const changedVar = (name: string, v: Value) => before.size > 0 && key(before.get(name) ?? null) !== key(v);
  const ints = step.vars.filter(([, v]) => typeof v === 'number' && Number.isInteger(v)) as [string, number][];

  const scene: Scene = { arrays: [], grids: [], maps: [], bags: [], scalars: [], heap: step.heap ?? {} };
  const pointerNames = new Map<string, string>();
  let colorIndex = 0;
  const colorFor = (name: string) => {
    if (!pointerNames.has(name)) pointerNames.set(name, POINTER_COLORS[colorIndex++ % POINTER_COLORS.length]);
    return pointerNames.get(name)!;
  };

  const addArray = (name: string, items: Value[], total: number, isString: boolean, old: Value | undefined) => {
    const pointers: Pointer[] = [];
    for (const [x, index] of ints) {
      if (index >= 0 && index < items.length && indexes(code, name, x)) pointers.push({ name: x, index, color: colorFor(x) });
    }
    for (const c of cursors) {
      if (c.container === name && c.index < items.length && step.vars.some(([n]) => n === c.variable)) {
        pointers.push({ name: c.variable, index: c.index, color: colorFor(c.variable) });
      }
    }
    let range: [number, number] | null = null;
    for (const [lo, hi] of RANGE_PAIRS) {
      const a = pointers.find((p) => p.name === lo);
      const b = pointers.find((p) => p.name === hi);
      if (a && b && a.index <= b.index) range = [a.index, b.index];
    }
    const changed = new Set<number>();
    const oldItems = old === undefined ? null : isList(old) ? old.v : isStr(old) ? [...old.v] : null;
    if (oldItems && !isString) {
      items.forEach((item, i) => {
        if (i >= oldItems.length || key(oldItems[i] as Value) !== key(item)) changed.add(i);
      });
    }
    scene.arrays.push({ name, items, total, isString, pointers, range, changed });
    return pointers.length;
  };

  for (const [name, v] of step.vars) {
    const changed = changedVar(name, v);
    if (isStr(v)) {
      const chars = [...v.v];
      const hasPointer = ints.some(([x, i]) => i >= 0 && i < chars.length && indexes(code, name, x)) || cursors.some((c) => c.container === name);
      if (hasPointer && chars.length <= 60) {
        addArray(name, chars.map((ch) => ({ t: 'str', v: ch })), chars.length, true, before.get(name));
      } else {
        scene.scalars.push({ name, value: v, changed, isPointer: false });
      }
    } else if (isList(v)) {
      if (v.kind === 'set' || v.kind === 'heap') {
        scene.bags.push({ name, kind: v.kind, items: v.v, total: v.n });
      } else if (v.kind === 'stack' || ((v.kind === 'deque' || v.kind === 'list') && usedAsStack(code, name) && !usedAsQueue(code, name))) {
        // Java's ArrayDeque.push adds at the front; everything else grows at the back.
        scene.bags.push({ name, kind: 'stack', items: v.kind === 'deque' ? [...v.v].reverse() : v.v, total: v.n });
      } else if (v.kind === 'deque') {
        scene.bags.push({ name, kind: 'queue', items: v.v, total: v.n });
      } else if (v.v.length > 0 && v.v.every((row) => isList(row) && row.v.every(isFlat))) {
        const rows = v.v.map((row) => (row as Extract<Value, { t: 'list' }>).v);
        const n = esc(name);
        const rowVar = ints.find(([x, i]) => i >= 0 && i < rows.length && codeHas(code, `\\b${n}\\s*\\[[^\\]]*\\b${esc(x)}\\b[^\\]]*\\]\\s*\\[`));
        const colVar = ints.find(([x, i]) => i >= 0 && codeHas(code, `\\b${n}\\s*\\[[^\\]]*\\]\\s*\\[[^\\]]*\\b${esc(x)}\\b`));
        const old = before.get(name);
        const cells = new Set<string>();
        if (old && isList(old)) {
          rows.forEach((row, r) => row.forEach((cell, c) => {
            const oldRow = old.v[r];
            if (!oldRow || !isList(oldRow) || key(oldRow.v[c] ?? null) !== key(cell)) cells.add(`${r},${c}`);
          }));
        }
        scene.grids.push({
          name,
          rows,
          row: rowVar ? { name: rowVar[0], index: rowVar[1], color: colorFor(rowVar[0]) } : null,
          col: colVar ? { name: colVar[0], index: colVar[1], color: colorFor(colVar[0]) } : null,
          changed: cells,
        });
      } else if (v.v.every(isFlat)) {
        addArray(name, v.v, v.n, false, before.get(name));
      } else {
        scene.scalars.push({ name, value: v, changed, isPointer: false });
      }
    } else if (typeof v === 'object' && v !== null && v.t === 'map') {
      const old = before.get(name);
      const oldEntries = new Map<string, string>(
        old && typeof old === 'object' && old.t === 'map' ? old.v.map(([k, x]) => [key(k), key(x)]) : [],
      );
      const changedKeys = new Set<string>();
      if (before.has(name)) {
        for (const [k, x] of v.v) if (oldEntries.get(key(k)) !== key(x)) changedKeys.add(key(k));
      }
      scene.maps.push({ name, entries: v.v, total: v.n, changed: changedKeys });
    } else {
      scene.scalars.push({ name, value: v, changed, isPointer: false });
    }
  }

  for (const s of scene.scalars) {
    const color = pointerNames.get(s.name);
    if (color) {
      s.isPointer = true;
      s.color = color;
    }
  }
  return scene;
}

/** Short text for a value, written the way the learner's language writes it. */
export function show(v: Value | undefined, lang: Language, heap?: Record<string, HeapNode>): string {
  if (v === undefined) return '';
  if (v === null) return lang === 'python' ? 'None' : 'null';
  if (typeof v === 'boolean') return lang === 'python' ? (v ? 'True' : 'False') : String(v);
  if (typeof v === 'number') return String(v);
  switch (v.t) {
    case 'str':
      return `"${v.v}"`;
    case 'obj':
      return v.v;
    case 'ref': {
      const node = heap?.[v.id];
      return node ? `node ${show(node.val, lang)}` : 'node';
    }
    case 'list': {
      const body = v.v.map((x) => show(x, lang, heap)).join(', ') + (v.n > v.v.length ? ', …' : '');
      return v.kind === 'set' ? `{${body}}` : `[${body}]`;
    }
    case 'map':
      return `{${v.v.map(([k, x]) => `${show(k, lang, heap)}: ${show(x, lang, heap)}`).join(', ')}}`;
  }
}

/** A raw JSON test value (argument / expected / returned) as display text. */
export function showJson(v: unknown, lang: Language): string {
  if (v === null || v === undefined) return lang === 'python' ? 'None' : 'null';
  if (typeof v === 'boolean') return lang === 'python' ? (v ? 'True' : 'False') : String(v);
  if (Array.isArray(v)) return `[${v.map((x) => showJson(x, lang)).join(', ')}]`;
  return JSON.stringify(v);
}
