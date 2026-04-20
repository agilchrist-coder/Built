'use client';

import React, { useState } from 'react';
import type { FormField, FieldType } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Short Text',
  number: 'Number',
  yesno: 'Yes / No',
  choice: 'Multiple Choice',
  longtext: 'Long Text',
  date: 'Date',
};

interface FieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  const [newOption, setNewOption] = useState('');

  function update(patch: Partial<FormField>) {
    onChange({ ...field, ...patch });
  }

  function handleTypeChange(type: FieldType) {
    const base: Partial<FormField> = { type };
    if (type === 'choice' && !field.options) {
      base.options = ['Option A', 'Option B'];
    }
    if (type !== 'choice') {
      base.options = undefined;
    }
    update(base);
  }

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    update({ options: [...(field.options ?? []), trimmed] });
    setNewOption('');
  }

  function updateOption(index: number, value: string) {
    const opts = [...(field.options ?? [])];
    opts[index] = value;
    update({ options: opts });
  }

  function removeOption(index: number) {
    const opts = [...(field.options ?? [])];
    opts.splice(index, 1);
    update({ options: opts });
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Edit Field</h2>
        <p className="text-sm text-slate-500">
          Adjust the field properties below.
        </p>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label htmlFor="field-label">Question / Label</Label>
        <Input
          id="field-label"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="e.g. What is your expected salary?"
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label htmlFor="field-type">Field Type</Label>
        <Select
          id="field-type"
          value={field.type}
          onChange={(e) => handleTypeChange(e.target.value as FieldType)}
        >
          {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </Select>
      </div>

      {/* Required toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={field.required}
          onClick={() => update({ required: !field.required })}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
            'transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[#0A2540] focus-visible:ring-offset-2',
            field.required ? 'bg-[#0A2540]' : 'bg-slate-200',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0',
              'transition duration-200 ease-in-out',
              field.required ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
        <Label className="mb-0 cursor-pointer" onClick={() => update({ required: !field.required })}>
          Required field
        </Label>
      </div>

      {/* Choice options */}
      {field.type === 'choice' && (
        <div className="space-y-3">
          <Label>Answer Options</Label>
          <ul className="space-y-2">
            {(field.options ?? []).map((opt, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="shrink-0 rounded p-1 text-slate-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label="Remove option"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="New option…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button variant="outline" size="md" onClick={addOption}>
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="mt-auto border-t border-slate-100 pt-4">
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete field
        </Button>
      </div>
    </div>
  );
}
