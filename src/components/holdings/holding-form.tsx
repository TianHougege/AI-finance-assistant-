'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

// Align with Supabase tables:
// public.holding: name/category/market/currency (text), value (numeric, nullable)
// public.portfolio: cash_value (numeric, nullable), cash_currency (text code)
export type HoldingDraft = {
  name: string;
  category: string;
  market: string;
  currency: string;
  value: number | null;
};

export type HoldingSnapshot = {
  portfolio: {
    cash_value: number | null;
    cash_currency: string | null;
  };
  holdings: HoldingDraft[];
};

type Props = {
  initialData?: HoldingSnapshot;
  onCancel?: () => void;
  onSave?: (payload: HoldingSnapshot) => void;
  saving?: boolean;
};

const CATEGORY_OPTIONS = [
  { value: 'stock', label: 'Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'bond', label: 'Bond' },
  { value: 'gold', label: 'Gold' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
] as const;

const MARKET_OPTIONS = [
  { value: 'US', label: 'US' },
  { value: 'CN', label: 'CN' },
  { value: 'HK', label: 'HK' },
  { value: 'Global', label: 'Global' },
  { value: 'Other', label: 'Other' },
] as const;

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'CNY', label: 'CNY' },
  { value: 'HKD', label: 'HKD' },
  { value: 'JPY', label: 'JPY' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'Other', label: 'Other' },
] as const;

const EMPTY_ROW: HoldingDraft = {
  name: '',
  category: '',
  market: '',
  currency: '',
  value: null,
};

export function HoldingForm({ initialData, onCancel, onSave, saving }: Props) {
  const [rows, setRows] = useState<HoldingDraft[]>(
    initialData?.holdings?.length ? initialData.holdings : [{ ...EMPTY_ROW }]
  );
  const [cashCurrency, setCashCurrency] = useState<string | null>(
    initialData?.portfolio?.cash_currency ?? null
  );
  const [cashValue, setCashValue] = useState<number | null>(
    initialData?.portfolio?.cash_value ?? null
  );

  // Reset form state whenever initialData changes (e.g. drawer re-opens with saved data)
  useEffect(() => {
    setRows(initialData?.holdings?.length ? initialData.holdings : [{ ...EMPTY_ROW }]);
    setCashCurrency(initialData?.portfolio?.cash_currency ?? null);
    setCashValue(initialData?.portfolio?.cash_value ?? null);
  }, [initialData]);

  function updateRow(idx: number, patch: Partial<HoldingDraft>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    onSave?.({
      portfolio: {
        cash_currency: cashCurrency,
        cash_value: cashValue,
      },
      holdings: rows,
    });
  }

  return (
    <div className="space-y-5">
      {/* Cash block */}
      <div className="rounded-lg border bg-background p-4">
        <div className="mb-3">
          <div className="text-sm font-semibold">Cash (separate entry)</div>
          <div className="text-xs text-muted-foreground">
            Cash is your safety buffer — tracked separately from other holdings.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cashCurrency">Currency</Label>
            <Select
              value={cashCurrency || undefined}
              onValueChange={(v) => setCashCurrency(v)}
            >
              <SelectTrigger id="cashCurrency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashValue">Amount</Label>
            <Input
              id="cashValue"
              placeholder="e.g. 5000"
              inputMode="decimal"
              value={cashValue ?? ''}
              onChange={(e) => {
                const v = e.target.value.trim();
                setCashValue(v === '' ? null : Number(v));
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Holdings rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Holdings</div>
            <div className="text-xs text-muted-foreground">
              Add one row per position.
            </div>
          </div>

          <Button type="button" variant="secondary" onClick={addRow}>
            + Add
          </Button>
        </div>

        <div className="space-y-4">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium">Position {idx + 1}</div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length === 1}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`name-${idx}`}>Name</Label>
                  <Input
                    id={`name-${idx}`}
                    placeholder="VOO / AAPL / GOOG"
                    value={row.name}
                    onChange={(e) => updateRow(idx, { name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-${idx}`}>Category</Label>
                  <Select
                    value={row.category || undefined}
                    onValueChange={(v) => updateRow(idx, { category: v })}
                  >
                    <SelectTrigger id={`category-${idx}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`market-${idx}`}>Market</Label>
                  <Select
                    value={row.market || undefined}
                    onValueChange={(v) => updateRow(idx, { market: v })}
                  >
                    <SelectTrigger id={`market-${idx}`}>
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKET_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`currency-${idx}`}>Currency</Label>
                  <Select
                    value={row.currency || undefined}
                    onValueChange={(v) => updateRow(idx, { currency: v })}
                  >
                    <SelectTrigger id={`currency-${idx}`}>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`value-${idx}`}>Market Value</Label>
                  <Input
                    id={`value-${idx}`}
                    placeholder="e.g. 12000"
                    inputMode="decimal"
                    value={row.value ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      updateRow(idx, { value: v === '' ? null : Number(v) });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

export default HoldingForm;
