'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Language } from '@/types/content';

const KEY = 'thinkfirst:lang';
const listeners = new Set<() => void>();

function read(): Language {
  try {
    return localStorage.getItem(KEY) === 'java' ? 'java' : 'python';
  } catch {
    return 'python';
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

/** The language the learner is practising in, shared by every page and remembered between visits. */
export function useLanguage(): [Language, (lang: Language) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => 'python' as Language);
  const setLang = useCallback((next: Language) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage unavailable: the choice will not survive a reload
    }
    listeners.forEach((l) => l());
  }, []);
  return [lang, setLang];
}
