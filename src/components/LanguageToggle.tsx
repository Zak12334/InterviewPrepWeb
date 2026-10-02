'use client';

import type { Language } from '@/types/content';
import { useLanguage } from '@/lib/language';

export const LANGUAGE_NAME: Record<Language, string> = { python: 'Python', java: 'Java' };

export function LanguageToggle({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const [lang, setLang] = useLanguage();
  const pad = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  return (
    <div className="inline-flex rounded-lg border border-line bg-panel p-0.5" role="radiogroup" aria-label="Language to practise in">
      {(['python', 'java'] as Language[]).map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={lang === l}
          onClick={() => setLang(l)}
          className={`rounded-md font-medium ${pad} ${lang === l ? 'bg-mint text-ink' : 'text-muted hover:text-text'}`}
        >
          {LANGUAGE_NAME[l]}
        </button>
      ))}
    </div>
  );
}
