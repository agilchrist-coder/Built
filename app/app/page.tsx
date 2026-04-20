import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stipum',
};

export default function HomePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <p className="text-slate-600">This page has been removed.</p>
    </div>
  );
}
