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
  type HoldingDraft,
} from '@/components/holdings/holding-form';

export type HoldingSnapshot = {
  portfolio: {
    cash_value: number | null;
    cash_currency: string | null;
  };
  holdings: HoldingDraft[];
};

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSave?: (snapshot: HoldingSnapshot) => void | Promise<void>;
  saving?: boolean;
};

export function HoldingDrawer({ open, onOpenChange, onSave, saving }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(payload: HoldingSnapshot) {
    try {
      setIsSaving(true);
      await onSave?.(payload);
      // Close after save (v0: assume success if no throw)
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
              <SheetTitle>填写现有持仓</SheetTitle>
              <SheetDescription>
                v0：先做静态表单与本地保存流程，后续接 Supabase 并自动计算权重。
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Body (scrollable) */}
          <div className="flex-1 overflow-y-auto p-6">
            <HoldingForm
              onCancel={handleCancel}
              onSave={handleSave}
              saving={saving}
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
                关闭
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default HoldingDrawer;
