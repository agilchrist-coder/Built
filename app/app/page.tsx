import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stipum — Bilateral Declaration Protocol',
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <span className="text-xl font-bold text-[#0A2540]">Stipum</span>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="mb-5 text-4xl font-bold leading-tight text-[#0A2540] sm:text-5xl">
            Bilateral declaration protocol.
          </h1>
          <p className="mb-4 text-lg text-slate-600">
            Both parties independently declare what they assume before work begins.
            The record locks before the first hour is logged.
          </p>
          <p className="mb-10 text-slate-500">
            Surfaces assumption gaps. Creates an immutable, timestamped record both parties can reference.
          </p>

          <a
            href="https://app.stipum.com"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A2540] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[#0d2f50]"
          >
            File a declaration
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </a>
        </div>

        {/* How it works */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A2540]/10 text-sm font-bold text-[#0A2540]">1</div>
            <h3 className="mb-1 font-semibold text-slate-900">Build the form</h3>
            <p className="text-sm text-slate-500">Create a custom declaration with any fields relevant to your engagement.</p>
          </div>
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A2540]/10 text-sm font-bold text-[#0A2540]">2</div>
            <h3 className="mb-1 font-semibold text-slate-900">Both parties fill independently</h3>
            <p className="text-sm text-slate-500">Neither party can see the other's answers until both have submitted.</p>
          </div>
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A2540]/10 text-sm font-bold text-[#0A2540]">3</div>
            <h3 className="mb-1 font-semibold text-slate-900">Simultaneous reveal</h3>
            <p className="text-sm text-slate-500">Gaps surface immediately. Both parties acknowledge and the record locks.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-slate-400">Stipum · stipum.com · Patent pending</p>
        </div>
      </footer>
    </div>
  );
}
