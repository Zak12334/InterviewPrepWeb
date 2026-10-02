import type { Language, Mcq, Problem } from '@/types/content';
import { languageSpecific } from './languageSpecific';

/** Prose can say {{python wording|java wording}}; this picks the side for the chosen language. */
const pick = (text: string, lang: Language) =>
  text.replace(/\{\{([^|}]*)\|([^}]*)\}\}/g, (_, python: string, java: string) => (lang === 'python' ? python : java));

/** The problem as shown to someone working in `lang`: wording, extra questions and hints all in that language. */
export function localize(problem: Problem, lang: Language): Problem {
  const t = (text: string) => pick(text, lang);
  const questions = (list: Mcq[]) =>
    list
      .filter((q) => !q.lang || q.lang === lang)
      .map((q) => ({ ...q, prompt: t(q.prompt), options: q.options.map((o) => ({ ...o, label: t(o.label), feedback: t(o.feedback) })) }));
  const extras = languageSpecific[problem.slug];

  return {
    ...problem,
    statement: t(problem.statement),
    constraints: problem.constraints.map(t),
    examples: problem.examples.map((e) => ({ input: t(e.input), output: t(e.output), explanation: t(e.explanation) })),
    understanding: questions(problem.understanding),
    approach: questions([...problem.approach, ...(problem.langQuestions ?? extras?.questions ?? [])]),
    planSteps: problem.planSteps.map(t),
    hints: [t(problem.hints[0]), t(problem.hints[1]), (problem.skeleton ?? extras?.skeleton)?.[lang] ?? t(problem.hints[2])],
    reflect: { ...problem.reflect, prompt: t(problem.reflect.prompt) },
  };
}
