import * as React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-[#0A2540] text-white',
  success:
    'bg-emerald-100 text-emerald-800',
  warning:
    'bg-amber-100 text-amber-800',
  destructive:
    'bg-red-100 text-red-800',
  secondary:
    'bg-slate-100 text-slate-700',
  outline:
    'border border-slate-300 text-slate-700 bg-transparent',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
