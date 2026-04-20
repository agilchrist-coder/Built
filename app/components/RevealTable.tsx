'use client';

import React from 'react';
import type { FormField } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface RevealTableProps {
  fields: FormField[];
  partyAAnswers: Record<string, string>;
  partyBAnswers: Record<string, string>;
  /** Label shown for the "your" column. Defaults to "Party A". */
  yourLabel?: string;
  /** Label shown for the "their" column. Defaults to "Party B". */
  theirLabel?: string;
}

function answersMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function RevealTable({
  fields,
  partyAAnswers,
  partyBAnswers,
  yourLabel = 'Party A',
  theirLabel = 'Party B',
}: RevealTableProps) {
  const matchCount = fields.filter((f) =>
    answersMatch(partyAAnswers[f.id] ?? '', partyBAnswers[f.id] ?? ''),
  ).length;

  const total = fields.length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm font-medium text-slate-700">
          {matchCount} of {total} answer{total !== 1 ? 's' : ''} match
        </span>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-300" />
            Match
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-red-100 ring-1 ring-red-300" />
            Differ
          </span>
        </div>
      </div>

      {/* Table — responsive card layout on mobile, table on md+ */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Field
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                {yourLabel}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                {theirLabel}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Match?
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {fields.map((field) => {
              const a = partyAAnswers[field.id] ?? '—';
              const b = partyBAnswers[field.id] ?? '—';
              const match = answersMatch(a, b);

              return (
                <tr
                  key={field.id}
                  className={match ? 'bg-emerald-50/60' : 'bg-red-50/60'}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {field.label}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{a}</td>
                  <td className="px-4 py-3 text-slate-700">{b}</td>
                  <td className="px-4 py-3">
                    {match ? (
                      <Badge variant="success">Match</Badge>
                    ) : (
                      <Badge variant="destructive">Differs</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {fields.map((field) => {
          const a = partyAAnswers[field.id] ?? '—';
          const b = partyBAnswers[field.id] ?? '—';
          const match = answersMatch(a, b);

          return (
            <div
              key={field.id}
              className={[
                'rounded-xl border p-4',
                match
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50',
              ].join(' ')}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                {match ? (
                  <Badge variant="success">Match</Badge>
                ) : (
                  <Badge variant="destructive">Differs</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {yourLabel}
                  </p>
                  <p className="text-sm text-slate-700">{a}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {theirLabel}
                  </p>
                  <p className="text-sm text-slate-700">{b}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
