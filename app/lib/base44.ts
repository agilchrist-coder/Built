// Stipum — Base44 stubs (Option A: front-door only, all filing at app.stipum.com)
import type { FormField, FormInstance, RevealResult, AcknowledgmentStatus, ImmutableRecord } from './types';

const noop = () => Promise.reject(new Error('Use app.stipum.com'));

export const createFormInstance = (_f: FormField[], _a: string, _b: string): Promise<FormInstance> => noop();
export const getFormInstance = (_id: string): Promise<FormInstance> => noop();
export const listFormInstances = (): Promise<FormInstance[]> => noop();
export const submitAnswers = (_id: string, _p: 'partyA' | 'partyB', _a: Record<string, string>): Promise<void> => noop();
export const getReveal = (_id: string): Promise<RevealResult> => noop();
export const acknowledgeReveal = (_id: string, _p: 'partyA' | 'partyB'): Promise<AcknowledgmentStatus> => noop();
export const getRecord = (_id: string): Promise<ImmutableRecord> => noop();
export const generateRecordPdf = (_id: string): Promise<{ pdfUrl: string }> => noop();
export const pollUntil = async <T>(_fn: () => Promise<T>, _pred: (r: T) => boolean): Promise<T> => noop();
