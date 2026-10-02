'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

const SPEEDS = [0.5, 1, 2, 4];
/** Milliseconds per step at 1×. */
const STEP_MS = 1200;

/** Playback position over a trace of `length` steps. */
export function usePlayer(length: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIndex((i) => {
        // Stop on the tick that reaches the last step, not one tick later.
        if (i + 1 >= length - 1) setPlaying(false);
        return Math.min(i + 1, Math.max(length - 1, 0));
      });
    }, STEP_MS / speed);
    return () => clearInterval(id);
  }, [playing, speed, length]);

  const playFromStart = useCallback(() => {
    setIndex(0);
    setPlaying(true);
  }, []);

  return { index: Math.min(index, Math.max(length - 1, 0)), setIndex, playing, setPlaying, speed, setSpeed, playFromStart };
}

type PlayerProps = ReturnType<typeof usePlayer> & { length: number };

export function PlayerControls({ index, setIndex, playing, setPlaying, speed, setSpeed, playFromStart, length }: PlayerProps) {
  const last = Math.max(length - 1, 0);
  const jump = (to: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(last, to)));
  };
  const button = 'grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-raised hover:text-text disabled:opacity-30';

  return (
    <div className="flex items-center gap-2">
      <button className={button} onClick={() => jump(0)} disabled={length === 0} aria-label="Back to the first step" title="Back to start">
        <RotateCcw size={15} />
      </button>
      <button className={button} onClick={() => jump(index - 1)} disabled={index === 0} aria-label="Previous step" title="Step back">
        <ChevronLeft size={18} />
      </button>
      <button
        className="grid h-9 w-9 place-items-center rounded-full bg-mint text-ink hover:brightness-110 disabled:opacity-30"
        onClick={() => (playing ? setPlaying(false) : index >= last ? playFromStart() : setPlaying(true))}
        disabled={length === 0}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-px" />}
      </button>
      <button className={button} onClick={() => jump(index + 1)} disabled={index >= last} aria-label="Next step" title="Step forward">
        <ChevronRight size={18} />
      </button>
      <input
        type="range"
        min={0}
        max={last}
        value={index}
        onChange={(e) => jump(Number(e.target.value))}
        disabled={length === 0}
        aria-label="Scrub through the steps"
        className="h-1 min-w-0 flex-1 cursor-pointer accent-mint"
      />
      <span className="w-16 text-right font-mono text-xs tabular-nums text-muted">
        {length === 0 ? '0 / 0' : `${index + 1} / ${length}`}
      </span>
      <button
        className="rounded-md border border-line px-2 py-1 font-mono text-xs text-muted hover:text-text"
        onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
        title="Playback speed"
      >
        {speed}×
      </button>
    </div>
  );
}
