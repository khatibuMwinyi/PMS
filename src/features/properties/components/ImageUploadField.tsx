'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface Preview {
  file:    File;
  dataUrl: string;
}

interface ImageUploadFieldProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label?:   string;
  error?:   string;
}

export function ImageUploadField({
  onChange,
  maxFiles = 5,
  label    = 'Property Photos',
  error,
}: ImageUploadFieldProps) {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;

      const existing  = previews;
      const slots     = maxFiles - existing.length;
      if (slots <= 0) return;

      const accepted  = Array.from(incoming).slice(0, slots);
      const nextPreviews = [...existing];

      accepted.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          nextPreviews.push({ file, dataUrl });
          // Trigger state update once all loaded
          if (nextPreviews.length === existing.length + accepted.length) {
            setPreviews([...nextPreviews]);
            onChange(nextPreviews.map((p) => p.file));
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [previews, maxFiles, onChange]
  );

  const remove = (index: number) => {
    const next = previews.filter((_, i) => i !== index);
    setPreviews(next);
    onChange(next.map((p) => p.file));
    // Reset input so re-selecting same file works
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
      )}

      {/* Thumbnails grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div
              key={i}
              className="relative rounded-[var(--radius-md)] overflow-hidden"
              style={{ aspectRatio: '4/3', background: 'var(--surface-overlay)' }}
            >
              <img
                src={p.dataUrl}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {/* Add-more tile */}
          {previews.length < maxFiles && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed transition-colors duration-120 text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              style={{ aspectRatio: '4/3', borderColor: 'var(--border-default)' }}
            >
              <Upload size={16} />
              <span className="text-[11px] mt-1">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no previews) */}
      {previews.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed cursor-pointer transition-all duration-120 py-10 hover:border-[var(--brand-primary)] hover:bg-[var(--success-bg)]"
          style={{ borderColor: error ? 'var(--state-error)' : 'var(--border-default)' }}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-overlay)' }}
          >
            <ImageIcon size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-[var(--text-primary)]">
              Drop images here, or{' '}
              <span style={{ color: 'var(--brand-primary)' }}>browse</span>
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              Up to {maxFiles} photos · JPG, PNG, WebP
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
        aria-label="Upload property images"
      />

      {error && (
        <p className="text-[13px] text-[var(--state-error)]">{error}</p>
      )}
    </div>
  );
}