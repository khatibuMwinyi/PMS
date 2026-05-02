'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServiceForm } from './ServiceForm';

export function AddServiceButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus size={16} className="mr-1.5" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Service Type</DialogTitle>
        </DialogHeader>
        <ServiceForm
          onSuccess={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
