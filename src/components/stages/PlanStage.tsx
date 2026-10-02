'use client';

import { useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUp, GripVertical } from 'lucide-react';
import type { Problem } from '@/types/content';

/** A fixed scramble per problem: reversed, then rotated, so it is never already correct. */
function scramble(count: number) {
  const order = Array.from({ length: count }, (_, i) => count - 1 - i);
  const shift = Math.max(1, Math.floor(count / 2));
  return [...order.slice(shift), ...order.slice(0, shift)];
}

export function PlanStage({ problem, onDone }: { problem: Problem; onDone: () => void }) {
  const steps = problem.planSteps;
  const [order, setOrder] = useState(() => scramble(steps.length));
  const [checked, setChecked] = useState(false);
  const correct = useMemo(() => order.every((id, position) => id === position), [order]);
  const inPlace = order.filter((id, position) => id === position).length;

  const move = (position: number, by: number) => {
    const to = position + by;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[position], next[to]] = [next[to], next[position]];
    setOrder(next);
    setChecked(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Put your plan in order</h2>
      <p className="mb-5 mt-1 text-sm text-muted">
        These are the steps of the approach you chose, shuffled. Drag them into the order your code will follow. The editor opens once the plan holds together.
      </p>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={(next) => {
          setOrder(next);
          setChecked(false);
        }}
        className="space-y-2"
      >
        {order.map((id, position) => {
          const right = checked && id === position;
          const wrong = checked && id !== position;
          return (
            <Reorder.Item
              key={id}
              value={id}
              className={`flex cursor-grab items-center gap-3 rounded-lg border bg-raised px-3 py-2.5 text-sm active:cursor-grabbing ${
                right ? 'border-mint' : wrong ? 'border-coral/60' : 'border-line'
              }`}
            >
              <GripVertical size={16} className="shrink-0 text-muted" />
              <span className="w-5 shrink-0 font-mono text-xs text-muted">{position + 1}</span>
              <span className="flex-1">{steps[id]}</span>
              <button onClick={() => move(position, -1)} disabled={position === 0} className="rounded p-1 text-muted hover:text-text disabled:opacity-20" aria-label="Move step up">
                <ArrowUp size={15} />
              </button>
              <button onClick={() => move(position, 1)} disabled={position === order.length - 1} className="rounded p-1 text-muted hover:text-text disabled:opacity-20" aria-label="Move step down">
                <ArrowDown size={15} />
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted" role="status">
          {checked && !correct && `${inPlace} of ${steps.length} steps are in the right place. Ask of each step: what has to exist before this can happen?`}
          {checked && correct && <span className="text-mint">That plan works. Now turn each step into code.</span>}
        </p>
        {checked && correct ? (
          <button onClick={onDone} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink">
            Open the editor <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={() => setChecked(true)} className="shrink-0 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink">
            Check my plan
          </button>
        )}
      </div>
    </div>
  );
}
