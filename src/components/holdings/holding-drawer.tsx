'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';

import {
  HoldingForm,
  type HoldingSnapshot,
} from '@/components/holdings/holding-form';

export type { HoldingSnapshot };

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSave?: (snapshot: HoldingSnapshot) => void | Promise<void>;
  saving?: boolean;
  initialData?: HoldingSnapshot;
};

export function HoldingDrawer({ open, onOpenChange, onSave, saving, initialData }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(payload: HoldingSnapshot) {
    try {
      setIsSaving(true);
      await onSave?.(payload);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0">
        <div className="flex h-full flex-col">
          {/* Header (fixed) */}
          <div className="border-b p-6">
            <SheetHeader>
              <SheetTitle>Edit Holdings</SheetTitle>
              <SheetDescription>
                Enter your current positions and cash balance. Data is saved to your account.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Body (scrollable) */}
          <div className="flex-1 overflow-y-auto p-6">
            <HoldingForm
              initialData={initialData}
              onCancel={handleCancel}
              onSave={handleSave}
              saving={saving || isSaving}
            />
          </div>

          {/* Footer (fixed) */}
          <div className="border-t p-4">
            <SheetFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Close
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default HoldingDrawer;
