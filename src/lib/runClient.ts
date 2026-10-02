import type { RunRequest, TestResponse, TraceResponse } from '@/types/trace';

async function post<T>(body: RunRequest, signal?: AbortSignal): Promise<T> {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'The code runner is not responding.');
  return data as T;
}

export const runTrace = (req: Omit<RunRequest, 'mode'>, signal?: AbortSignal) =>
  post<TraceResponse>({ ...req, mode: 'trace' }, signal);

export const runTests = (req: Omit<RunRequest, 'mode' | 'args'>) => post<TestResponse>({ ...req, mode: 'test' });
