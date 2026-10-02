import { NextResponse } from 'next/server';
import { getProblem } from '@/data/problems';
import { execute } from '@/lib/server/run';
import type { RunRequest } from '@/types/trace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export async function POST(request: Request) {
  // This endpoint runs whatever code it is sent on this machine, so it only answers the local browser.
  if (!LOCAL_HOST.test(request.headers.get('host') ?? '')) {
    return NextResponse.json({ error: 'The code runner only accepts requests from localhost.' }, { status: 403 });
  }
  const body = (await request.json()) as RunRequest;
  const problem = getProblem(body.slug);
  if (!problem || (body.lang !== 'python' && body.lang !== 'java') || typeof body.code !== 'string') {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  return NextResponse.json(await execute(problem, body));
}
