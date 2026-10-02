import type { Monaco } from '@monaco-editor/react';
import type { Language, ValueType } from '@/types/content';
import { membersFor } from './members';

/** The problem currently open; the providers are registered once per page load and read this. */
let current: { params: { name: string; type: ValueType }[] } = { params: [] };
let registered = false;

// The few parts of Monaco's text model this provider uses.
type Position = { lineNumber: number; column: number };
type Model = {
  getLineContent(line: number): string;
  getValue(): string;
  getWordUntilPosition(position: Position): { startColumn: number; endColumn: number };
};

export function setCompletionContext(params: { name: string; type: ValueType }[]) {
  current = { params };
}

/**
 * Method lists after a dot, and nothing else: no word guessing, no snippets, no code written for
 * you. Choosing an item inserts only the method name.
 */
export function registerMemberCompletions(monaco: Monaco) {
  if (registered) return;
  registered = true;

  for (const lang of ['python', 'java'] as Language[]) {
    monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['.'],
      provideCompletionItems(model: Model, position: Position) {
        const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
        const m = /([A-Za-z_]\w*(?:\[[^\]]*\])*(?:\.(?:next|left|right))?)\.(\w*)$/.exec(before);
        if (!m) return { suggestions: [] };

        const code = model.getValue();
        const groups = membersFor(m[1], code, lang, current.params);
        const word = model.getWordUntilPosition(position);
        const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
        const several = groups.length > 1;

        return {
          suggestions: groups.flatMap((group, g) =>
            group.members.map(([name, args, doc], i) => ({
              label: { label: name, detail: args ? ` ${args}` : '', description: several ? `${group.type} · ${doc}` : doc },
              kind: args ? monaco.languages.CompletionItemKind.Method : monaco.languages.CompletionItemKind.Field,
              detail: `${group.type}.${name}${args}`,
              documentation: doc,
              insertText: name,
              range,
              sortText: `${g}${String(i).padStart(3, '0')}`,
              filterText: name,
            })),
          ),
        };
      },
    });
  }
}
