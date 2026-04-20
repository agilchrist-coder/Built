'use client';

import React, { useState } from 'react';
import type { FormField } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FillFormProps {
  instanceId: string;
  fields: FormField[];
  /** If true, renders in preview mode — submit button is hidden */
  preview?: boolean;
  /** Called when the user submits. Receives answers map. */
  onSubmit?: (answers: Record<string, string>) => Promise<void>;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          id={field.id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
          required={field.required}
        />
      );

    case 'number':
      return (
        <Input
          id={field.id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          required={field.required}
        />
      );

    case 'longtext':
      return (
        <Textarea
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
          required={field.required}
        />
      );

    case 'date':
      return (
        <Input
          id={field.id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'yesno':
      return (
        <div className="flex gap-3" role="radiogroup" aria-labelledby={`${field.id}-label`}>
          {['Yes', 'No'].map((opt) => (
            <label
              key={opt}
              className={[
                'flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 py-3 text-sm font-medium transition-colors',
                value === opt
                  ? 'border-[#0A2540] bg-[#0A2540] text-white'
                  : 'border-slate-200 text-slate-700 hover:border-slate-400',
              ].join(' ')}
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case 'choice':
      if (!field.options || field.options.length === 0) {
        return (
          <p className="text-sm text-slate-400 italic">No options configured.</p>
        );
      }
      return (
        <div className="space-y-2" role="radiogroup">
          {field.options.map((opt) => (
            <label
              key={opt}
              className={[
                'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors',
                value === opt
                  ? 'border-[#0A2540] bg-[#0A2540]/5 text-[#0A2540]'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <span
                className={[
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                  value === opt ? 'border-[#0A2540]' : 'border-slate-300',
                ].join(' ')}
              >
                {value === opt && (
                  <span className="h-2 w-2 rounded-full bg-[#0A2540]" />
                )}
              </span>
              {opt}
            </label>
          ))}
        </div>
      );

    default:
      return (
        <Input
          id={field.id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
        />
      );
  }
}

export function FillForm({ fields, preview = false, onSubmit }: FillFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.id, ''])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A form is complete when all required fields have a non-empty answer
  const allRequiredFilled = fields
    .filter((f) => f.required)
    .every((f) => (answers[f.id] ?? '').trim() !== '');

  function setAnswer(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubmit || preview) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(answers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {fields.length === 0 && (
        <p className="text-center text-sm text-slate-400 italic">
          No fields to display.
        </p>
      )}

      {fields.map((field, idx) => (
        <div key={field.id} className="space-y-2">
          <Label
            id={`${field.id}-label`}
            htmlFor={field.id}
            required={field.required}
          >
            <span className="mr-2 text-xs font-normal text-slate-400">
              {idx + 1}.
            </span>
            {field.label || <span className="italic text-slate-400">Untitled field</span>}
          </Label>
          <FieldInput
            field={field}
            value={answers[field.id] ?? ''}
            onChange={(v) => setAnswer(field.id, v)}
          />
        </div>
      ))}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!preview && (
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          disabled={!allRequiredFilled}
          loading={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit my answers'}
        </Button>
      )}

      {preview && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
          Preview mode — submit is disabled.
        </div>
      )}
    </form>
  );
}
