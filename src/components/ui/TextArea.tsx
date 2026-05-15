'use client';

import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helper, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-md border
            bg-[var(--surface-card)] text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            transition-all duration-base
            ${error ? 'border-[var(--state-error)]' : 'border-[var(--border-subtle)]'}
            ${className || ''}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--state-error)]">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{helper}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';