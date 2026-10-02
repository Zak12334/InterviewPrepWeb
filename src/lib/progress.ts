'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Language } from '@/types/content';

export const STAGES = ['Understand', 'Approach', 'Plan', 'Code', 'Reflect'] as const;

export type Progress = {
  /** Highest stage unlocked so far (index into STAGES). */
  unlocked: number;
  done: boolean;
  code: Partial<Record<Language, string>>;
  solved: Partial<Record<Language, boolean>>;
  notes: string;
  hints: number;
  /** Wrong first picks on the thinking questions. */
  misses: number;
  /**
   * 'slow': coding a working-but-slower approach first. 'upgrade': that version passed and the
   * learner is now finding the faster idea. 'fast': on the optimal approach.
   */
  path?: 'slow' | 'upgrade' | 'fast';
  /** The slower approach that was chosen. */
  slow?: { label: string; time?: string };
  /** The slower version once it passed, kept so both solutions can be compared. */
  slowCode?: Partial<Record<Language, string>>;
};

const KEY = 'thinkfirst:v1';
const EMPTY: Progress = { unlocked: 0, done: false, code: {}, solved: {}, notes: '', hints: 0, misses: 0 };

type Store = Record<string, Progress>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage unavailable (private window): progress just lasts for this visit
  }
}

/**
 * Clears the written code (and any revealed hints) so a learned problem can be coded again from
 * scratch. The thinking stages, notes and "learned" status are kept.
 */
export const REDO: Partial<Progress> = { code: {}, hints: 0, path: 'fast' };

export function redoCode(slug: string) {
  const store = read();
  if (store[slug]) write({ ...store, [slug]: { ...store[slug], ...REDO } });
}

/** Progress for every problem; empty until the browser has loaded it. */
export function useAllProgress() {
  const [store, setStore] = useState<Store | null>(null);
  useEffect(() => setStore(read()), []);
  return store;
}

export function useProgress(slug: string) {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress({ ...EMPTY, ...read()[slug] });
    setLoaded(true);
  }, [slug]);

  const update = useCallback(
    (patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => {
      setProgress((current) => {
        const next = { ...current, ...(typeof patch === 'function' ? patch(current) : patch) };
        write({ ...read(), [slug]: next });
        return next;
      });
    },
    [slug],
  );

  return { progress, update, loaded };
}
