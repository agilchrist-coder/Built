import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// ---------------------------------------------------------------------------
// Mock data — replace with real Base44 list endpoint when available
// ---------------------------------------------------------------------------
const RECENT_INSTANCES: {
  id: string;
  label: string;
  status: 'pending' | 'partial' | 'both_submitted' | 'both_acknowledged' | 'complete';
  createdAt: string;
  partyBEmail: string;
}[] = [];

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'outline' | 'warning' | 'success' | 'destructive' }
> = {
  pending: { label: 'Awaiting both', variant: 'outline' },
  partial: { label: 'Awaiting other party', variant: 'warning' },
  both_submitted: { label: 'Ready to reveal', variant: 'default' },
  both_acknowledged: { label: 'Acknowledged', variant: 'success' },
  complete: { label: 'Complete', variant: 'success' },
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Nav                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-xl font-bold tracking-tight text-[#0A2540]">Stipum</span>
          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0d2f4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540] focus-visible:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New form
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-navy-gradient px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            Powered by Base44
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Both parties. <br className="hidden sm:block" />
            Same moment. Zero bias.
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Stipum lets two parties submit their answers blindly — then reveals
            them simultaneously. Every agreement is hashed and timestamped for
            an immutable record.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] shadow transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A2540]"
            >
              Create a new form
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-slate-100 bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-xl font-semibold text-slate-900">
            How Stipum works
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Build the form',
                desc: 'Add the questions both parties will answer.',
              },
              {
                step: '2',
                title: 'Invite Party B',
                desc: 'Send a unique fill link. Both fill independently.',
              },
              {
                step: '3',
                title: 'Simultaneous reveal',
                desc: 'Base44 releases answers only after both submit.',
              },
              {
                step: '4',
                title: 'Immutable record',
                desc: 'A SHA-hashed PDF is generated. Permanent proof.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A2540] text-sm font-bold text-white">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Recent form instances                                                */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent forms</h2>
          <Link
            href="/builder"
            className="text-sm font-medium text-[#0A2540] hover:underline"
          >
            + New form
          </Link>
        </div>

        {RECENT_INSTANCES.length === 0 ? (
          /* Empty state */
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-7 w-7 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-700">No forms yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first Stipum form to get started.
            </p>
            <Link
              href="/builder"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d2f4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540] focus-visible:ring-offset-2"
            >
              Create a form
            </Link>
          </Card>
        ) : (
          <ul className="space-y-3">
            {RECENT_INSTANCES.map((instance) => {
              const badgeCfg = STATUS_BADGE[instance.status] ?? {
                label: instance.status,
                variant: 'outline' as const,
              };

              return (
                <li key={instance.id}>
                  <Card className="transition-shadow hover:shadow-elevated">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">
                            {instance.label}
                          </CardTitle>
                          <CardDescription className="mt-0.5">
                            Party B: {instance.partyBEmail}
                          </CardDescription>
                        </div>
                        <Badge variant={badgeCfg.variant}>{badgeCfg.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-0">
                      <span className="text-xs text-slate-400">
                        Created{' '}
                        {new Date(instance.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex gap-2">
                        {instance.status === 'both_submitted' && (
                          <Link
                            href={`/reveal/${instance.id}`}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-[#0A2540] ring-1 ring-[#0A2540] hover:bg-[#0A2540] hover:text-white"
                          >
                            View reveal
                          </Link>
                        )}
                        {instance.status === 'complete' && (
                          <Link
                            href={`/record/${instance.id}`}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-[#0A2540] ring-1 ring-[#0A2540] hover:bg-[#0A2540] hover:text-white"
                          >
                            View record
                          </Link>
                        )}
                        <Link
                          href={`/fill/${instance.id}`}
                          className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Fill link
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-slate-100 px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
        &copy; {new Date().getFullYear()} Stipum. Protocol integrity by{' '}
        <span className="font-medium text-slate-500">Base44</span>.
      </footer>
    </div>
  );
}
