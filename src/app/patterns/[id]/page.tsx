import { notFound } from 'next/navigation';
import { PatternPage } from '@/components/PatternPage';
import { patterns } from '@/data/patterns';

export function generateStaticParams() {
  return patterns.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const pattern = patterns.find((p) => p.id === params.id);
  return { title: pattern ? `${pattern.name} · ThinkFirst` : 'ThinkFirst' };
}

export default function Page({ params }: { params: { id: string } }) {
  const pattern = patterns.find((p) => p.id === params.id);
  if (!pattern) notFound();
  return <PatternPage id={pattern.id} />;
}
