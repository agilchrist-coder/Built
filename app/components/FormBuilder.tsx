'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import type { FormField, FieldType } from '@/lib/types';
import { createFormInstance } from '@/lib/base44';
import { FieldEditor } from '@/components/FieldEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FillForm } from '@/components/FillForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function defaultField(): FormField {
  return {
    id: makeId(),
    label: '',
    type: 'text',
    required: true,
  };
}

const FIELD_TYPE_ICON: Record<FieldType, string> = {
  text: 'T',
  number: '#',
  yesno: '?',
  choice: '☰',
  longtext: '¶',
  date: '📅',
};

const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: 'Short text',
  number: 'Number',
  yesno: 'Yes / No',
  choice: 'Multiple choice',
  longtext: 'Long text',
  date: 'Date',
};

// ---------------------------------------------------------------------------
// Invite modal
// ---------------------------------------------------------------------------

interface InviteModalProps {
  fields: FormField[];
  onClose: () => void;
}

function InviteModal({ fields, onClose }: InviteModalProps) {
  const [creatorEmail, setCreatorEmail] = useState('');
  const [partyBEmail, setPartyBEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    if (!creatorEmail || !partyBEmail) {
      setError('Both email addresses are required.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // BASE44 CALL — Creates a new blind-form instance with all current fields
      // and both party emails. Base44 returns the instance id and generates
      // the submission tokens. No blind logic here.
      const instance = await createFormInstance(fields, creatorEmail, partyBEmail);

      const link = `${window.location.origin}/Built/app/fill?id=${instance.id}`;
      setGeneratedLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).catch(() => {});
    }
  }

  function goToFill() {
    if (generatedLink) {
      const instanceId = new URL(generatedLink).searchParams.get('id');
      router.push(`/Built/app/fill?id=${instanceId}`);
    }
  }

  return (
    /* Modal backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Invite Party B"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Invite Party B</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Enter both email addresses. Base44 will generate a unique fill link.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540]"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {!generatedLink ? (
          <div className="space-y-4">
            {/* Creator email */}
            <div className="space-y-1.5">
              <Label htmlFor="creator-email">Your email (Party A)</Label>
              <Input
                id="creator-email"
                type="email"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {/* Party B email */}
            <div className="space-y-1.5">
              <Label htmlFor="partyb-email">Party B email</Label>
              <Input
                id="partyb-email"
                type="email"
                value={partyBEmail}
                onChange={(e) => setPartyBEmail(e.target.value)}
                placeholder="them@example.com"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Field count summary */}
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {fields.length} field{fields.length !== 1 ? 's' : ''} will be included in this form.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="md"
                className="flex-1"
                loading={loading}
                disabled={fields.length === 0}
                onClick={handleCreate}
              >
                Generate link
              </Button>
            </div>
          </div>
        ) : (
          /* Success state — show generated link */
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mx-auto mb-2 h-8 w-8 text-emerald-600"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-semibold text-emerald-800">Form created successfully!</p>
            </div>

            <div>
              <Label className="mb-1.5">Share this fill link with Party B</Label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="text-xs" />
                <Button variant="outline" size="md" onClick={copyLink}>
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
                Done
              </Button>
              <Button variant="default" size="md" className="flex-1" onClick={goToFill}>
                Fill my answers
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main FormBuilder component
// ---------------------------------------------------------------------------

export function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([defaultField()]);
  const [selectedId, setSelectedId] = useState<string>(fields[0].id);
  const [showPreview, setShowPreview] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const previewId = useId();

  const selectedField = fields.find((f) => f.id === selectedId) ?? fields[0];

  // ---- Field list mutations ----

  function addField() {
    const f = defaultField();
    setFields((prev) => [...prev, f]);
    setSelectedId(f.id);
  }

  function updateField(updated: FormField) {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  function deleteField(id: string) {
    setFields((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) {
        const fresh = defaultField();
        setSelectedId(fresh.id);
        return [fresh];
      }
      const removedIndex = prev.findIndex((f) => f.id === id);
      const newSelected = next[Math.min(removedIndex, next.length - 1)];
      setSelectedId(newSelected.id);
      return next;
    });
  }

  // Simple drag-to-reorder via move up/down buttons (no library dep)
  function moveField(id: string, direction: 'up' | 'down') {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  const canInvite = fields.length > 0 && fields.every((f) => f.label.trim() !== '');

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        {/* ---------------------------------------------------------------- */}
        {/* Top bar                                                           */}
        {/* ---------------------------------------------------------------- */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              ← Stipum
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-900">Form builder</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className={[
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540]',
                showPreview
                  ? 'bg-[#0A2540] text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Main area                                                         */}
        {/* ---------------------------------------------------------------- */}
        {showPreview ? (
          /* Preview mode — render the form as it would look to a filler */
          <div className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Preview mode — this is how the form looks to each party.
            </div>
            <FillForm
              instanceId={previewId}
              fields={fields}
              preview
            />
          </div>
        ) : (
          /* Edit mode — left panel (field list) + right panel (field editor) */
          <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
            {/* ---- Left panel: field list ---- */}
            <aside className="flex w-full flex-col border-b border-slate-200 bg-slate-50 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Fields
                </span>
                <Badge variant="outline">{fields.length}</Badge>
              </div>

              <ul className="flex-1 space-y-1 px-3 pb-2">
                {fields.map((field, idx) => (
                  <li key={field.id}>
                    <div
                      className={[
                        'group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
                        selectedId === field.id
                          ? 'bg-white ring-1 ring-[#0A2540]/20 shadow-card'
                          : 'hover:bg-white hover:shadow-sm',
                      ].join(' ')}
                      onClick={() => setSelectedId(field.id)}
                    >
                      {/* Type icon */}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0A2540]/10 text-xs font-bold text-[#0A2540]">
                        {FIELD_TYPE_ICON[field.type]}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-medium ${field.label ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                          {field.label || 'Untitled field'}
                        </p>
                        <p className="text-xs text-slate-400">{FIELD_TYPE_LABEL[field.type]}</p>
                      </div>

                      {/* Move buttons */}
                      <div className="ml-auto flex shrink-0 flex-col opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={idx === 0}
                          onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
                          className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path fillRule="evenodd" d="M11.78 11.03a.75.75 0 01-1.06 0L8 8.31 5.28 11.03a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={idx === fields.length - 1}
                          onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
                          className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path fillRule="evenodd" d="M4.22 4.97a.75.75 0 011.06 0L8 7.69l2.72-2.72a.75.75 0 111.06 1.06L8.53 9.28a.75.75 0 01-1.06 0L4.22 6.03a.75.75 0 010-1.06z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Add field button */}
              <div className="p-3">
                <button
                  type="button"
                  onClick={addField}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:border-[#0A2540] hover:text-[#0A2540] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Add field
                </button>
              </div>
            </aside>

            {/* ---- Right panel: field editor ---- */}
            <main className="flex-1 overflow-y-auto bg-white">
              {selectedField ? (
                <FieldEditor
                  field={selectedField}
                  onChange={updateField}
                  onDelete={() => deleteField(selectedField.id)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Select a field to edit it.
                </div>
              )}
            </main>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Bottom bar                                                        */}
        {/* ---------------------------------------------------------------- */}
        <footer className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            {fields.filter((f) => f.label.trim()).length} of {fields.length} field
            {fields.length !== 1 ? 's' : ''} labelled
          </p>
          <Button
            variant="default"
            size="md"
            disabled={!canInvite}
            onClick={() => setShowInviteModal(true)}
          >
            Invite Party B →
          </Button>
        </footer>
      </div>

      {/* ---- Invite modal ---- */}
      {showInviteModal && (
        <InviteModal fields={fields} onClose={() => setShowInviteModal(false)} />
      )}
    </>
  );
}
