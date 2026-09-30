# ThinkFirst architecture (Phase 1 contract)

## Folder structure

```text
src/app/                 Next.js App Router shell and global theme
src/components/          Learning loop, editor, and visualization UI
src/data/                Original, typed problem content
src/types/               Shared problem and trace contracts
public/                   Browser execution workers (future Pyodide bundle)
```

Phase 1 is deliberately frontend-only: the learner moves through one original pair-finding problem and runs Python in the learning workspace. Phase 2 moves execution into a Pyodide worker with `sys.settrace`; Phase 3 adds a sandboxed Java service. Both emit the same contract below.

## Unified trace JSON schema

A trace is `{ "schemaVersion": "1.0", "language": "python|java", "result": "passed|failed|error|limit", "events": TraceEvent[], "tests": TestResult[], "limits": { "timeoutMs": 3000, "maxEvents": 5000 } }`.

Each `TraceEvent` contains `step`, source `line`, `event` (`line`, `call`, `return`, `exception`, or `limit`), `function`, normalized `locals` (`{type,value}`), `callStack`, detected `structures`, accumulated `stdout`, and `timestampMs`. A structure has `kind`, source `variable`, JSON-safe `data`, optional `active` element IDs, and optional `operation`. Values are depth/size limited and cycles use `{ "type":"object", "value":"<cycle>" }`. This keeps renderer input language-neutral.

## Problem data schema

`Problem` includes identity (`slug`, `title`, `pattern`, `difficulty`); original `statement`, `constraints`, and 2–3 `{input,output,explanation}` examples; ordered `understanding` and `approach` MCQs. Every MCQ option includes `correct`, explanatory `feedback`, and optionally time/space `complexity`, so wrong choices teach consequences. It also includes reorderable `planSteps`, four progressive `hints`, language-keyed `starterCode`, hidden `testCases`, and `referenceSolutions` for Python and Java. `relatedProblemUrl` is optional and learner-owned. The exact TypeScript source of truth is `src/types/content.ts`.

## Sensible Phase 1 decisions

- No account is required; loop state persists to local storage in later phases.
- Full solutions remain gated behind level-four confirmation and reflection.
- The Phase 1 runner executes a bounded visual simulation for the supplied starter algorithm so the interaction is demonstrable without a server. The worker-based arbitrary Python runner is explicitly the next phase boundary.
