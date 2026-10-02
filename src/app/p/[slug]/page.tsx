import { notFound } from 'next/navigation';
import { Workspace } from '@/components/Workspace';
import { getProblem, problems } from '@/data/problems';

export function generateStaticParams() {
  return problems.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const problem = getProblem(params.slug);
  return { title: problem ? `${problem.title} · ThinkFirst` : 'ThinkFirst' };
}

export default function ProblemPage({ params }: { params: { slug: string } }) {
  if (!getProblem(params.slug)) notFound();
  return <Workspace slug={params.slug} />;
}
