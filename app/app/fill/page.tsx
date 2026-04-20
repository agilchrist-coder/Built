'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormInstance } from '@/lib/types';
import { getFormInstance, submitAnswers, getReveal } from '@/lib/base44';
import { FillForm } from '@/components/FillForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function getPartyId(sp: URLSearchParams): 'partyA' | 'partyB' {
  return sp.get('as') === 'b' ? 'partyB' : 'partyA';
}

function FillPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instanceId = searchParams.get('id') || '';
  const partyId = getPartyId(searchParams);

  const [instance, setInstance] = useState<FormInstance | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [waitError, setWaitError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!instanceId) { setLoadError('No form ID provided.'); return; }

    // BASE44 CALL — Fetch the form instance definition
    getFormInstance(instanceId)
      .then(setInstance)
      .catch((err: unknown) => {
        setLoadError(`Could not load form: ${err instanceof Error ? err.message : String(err)}`);
      });
  }, [instanceId]);

  useEffect(() => {
    if (!submitted || !instanceId) return;

    pollingRef.current = setInterval(async () => {
      try {
        // BASE44 CALL — Poll until both parties have submitted; Base44 errors until then
        await getReveal(instanceId);
        clearInterval(pollingRef.current!);
        router.push(`/Built/app/reveal?id=${instanceId}&as=${partyId === 'partyB' ? 'b' : 'a'}`);
      } catch { /* still waiting */ }
    }, 5000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [submitted, instanceId, partyId, router]);

  async function handleSubmit(answers: Record<string, string>) {
    // BASE44 CALL — Submit this party's answers blindly
    await submitAnswers(instanceId, partyId, answers);
    setSubmitted(true);
  }

  if (!instance && !loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="h-7 w-7 animate-spin text-[#0A2540]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm">Loading form…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">Unable to load form</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/Built/app/" className="text-sm font-medium text-[#0A2540] hover:underline">← Back to dashboard</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-emerald-600">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <CardTitle>Answers submitted!</CardTitle>
            <CardDescription>Waiting for the other party. This page advances automatically when both have submitted.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <svg className="h-4 w-4 animate-spin text-[#0A2540]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Checking every 5 seconds…
            </div>
            {waitError && <p className="mt-3 text-sm text-red-600">{waitError}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-xl">
          <span className="text-lg font-bold text-[#0A2540]">Stipum</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2540]/10 px-2 py-0.5 text-xs font-medium text-[#0A2540]">
              {partyId === 'partyA' ? 'Party A' : 'Party B'}
            </span>
            <span className="text-xs text-slate-400">· Blind submission</span>
          </div>
        </div>
      </header>
      <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
        <div className="mx-auto max-w-xl">
          <p className="text-sm text-blue-800">
            <strong>Your answers are sealed.</strong> The other party cannot see them until both submit. Protocol enforced by Base44.
          </p>
        </div>
      </div>
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        {instance && <FillForm instanceId={instanceId} fields={instance.fields} onSubmit={handleSubmit} />}
      </main>
    </div>
  );
}

export default function FillPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><p className="text-sm text-slate-500">Loading…</p></div>}>
      <FillPageInner />
    </Suspense>
  );
}
