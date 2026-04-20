// Stipum — Base44 API client
// All protocol logic lives in Base44 functions at blind-fold-sync.base44.app
// This file calls those functions via plain fetch.

import type {
  FormField,
  FormInstance,
  RevealResult,
  AcknowledgmentStatus,
  ImmutableRecord,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE44_URL || 'https://blind-fold-sync.base44.app';

async function fn<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/functions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Base44 ${name} → ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// BASE44 CALL — create a new form instance
export async function createFormInstance(
  fields: FormField[],
  creatorEmail: string,
  partyBEmail: string,
): Promise<FormInstance> {
  return fn<FormInstance>('createFormInstance', { fields, creatorEmail, partyBEmail });
}

// BASE44 CALL — get a form instance by ID
export async function getFormInstance(id: string): Promise<FormInstance> {
  return fn<FormInstance>('getFormInstance', { id });
}

// BASE44 CALL — list all form instances
export async function listFormInstances(): Promise<FormInstance[]> {
  return fn<FormInstance[]>('listFormInstances', {});
}

// BASE44 CALL — submit one party's answers blindly
export async function submitAnswers(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
  answers: Record<string, string>,
): Promise<void> {
  return fn('submitAnswers', { instanceId, partyId, answers });
}

// BASE44 CALL — get simultaneous reveal (only after both parties submitted)
export async function getReveal(instanceId: string): Promise<RevealResult> {
  return fn<RevealResult>('getReveal', { instanceId });
}

// BASE44 CALL — record one party's acknowledgment
export async function acknowledgeReveal(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
): Promise<AcknowledgmentStatus> {
  return fn<AcknowledgmentStatus>('acknowledgeReveal', { instanceId, partyId });
}

// BASE44 CALL — get final immutable record after both parties acknowledged
export async function getRecord(instanceId: string): Promise<ImmutableRecord> {
  return fn<ImmutableRecord>('getRecord', { instanceId });
}

// BASE44 CALL — generate PDF of the immutable record
export async function generateRecordPdf(instanceId: string): Promise<{ pdfUrl: string }> {
  return fn<{ pdfUrl: string }>('generateRecordPdf', { instanceId });
}

// Polling helper
export async function pollUntil<T>(
  fn: () => Promise<T>,
  predicate: (result: T) => boolean,
  intervalMs = 5000,
  maxAttempts = 120,
): Promise<T> {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      attempts++;
      try {
        const result = await fn();
        if (predicate(result)) { resolve(result); return; }
      } catch { /* swallow while waiting */ }
      if (attempts >= maxAttempts) { reject(new Error('Polling timed out.')); return; }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}
