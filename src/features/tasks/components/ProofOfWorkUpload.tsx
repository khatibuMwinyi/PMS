'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitTaskEvidence } from '../actions';

interface Props {
  taskId: string;
  existing: string[];
}

const MIN = 3;
const MAX = 10;
const MAX_BYTES = 2_000_000;

interface Item {
  /** Pre-existing remote URL (data: or http:) loaded from `existing` prop. */
  url?: string;
  /** Locally-selected file pending data-URL conversion at submit. */
  file?: File;
  /** Preview URL for rendering (data URL when available, blob URL otherwise). */
  preview: string;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export function ProofOfWorkUpload({ taskId, existing }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(() =>
    existing.map((url) => ({ url, preview: url })),
  );
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const slots = MAX - items.length;
    if (slots <= 0) return;
    const accepted = Array.from(list).slice(0, slots);
    const next: Item[] = [];
    for (const f of accepted) {
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} exceeds 2MB — please compress before uploading.`);
        continue;
      }
      // URL.createObjectURL is sync; jsdom may not implement it, fall back to a placeholder.
      let preview = '';
      try {
        preview = URL.createObjectURL(f);
      } catch {
        preview = '';
      }
      next.push({ file: f, preview });
    }
    setItems((cur) => [...cur, ...next]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (idx: number) => {
    setItems((cur) => {
      const tgt = cur[idx];
      if (tgt?.file && tgt.preview) {
        try { URL.revokeObjectURL(tgt.preview); } catch {}
      }
      return cur.filter((_, i) => i !== idx);
    });
  };

  const submit = () => {
    startTransition(async () => {
      try {
        const dataUrls = await Promise.all(
          items.map((it) => (it.url ? Promise.resolve(it.url) : readAsDataUrl(it.file!))),
        );
        await submitTaskEvidence(taskId, dataUrls);
        toast.success('Evidence submitted — awaiting owner review.');
        router.refresh();
      } catch (e: any) {
        toast.error(e?.message ?? 'Submission failed');
      }
    });
  };

  return (
    <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex justify-between items-center">
        <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Proof of Work</h3>
        <span className="text-body-sm text-[var(--text-muted)]">{items.length} of {MIN}+ photos</span>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <p className="text-body-sm text-[var(--text-secondary)]">
          Upload at least {MIN} photos showing the work site, materials, and the completed result. Max {MAX} photos, 2MB each.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((it, i) => (
            <div key={i} className="relative aspect-square rounded overflow-hidden border border-[var(--border-subtle)]">
              {it.preview ? (
                <img src={it.preview} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--surface-muted)]" aria-label={`Evidence ${i + 1}`} />
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {items.length < MAX && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] flex flex-col items-center justify-center gap-1"
            >
              <Camera size={20} />
              <span className="text-label">Add</span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          aria-label="Upload evidence"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={submit}
          disabled={items.length < MIN || isPending}
          className="w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isPending ? 'Submitting…' : 'Submit Evidence'}
        </button>
      </div>
    </section>
  );
}
