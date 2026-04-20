'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ImmutableRecord } from '@/lib/types';
import { getRecord } from '@/lib/base44';
import { RevealTable } from '@/components/RevealTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function RecordPageInner() {
  const searchParams = useSearchParams();
  const instanceId = searchParams.get('id') || '';

  const [record, setRecord] = useState<ImmutableRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!instanceId) { setLoadError('No record ID provided.'); return; }

    async function load() {
      try {
        // BASE44 CALL — Final immutable record after both parties acknowledged
        const data = await getRecord(instanceId);
        setRecord(data);
      } catch (err) {
        setLoadError(`Could not load record: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    load();
  }, [instanceId]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  if (!record && !loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="h-7 w-7 animate-spin text-[#0A2540]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm">Loading record…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">Record not available</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/Built/app/" className="text-sm font-medium text-[#0A2540] hover:underline">← Back to dashboard</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold text-[#0A2540]">Stipum</span>
              <p className="mt-0.5 text-sm text-slate-500">Immutable Record</p>
            </div>
            <Badge variant="success">Complete</Badge>
          </div>
        </div>
      </header>
      <div className="border-b border-slate-200 bg-[#0A2540] px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-white/80">
            <span className="font-semibold text-white">This record is immutable.</span>{' '}
            Sealed by Base44 after both parties acknowledged. The SHA-256 hash proves content integrity.
          </p>
        </div>
      </div>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[#0A2540]">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Record Details
            </CardTitle>
            <CardDescription>Sealed by Base44. Reference this record by its ID or hash.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Record ID</p>
              <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">{record!.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">SHA-256 Hash</p>
              <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">{record!.hash}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sealed at</p>
                <p className="text-sm text-slate-800">
                  {new Date(record!.timestamp).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Instance ID</p>
                <p className="break-all font-mono text-sm text-slate-800">{record!.instanceId}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Party A</p>
                <p className="text-sm text-slate-800">{record!.creatorEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Party B</p>
                <p className="text-sm text-slate-800">{record!.partyBEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={record!.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d2f4f]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Download PDF
          </a>
          <Button variant="outline" size="lg" className="flex-1" onClick={copyLink}>
            {copied ? '✓ Copied!' : 'Copy record link'}
          </Button>
        </div>

        {record!.revealResult && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Full Answer Record</h2>
            <p className="mb-4 text-sm text-slate-500">Read-only. Final sealed state as recorded by Base44.</p>
            <RevealTable
              fields={record!.revealResult.fields}
              partyAAnswers={record!.revealResult.partyAAnswers}
              partyBAnswers={record!.revealResult.partyBAnswers}
              yourLabel="Party A"
              theirLabel="Party B"
            />
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <a href="/Built/app/" className="text-sm font-medium text-[#0A2540] hover:underline">← Back to dashboard</a>
        </div>
      </main>
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><p className="text-sm text-slate-500">Loading…</p></div>}>
      <RecordPageInner />
    </Suspense>
  );
}
