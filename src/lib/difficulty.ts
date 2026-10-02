'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Problem } from '@/types/content';

export type DifficultyFilter = 'All' | Problem['difficulty'];
export const DIFFICULTIES: DifficultyFilter[] = ['All', 'Easy', 'Medium', 'Hard'];

const KEY = 'thinkfirst:difficulty';
const listeners = new Set<() => void>();

function read(): DifficultyFilter {
  try {
    const value = localStorage.getItem(KEY) as DifficultyFilter | null;
    return value && DIFFICULTIES.includes(value) ? value : 'All';
  } catch {
    return 'All';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** Which difficulty the learner wants to work on; 'All' keeps the easy → hard roadmap order. */
export function useDifficulty(): [DifficultyFilter, (d: DifficultyFilter) => void] {
  const difficulty = useSyncExternalStore(subscribe, read, () => 'All' as DifficultyFilter);
  const set = useCallback((next: DifficultyFilter) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage unavailable: the choice lasts for this visit only
    }
    listeners.forEach((l) => l());
  }, []);
  return [difficulty, set];
}
