// Stipum — TypeScript types
// These mirror exactly what Base44 returns; no blind logic lives here.

export type FieldType = 'text' | 'number' | 'yesno' | 'choice' | 'longtext' | 'date';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // only for type === 'choice'
}

export interface FormInstance {
  id: string;
  fields: FormField[];
  creatorEmail: string;
  partyBEmail: string;
  status: 'pending' | 'partial' | 'both_submitted' | 'both_acknowledged' | 'complete';
  createdAt: string; // ISO 8601
}

export interface Submission {
  instanceId: string;
  partyId: 'partyA' | 'partyB';
  answers: Record<string, string>; // fieldId → answer string
}

export interface RevealResult {
  fields: FormField[];
  partyAAnswers: Record<string, string>;
  partyBAnswers: Record<string, string>;
}

export interface AcknowledgmentStatus {
  partyA: boolean;
  partyB: boolean;
}

export interface ImmutableRecord {
  id: string;
  hash: string;        // SHA-256 of the complete record
  pdfUrl: string;
  timestamp: string;   // ISO 8601
  instanceId: string;
  creatorEmail: string;
  partyBEmail: string;
  revealResult: RevealResult;
}
