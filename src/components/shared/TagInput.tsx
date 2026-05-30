'use client';

import { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  options?: { value: string; label: string }[];
  selected?: string[];
  placeholder?: string;
  label?: string;
  helper?: string;
  error?: string;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  options,
  selected,
  placeholder = 'Type and press Enter to add…',
  label,
  helper,
  error,
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = selected ?? value;
  const handleChange = onChange;

  if (options) {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-body-sm font-medium text-[var(--text-secondary)] leading-none">
            {label}
          </label>
        )}
        <div className={cn('flex flex-wrap gap-2', className)}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const next = tags.includes(opt.value)
                  ? tags.filter((t) => t !== opt.value)
                  : [...tags, opt.value];
                handleChange?.(next);
              }}
              className={cn(
                'px-3 py-1.5 rounded-full text-label transition-all',
                tags.includes(opt.value)
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-surface-overlay text-text-muted hover:text-text-primary border border-border-default',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {helper && !error && <p className="text-body-sm text-text-muted">{helper}</p>}
        {error && <p className="text-body-sm text-state-error">{error}</p>}
      </div>
    );
  }

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '');
    if (!tag || tags.includes(tag)) return;
    const next = [...tags, tag];
    handleChange?.(next);
    setInput('');
  };

  const removeTag = (tag: string) => {
    handleChange?.(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-body-sm font-medium text-[var(--text-secondary)] leading-none">
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
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-[var(--surface-overlay)] border border-[var(--border-default)] text-body-sm text-[var(--text-primary)]"
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
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-body-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {helper && !error && <p className="text-body-sm text-[var(--text-muted)]">{helper}</p>}
      {error && <p className="text-body-sm text-[var(--state-error)]">{error}</p>}
    </div>
  );
}
