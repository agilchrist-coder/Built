// Stipum — Base44 SDK client
// All protocol integrity (blind submissions, simultaneous reveal, immutable records)
// is enforced by Base44. This file is a thin wrapper around the Base44 SDK.
//
// SDK docs: https://base44.app/docs/sdk
// appId is auto-detected by the SDK from the environment.

import { createClient } from '@base44/sdk';

import type {
  FormField,
  FormInstance,
  RevealResult,
  AcknowledgmentStatus,
  ImmutableRecord,
} from './types';

// SDK auto-detects appId from the Base44 environment (no manual config needed)
const base44 = createClient();

// ---------------------------------------------------------------------------
// Entity CRUD — handled automatically by Base44 SDK
// ---------------------------------------------------------------------------

/**
 * BASE44 CALL — Creates a new blind-form instance.
 * Base44 stores the field definitions and associates both party emails.
 */
export async function createFormInstance(
  fields: FormField[],
  creatorEmail: string,
  partyBEmail: string,
): Promise<FormInstance> {
  return base44.entities.FormInstance.create({ fields, creatorEmail, partyBEmail });
}

/**
 * BASE44 CALL — Fetches a single form instance by ID.
 */
export async function getFormInstance(id: string): Promise<FormInstance> {
  return base44.entities.FormInstance.get(id);
}

/**
 * BASE44 CALL — Lists all form instances for the current user.
 */
export async function listFormInstances(): Promise<FormInstance[]> {
  return base44.entities.FormInstance.list();
}

// ---------------------------------------------------------------------------
// Custom backend functions (deployed in Base44 functions/ directory)
// ---------------------------------------------------------------------------

/**
 * BASE44 CALL — Submits one party's answers blindly.
 * Base44 stores answers; neither party can see the other's until both submit.
 */
export async function submitAnswers(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
  answers: Record<string, string>,
): Promise<void> {
  return base44.functions.submitAnswers({ instanceId, partyId, answers });
}

/**
 * BASE44 CALL — Fetches the simultaneous reveal payload.
 * Only available after both parties have submitted.
 * Base44 returns an error if called before both submissions are in.
 */
export async function getReveal(instanceId: string): Promise<RevealResult> {
  return base44.functions.getReveal({ instanceId });
}

/**
 * BASE44 CALL — Records one party's acknowledgment of the revealed answers.
 */
export async function acknowledgeReveal(
  instanceId: string,
  partyId: 'partyA' | 'partyB',
): Promise<AcknowledgmentStatus> {
  return base44.functions.acknowledgeReveal({ instanceId, partyId });
}

/**
 * BASE44 CALL — Retrieves the final immutable record after both parties acknowledge.
 * Includes SHA hash and PDF URL.
 */
export async function getRecord(instanceId: string): Promise<ImmutableRecord> {
  return base44.functions.getRecord({ instanceId });
}

/**
 * BASE44 CALL — Generates (or retrieves) the PDF for the immutable record.
 */
export async function generateRecordPdf(instanceId: string): Promise<{ pdfUrl: string }> {
  return base44.functions.generateRecordPdf({ instanceId });
}

// ---------------------------------------------------------------------------
// Polling helper (used in fill and reveal pages)
// ---------------------------------------------------------------------------

/**
 * Polls Base44 by calling `fn` every `intervalMs` ms until `predicate`
 * returns true or `maxAttempts` is exceeded.
 */
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
        if (predicate(result)) {
          resolve(result);
          return;
        }
      } catch {
        // Swallow transient errors while waiting for Base44 status change
      }

      if (attempts >= maxAttempts) {
        reject(new Error('Polling timed out waiting for Base44 status change.'));
        return;
      }

      setTimeout(tick, intervalMs);
    };

    tick();
  });
}
