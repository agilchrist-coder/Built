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

// SDK auto-detects appId from the Base44 environment
const base44 = createClient();

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
  return base44.functions.submitAnswers({ instanceId, partyId, answers });
}

// BASE44 CALL — get simultaneous reveal (only after both parties submitted)
export async function getReveal(instanceId: string): Promise<RevealResult> {
  return base44.functions.getReveal({ instanceId });
}

// BASE44 CALL — record one party's acknowledgment
export async function acknowledgeReveal(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
): Promise<AcknowledgmentStatus> {
  return base44.functions.acknowledgeReveal({ instanceId, partyId });
}

// BASE44 CALL — get final immutable record after both parties acknowledged
export async function getRecord(instanceId: string): Promise<ImmutableRecord> {
  return base44.functions.getRecord({ instanceId });
}

// BASE44 CALL — generate PDF of the immutable record
export async function generateRecordPdf(instanceId: string): Promise<{ pdfUrl: string }> {
  return base44.functions.generateRecordPdf({ instanceId });
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
