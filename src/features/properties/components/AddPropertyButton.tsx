'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { SlideOver }          from './SlideOver';
import { CreatePropertyForm } from './CreatePropertyForm';

interface AddPropertyButtonProps {
  /** Optional label override */
  label?: string;
}

export function AddPropertyButton({ label = 'Add Property' }: AddPropertyButtonProps) {
  const router      = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    // revalidatePath ran on the server; refresh re-renders the server component
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] text-[14px] font-medium shrink-0 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        style={{ background: 'var(--brand-primary)', color: 'white' }}
      >
        <Plus size={16} />
        {label}
      </button>

      {open && (
        <SlideOver
          open={open}
          onClose={() => setOpen(false)}
          title="Add New Property"
        >
          <CreatePropertyForm onSuccess={handleSuccess} />
        </SlideOver>
      )}
    </>
  );
}