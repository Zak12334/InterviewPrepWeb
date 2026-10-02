'use client';

import { motion } from 'framer-motion';
import type { Language } from '@/types/content';
import type { HeapNode, Step } from '@/types/trace';
import { POINTER_COLORS, show } from '@/lib/viz/scene';

const SPRING = { type: 'spring', stiffness: 260, damping: 28 } as const;

type Labels = Map<string, { name: string; color: string }[]>;

/** Variable names of the running function, grouped by the node they point at. */
function labelsFor(step: Step): Labels {
  const labels: Labels = new Map();
  const refs = step.frames[step.frames.length - 1]?.refs ?? [];
  refs.forEach(([name, id], i) => {
    const list = labels.get(id) ?? [];
    list.push({ name, color: POINTER_COLORS[i % POINTER_COLORS.length] });
    labels.set(id, list);
  });
  return labels;
}

function LabelChips({ labels }: { labels: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {labels.map((l) => (
        <motion.span
          key={l.name}
          layoutId={`ref-${l.name}`}
          transition={SPRING}
          className="rounded px-1.5 font-mono text-[11px] font-semibold leading-4 text-ink"
          style={{ background: l.color }}
        >
          {l.name}
        </motion.span>
      ))}
    </div>
  );
}

// ---- linked lists -------------------------------------------------------------------------

export type ListLayout = Map<string, { row: number; col: number }>;

/** Nodes keep the slot they first appeared in, so rewiring shows up as arrows changing direction. */
export function layoutLists(steps: Step[]): ListLayout {
  const slots: ListLayout = new Map();
  let rows = 0;
  for (const step of steps) {
    const heap = step.heap;
    if (!heap) continue;
    const fresh = Object.keys(heap).filter((id) => heap[id].k === 'list' && !slots.has(id));
    if (fresh.length === 0) continue;
    const isFresh = new Set(fresh);
    const next = (id: string) => (heap[id] as Extract<HeapNode, { k: 'list' }>).next;
    const pointedAt = new Set(fresh.map(next).filter((n): n is string => n !== null && isFresh.has(n)));
    const heads = fresh.filter((id) => !pointedAt.has(id));
    for (const head of heads.length ? heads : [fresh[0]]) {
      const row = rows++;
      let col = 0;
      for (let id: string | null = head; id && isFresh.has(id) && !slots.has(id); id = next(id)) {
        slots.set(id, { row, col: col++ });
      }
    }
  }
  return slots;
}

const NODE_W = 52;
const NODE_H = 40;
const COL_GAP = 96;
const ROW_GAP = 112;

export function LinkedListView({ step, layout, lang }: { step: Step; layout: ListLayout; lang: Language }) {
  const heap = step.heap ?? {};
  const ids = Object.keys(heap).filter((id) => heap[id].k === 'list' && layout.has(id));
  if (ids.length === 0) return null;

  // Only rows in use right now are drawn, packed upward.
  const rows = [...new Set(ids.map((id) => layout.get(id)!.row))].sort((a, b) => a - b);
  const at = (id: string) => {
    const slot = layout.get(id)!;
    return { x: 36 + slot.col * COL_GAP + NODE_W / 2, y: 40 + rows.indexOf(slot.row) * ROW_GAP + NODE_H / 2 };
  };
  const width = Math.max(...ids.map((id) => at(id).x)) + NODE_W + 40;
  const height = rows.length * ROW_GAP + 10;
  const labels = labelsFor(step);

  const arrows = ids.flatMap((id) => {
    const node = heap[id] as Extract<HeapNode, { k: 'list' }>;
    if (!node.next || !layout.has(node.next)) return [];
    const a = at(id);
    const b = at(node.next);
    const adjacent = a.y === b.y && Math.abs(a.x - b.x) === COL_GAP;
    const backward = b.x < a.x;
    let d: string;
    if (adjacent) {
      const y = a.y + (backward ? 7 : -7);
      const x1 = a.x + (backward ? -1 : 1) * (NODE_W / 2);
      const x2 = b.x + (backward ? 1 : -1) * (NODE_W / 2 + 7);
      d = `M ${x1} ${y} Q ${(x1 + x2) / 2} ${y} ${x2} ${y}`;
    } else {
      const lift = a.y === b.y ? -(34 + Math.abs(a.x - b.x) * 0.12) : 0;
      const y1 = a.y === b.y ? a.y - NODE_H / 2 : a.y + (b.y > a.y ? 1 : -1) * (NODE_H / 2);
      const y2 = a.y === b.y ? b.y - NODE_H / 2 - 7 : b.y + (b.y > a.y ? -1 : 1) * (NODE_H / 2 + 7);
      d = `M ${a.x} ${y1} Q ${(a.x + b.x) / 2} ${(y1 + y2) / 2 + lift} ${b.x} ${y2}`;
    }
    return [{ id, d, backward }];
  });

  return (
    <div className="overflow-x-auto">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="absolute inset-0">
          <defs>
            {[['fwd', '#8a97ab'], ['back', '#a78bfa']].map(([name, color]) => (
              <marker key={name} id={`arrow-${name}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill={color} />
              </marker>
            ))}
          </defs>
          {arrows.map((a) => (
            <motion.path
              key={a.id}
              initial={false}
              animate={{ d: a.d, stroke: a.backward ? '#a78bfa' : '#8a97ab' }}
              transition={SPRING}
              fill="none"
              strokeWidth={2}
              markerEnd={`url(#arrow-${a.backward ? 'back' : 'fwd'})`}
            />
          ))}
        </svg>
        {ids.map((id) => {
          const node = heap[id] as Extract<HeapNode, { k: 'list' }>;
          const p = at(id);
          const mine = labels.get(id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.6, left: p.x - NODE_W / 2, top: p.y - NODE_H / 2 }}
              animate={{ opacity: 1, scale: 1, left: p.x - NODE_W / 2, top: p.y - NODE_H / 2 }}
              transition={SPRING}
              className="absolute flex flex-col items-center"
              style={{ width: NODE_W }}
            >
              <div
                className="grid w-full place-items-center rounded-lg border-2 bg-raised font-mono text-sm"
                style={{ height: NODE_H, borderColor: mine ? mine[0].color : '#25324a' }}
              >
                {show(node.val, lang)}
              </div>
              {node.next === null && <span className="mt-0.5 font-mono text-[10px] text-muted">next ∅</span>}
              {mine && <div className="mt-1"><LabelChips labels={mine} /></div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---- binary trees -------------------------------------------------------------------------

const TREE_X = 50;
const TREE_Y = 74;
const R = 19;

export function TreeView({ step, lang }: { step: Step; lang: Language }) {
  const heap = step.heap ?? {};
  const ids = Object.keys(heap).filter((id) => heap[id].k === 'tree');
  if (ids.length === 0) return null;
  const tree = (id: string) => heap[id] as Extract<HeapNode, { k: 'tree' }>;

  const children = new Set(ids.flatMap((id) => [tree(id).left, tree(id).right]).filter(Boolean) as string[]);
  const spot = new Map<string, { x: number; y: number }>();
  let column = 0;
  let deepest = 0;
  const place = (id: string | null, depth: number) => {
    if (!id || !heap[id] || spot.has(id)) return;
    spot.set(id, { x: -1, y: depth });
    place(tree(id).left, depth + 1);
    spot.set(id, { x: 30 + column++ * TREE_X, y: 30 + depth * TREE_Y });
    deepest = Math.max(deepest, depth);
    place(tree(id).right, depth + 1);
  };
  ids.filter((id) => !children.has(id)).forEach((root) => place(root, 0));

  const labels = labelsFor(step);
  // Nodes that calls further down the stack are still waiting on.
  const waiting = new Set(step.frames.slice(0, -1).flatMap((f) => f.refs.map(([, id]) => id)));
  const width = column * TREE_X + 30;
  const height = deepest * TREE_Y + 110;
  const placed = ids.filter((id) => spot.has(id));

  return (
    <div className="overflow-x-auto">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="absolute inset-0">
          {placed.flatMap((id) =>
            [tree(id).left, tree(id).right].map((child) => {
              if (!child || !spot.has(child)) return null;
              const a = spot.get(id)!;
              const b = spot.get(child)!;
              return (
                <motion.line
                  key={`${id}-${child}`}
                  initial={false}
                  animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
                  transition={SPRING}
                  stroke="#3a4a66"
                  strokeWidth={2}
                />
              );
            }),
          )}
        </svg>
        {placed.map((id) => {
          const p = spot.get(id)!;
          const mine = labels.get(id);
          const border = mine ? mine[0].color : waiting.has(id) ? '#a78bfa' : '#25324a';
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.6, left: p.x - R, top: p.y - R }}
              animate={{ opacity: 1, scale: mine ? 1.12 : 1, left: p.x - R, top: p.y - R }}
              transition={SPRING}
              className="absolute flex flex-col items-center"
              style={{ width: R * 2 }}
            >
              <div
                className="grid place-items-center rounded-full border-2 font-mono text-sm"
                style={{
                  width: R * 2,
                  height: R * 2,
                  borderColor: border,
                  borderStyle: !mine && waiting.has(id) ? 'dashed' : 'solid',
                  background: mine ? `${mine[0].color}22` : '#182132',
                }}
              >
                {show(tree(id).val, lang)}
              </div>
              {mine && <div className="mt-1"><LabelChips labels={mine} /></div>}
            </motion.div>
          );
        })}
      </div>
      {waiting.size > 0 && (
        <p className="mt-1 text-[11px] text-muted">
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-dashed border-iris align-middle" />
          dashed = a call higher up the stack is still waiting on this node
        </p>
      )}
    </div>
  );
}
