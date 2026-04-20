'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RevealResult, AcknowledgmentStatus } from '@/lib/types';
import { getReveal, acknowledgeReveal, getRecord } from '@/lib/base44';
import { RevealTable } from '@/components/RevealTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function RevealPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instanceId = searchParams.get('id') || '';
  const partyId: 'partyA' | 'partyB' = searchParams.get('as') === 'b' ? 'partyB' : 'partyA';

  const [reveal, setReveal] = useState<RevealResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackStatus, setAckStatus] = useState<AcknowledgmentStatus | null>(null);
  const [ackLoading, setAckLoading] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!instanceId) { setLoadError('No form ID provided.'); return; }

    async function load() {
      try {
        // BASE44 CALL — Simultaneous reveal; only available after both parties submitted
        const data = await getReveal(instanceId);
        setReveal(data);
      } catch (err) {
        setLoadError(`Could not load reveal: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    load();
  }, [instanceId]);

  useEffect(() => {
    if (!acknowledged || !instanceId) return;

    pollingRef.current = setInterval(async () => {
      try {
        // BASE44 CALL — Check if record is finalized (both parties acknowledged)
        await getRecord(instanceId);
        clearInterval(pollingRef.current!);
        router.push(`/Built/app/record?id=${instanceId}`);
      } catch { /* still waiting */ }
    }, 5000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [acknowledged, instanceId, router]);

  async function handleAcknowledge() {
    setAckError(null);
    setAckLoading(true);
    try {
      // BASE44 CALL — Record this party's acknowledgment
      const status = await acknowledgeReveal(instanceId, partyId);
      setAckStatus(status);
      setAcknowledged(true);
    } catch (err) {
      setAckError(err instanceof Error ? err.message : 'Acknowledgment failed. Please try again.');
    } finally {
      setAckLoading(false);
    }
  }

  if (!reveal && !loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="h-7 w-7 animate-spin text-[#0A2540]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm">Loading reveal…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">Reveal not available</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/Built/app/" className="text-sm font-medium text-[#0A2540] hover:underline">← Back to dashboard</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const yourLabel = partyId === 'partyA' ? 'Your answer (Party A)' : 'Your answer (Party B)';
  const theirLabel = partyId === 'partyA' ? "Party B's answer" : "Party A's answer";
  const aAnswers = partyId === 'partyA' ? reveal!.partyAAnswers : reveal!.partyBAnswers;
  const bAnswers = partyId === 'partyA' ? reveal!.partyBAnswers : reveal!.partyAAnswers;

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold text-[#0A2540]">Stipum</span>
              <p className="mt-0.5 text-sm text-slate-500">Simultaneous Reveal</p>
            </div>
            <Badge variant={partyId === 'partyA' ? 'default' : 'secondary'}>
              {partyId === 'partyA' ? 'Party A' : 'Party B'}
            </Badge>
          </div>
        </div>
      </header>
      <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-emerald-800">
            <strong>Both parties have submitted.</strong> Answers revealed simultaneously. Sealed by Base44.
          </p>
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Answer Reveal</h1>
        {reveal && (
          <RevealTable
            fields={reveal.fields}
            partyAAnswers={aAnswers}
            partyBAnswers={bAnswers}
            yourLabel={yourLabel}
            theirLabel={theirLabel}
          />
        )}
        <div className="mt-8">
          {!acknowledged ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acknowledge this reveal</CardTitle>
                <CardDescription>
                  By acknowledging, you confirm you have reviewed the answers. Once both parties acknowledge, Base44 creates an immutable record.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ackError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{ackError}</div>}
                <Button variant="default" size="lg" className="w-full sm:w-auto" onClick={handleAcknowledge} disabled={ackLoading}>
                  {ackLoading ? 'Submitting…' : 'I acknowledge these answers'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-emerald-600">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <CardTitle className="text-base">Your acknowledgment recorded</CardTitle>
                <CardDescription>Waiting for the other party. Record generated automatically once both confirm.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <svg className="h-4 w-4 animate-spin text-[#0A2540]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Checking every 5 seconds…
                </div>
                {ackStatus && (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className={`rounded-lg px-3 py-2 ${ackStatus.partyA ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                      Party A: {ackStatus.partyA ? 'Acknowledged' : 'Pending'}
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${ackStatus.partyB ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                      Party B: {ackStatus.partyB ? 'Acknowledged' : 'Pending'}
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <a href={`/Built/app/record?id=${instanceId}`} className="text-sm font-medium text-[#0A2540] hover:underline">
                    Go to record page →
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RevealPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><p className="text-sm text-slate-500">Loading…</p></div>}>
      <RevealPageInner />
    </Suspense>
  );
}
