import * as React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={[
            'flex min-h-[100px] w-full rounded-lg border bg-white px-3 py-2 text-sm',
            'placeholder:text-slate-400 text-slate-900 resize-y',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540] focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-slate-300 hover:border-slate-400',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
