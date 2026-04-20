// Stipum — Base44 API client (plain fetch, no external SDK)
// All protocol integrity is enforced by Base44.
// Replace BASE_URL with your Base44 app domain when wiring up.
//
// TODO: swap for @base44/sdk once confirmed available on npm:
//   npm install @base44/sdk
//   const base44 = createClient(); // auto-detects appId

import type {
  FormField,
  FormInstance,
  RevealResult,
  AcknowledgmentStatus,
  ImmutableRecord,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE44_URL || 'https://api.base44.app';

async function call<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: method === 'POST' ? 'no-store' : 'default',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Base44 ${method} ${path} → ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// BASE44 CALL — create a new form instance
export async function createFormInstance(
  fields: FormField[],
  creatorEmail: string,
  partyBEmail: string,
): Promise<FormInstance> {
  return call<FormInstance>('POST', '/forms/instances', { fields, creatorEmail, partyBEmail });
}

// BASE44 CALL — get a form instance by ID
export async function getFormInstance(id: string): Promise<FormInstance> {
  return call<FormInstance>('GET', `/forms/instances/${id}`);
}

// BASE44 CALL — list all form instances for current user
export async function listFormInstances(): Promise<FormInstance[]> {
  return call<FormInstance[]>('GET', '/forms/instances');
}

// BASE44 CALL — submit one party's answers blindly
export async function submitAnswers(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
  answers: Record<string, string>,
): Promise<void> {
  return call('POST', '/functions/submitAnswers', { instanceId, partyId, answers });
}

// BASE44 CALL — get simultaneous reveal (only after both parties submitted)
export async function getReveal(instanceId: string): Promise<RevealResult> {
  return call<RevealResult>('POST', '/functions/getReveal', { instanceId });
}

// BASE44 CALL — record one party's acknowledgment
export async function acknowledgeReveal(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
): Promise<AcknowledgmentStatus> {
  return call<AcknowledgmentStatus>('POST', '/functions/acknowledgeReveal', { instanceId, partyId });
}

// BASE44 CALL — get final immutable record after both parties acknowledged
export async function getRecord(instanceId: string): Promise<ImmutableRecord> {
  return call<ImmutableRecord>('POST', '/functions/getRecord', { instanceId });
}

// BASE44 CALL — generate PDF of the immutable record
export async function generateRecordPdf(instanceId: string): Promise<{ pdfUrl: string }> {
  return call<{ pdfUrl: string }>('POST', '/functions/generateRecordPdf', { instanceId });
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
