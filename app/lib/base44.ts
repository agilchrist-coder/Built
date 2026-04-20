// Stipum — Base44 client
// Entity CRUD (FormInstance, FormSubmission) is handled directly by the SDK.
// Custom functions (submitAnswers, getReveal, etc.) are called via SDK too.
// Base44 enforces all blind protocol logic server-side.

import { createClient } from '@base44/sdk';

import type {
  FormField,
  FormInstance,
  RevealResult,
  AcknowledgmentStatus,
  ImmutableRecord,
} from './types';

// SDK initialized with appId derived from the Base44 app URL
const base44 = createClient({ appId: 'blind-fold-sync' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fns = base44.functions as unknown as Record<string, (args: unknown) => Promise<unknown>>;

// ─── Entity CRUD (SDK talks to database directly) ────────────────────────────

// BASE44 CALL — create a new form instance
export async function createFormInstance(
  fields: FormField[],
  creatorEmail: string,
  partyBEmail: string,
): Promise<FormInstance> {
  return base44.entities.FormInstance.create({ fields, creatorEmail, partyBEmail, status: 'pending' });
}

// BASE44 CALL — get a form instance by ID
export async function getFormInstance(id: string): Promise<FormInstance> {
  return base44.entities.FormInstance.get(id);
}

// BASE44 CALL — list all form instances
export async function listFormInstances(): Promise<FormInstance[]> {
  return base44.entities.FormInstance.list();
}

// ─── Custom functions (server-side enforced protocol logic) ──────────────────

// BASE44 CALL — submit one party's answers blindly
export async function submitAnswers(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
  answers: Record<string, string>,
): Promise<void> {
  return fns['submitAnswers']({ instanceId, partyId, answers }) as Promise<void>;
}

// BASE44 CALL — get simultaneous reveal (only after both parties submitted)
export async function getReveal(instanceId: string): Promise<RevealResult> {
  return fns['getReveal']({ instanceId }) as Promise<RevealResult>;
}

// BASE44 CALL — record one party's acknowledgment
export async function acknowledgeReveal(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
): Promise<AcknowledgmentStatus> {
  return fns['acknowledgeReveal']({ instanceId, partyId }) as Promise<AcknowledgmentStatus>;
}

// BASE44 CALL — get final immutable record after both parties acknowledged
export async function getRecord(instanceId: string): Promise<ImmutableRecord> {
  return fns['getRecord']({ instanceId }) as Promise<ImmutableRecord>;
}

// BASE44 CALL — generate PDF of the immutable record
export async function generateRecordPdf(instanceId: string): Promise<{ pdfUrl: string }> {
  return fns['generateRecordPdf']({ instanceId }) as Promise<{ pdfUrl: string }>;
}

// ─── Polling helper ──────────────────────────────────────────────────────────

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
