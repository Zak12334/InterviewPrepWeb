# ThinkFirst

A personal site for learning LeetCode-style problems by reasoning first and then watching your own code run, in Python and Java.

## Running it

```bash
npm run dev
```

Open http://localhost:3000. Your code is executed on this machine, so it needs `python` and a JDK (`javac`, `java`) on the PATH. Progress, code and notes are stored in the browser's localStorage.

## The learning loop

Every problem goes through five stages, and each one unlocks the next:

1. **Understand** – multiple-choice questions about what is being asked.
2. **Approach** – multiple-choice questions about how to attack it. Every option explains why it works or fails, and most can be played as an animation (with the code hidden) so the cost of a slow idea is visible as a step count.
3. **Plan** – put the steps of the chosen approach in order.
4. **Code** – the editor. Code is re-run as you type and drawn step by step; tests gate the next stage.
5. **Reflect** – complexity check plus an explanation in your own words, saved as notes.

## Layout

```text
runner/tracer.py            Runs Python under sys.settrace and records a trace
runner/Tracer.java          Runs Java under the debugger (JDI) and records the same trace
src/lib/server/             Spawns the runners, builds the Java harness, compares results
src/app/api/run/            POST: trace one input, or run all tests (localhost only)
src/app/api/verify/         GET: runs every reference solution and demo through the runners
src/data/problems/          Problem content
src/types/                  Problem and trace contracts
src/lib/viz/scene.ts        Turns a trace step into drawable arrays, pointers, maps, stacks…
src/components/viz/         The animation: arrays, grids, maps, stacks, linked lists, trees, call stack
src/components/stages/      One component per stage
```

## How the animation knows what to draw

Both runners emit the same trace (`src/types/trace.ts`): one step per executed line, with the local variables, the call stack and any linked-list or tree nodes reachable from them. Nothing is problem-specific. `scene.ts` decides how to draw each variable from its type and from how the code uses it:

- an integer that indexes a list or string (`nums[i]`, `s.charAt(i)`) becomes a pointer under that cell;
- `for x in items` / `for (int x : items)` loops get a pointer by counting visits to the loop header;
- recognised pairs such as `left`/`right` or `low`/`high` shade the range between them;
- a list that is pushed and popped is drawn as a stack; objects with `val`/`next` or `val`/`left`/`right` are drawn as nodes.

## Adding a problem

Add a `Problem` object in `src/data/problems/` and list it in `index.ts`. Then open http://localhost:3000/api/verify: it runs the reference solutions in both languages against the tests and plays every approach demo, and reports anything that fails.

## Limits

- Traces stop after 1,500 steps and runs are killed after 10 seconds.
- The runner executes arbitrary code with your user account, so `/api/run` refuses requests that are not addressed to localhost. Do not deploy this to a public host as it is.

## Language toggle

The Python / Java toggle (problem list and every problem header) is one site-wide setting. `src/data/problems/localize.ts` turns a problem into the version for that language:

- prose can say `{{python wording|java wording}}`, e.g. `{{dict|HashMap}}`, `{{None|null}}`;
- `languageSpecific.ts` holds, per problem, one question about how the approach is written in each language and a fill-in-the-blanks skeleton used as the third hint.

## Patterns

The site is organised around 20 patterns (`src/data/patterns.ts`), in the order they are best learned. Each has the idea in one sentence, the wording that gives it away, a code template per language, and further LeetCode problems to try. Every problem belongs to one pattern, and the home page lists problems pattern by pattern, easiest first.

- `/patterns/<id>` shows one pattern: how to spot it, its template, its problems.
- `/spot` is a recognition drill: a one-line problem description, four patterns to choose from (`src/data/spotting.ts`).

New problems are written with `make()` from `src/data/problems/builder.ts` (see `setA.ts` – `setD.ts`). It takes tuples instead of objects, derives the starter code from the signature, and generates the skeleton hint from the solution by blanking out everything except loops, conditions and returns. Set `anyOrder: true` when the answer is a list of results that may come in any order.
