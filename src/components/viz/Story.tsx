'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { Language } from '@/types/content';
import type { Step } from '@/types/trace';
import { narrate } from '@/lib/viz/narrate';
import { showJson } from '@/lib/viz/scene';

/** Renders text where `backticks` mark code. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-ink px-1 font-mono text-[12px] text-aqua">
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

type Props = {
  code: string;
  lang: Language;
  steps: Step[];
  result: unknown;
  error?: string;
  /** Line the animation is on; its sentence is highlighted and kept in view. */
  currentLine?: number;
  /** Jumps the animation to the first time a line ran. */
  onJump: (stepIndex: number) => void;
};

/** "What your code did", told line by line, with what actually happened on this run. */
export function Story({ code, lang, steps, result, error, currentLine, onJump }: Props) {
  const story = useMemo(() => narrate(code, lang, steps), [code, lang, steps]);
  const active = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // Braces matter: newer browsers return a Promise here, which React would mistake for a cleanup.
    active.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentLine]);
  const fn = steps[0]?.frames[0]?.fn;

  return (
    <div className="space-y-1 text-[15px] leading-7">
      <p className="text-xs text-muted">Your code, line by line, as a story. Click a line to jump the animation to the first time it ran.</p>
      {story.map((item) => {
        const first = steps.findIndex((s) => s.line === item.line);
        return (
          <button
            key={item.line}
            ref={item.line === currentLine ? active : undefined}
            onClick={() => first >= 0 && onJump(first)}
            disabled={first < 0}
            className={`block w-full rounded-md border-l-2 px-2 py-1 text-left hover:bg-raised disabled:cursor-default disabled:hover:bg-transparent ${
              item.line === currentLine ? 'border-mint bg-mint/10' : 'border-transparent'
            }`}
            style={{ paddingLeft: 8 + item.depth * 16 }}
          >
            <span className="mr-2 font-mono text-[11px] text-muted">{item.line}</span>
            <Words text={item.sentence} />
            {item.ran !== undefined && (
              <span className={`ml-2 whitespace-nowrap text-xs ${item.ran === 0 ? 'text-coral' : 'text-muted'}`}>
                {item.ran === 0 ? '· never ran on this input' : item.ran > 1 ? `· ran ${item.ran} times` : ''}
              </span>
            )}
            {item.values && item.values.length > 0 && item.variable && (
              <span className="mt-0.5 block text-[13px] text-gold" style={{ paddingLeft: 24 }}>
                {item.values.length === 1 ? (
                  <Words text={`On this run \`${item.variable}\` became \`${item.values[0]}\`.`} />
                ) : (
                  <Words text={`On this run \`${item.variable}\` went ${item.values.map((v) => `\`${v}\``).join(' → ')}${item.values.length >= 7 ? ' → …' : ''}.`} />
                )}
              </span>
            )}
          </button>
        );
      })}
      <p className="border-t border-line pt-2 text-sm">
        {error ? (
          <span className="text-coral">In the end, the code crashed: {error}</span>
        ) : (
          <Words text={`In the end, ${fn ? `\`${fn}\`` : 'your function'} handed back \`${showJson(result, lang)}\`.`} />
        )}
      </p>
    </div>
  );
}
