'use client';

import { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  helper?: string;
  error?: string;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter to add…',
  label,
  helper,
  error,
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '');
    if (!tag || value.includes(tag)) return;
    const next = [...value, tag];
    onChange?.(next);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange?.(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-[var(--text-secondary)] leading-none">
          {label}
        </label>
      )}

      <div
        className={cn(
          'flex flex-wrap gap-2 min-h-10 p-2 rounded-[var(--radius-md)]',
          'border bg-[var(--surface-card)] cursor-text',
          'transition-all duration-200',
          error
            ? 'border-[var(--state-error)]'
            : 'border-[var(--border-default)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)] focus-within:border-transparent',
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-[var(--surface-overlay)] border border-[var(--border-default)] text-[13px] text-[var(--text-primary)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {error && (
        <p className="text-[13px] text-[var(--state-error)]">{error}</p>
      )}
      {helper && !error && (
        <p className="text-[12px] text-[var(--text-muted)]">{helper}</p>
      )}
    </div>
  );
}