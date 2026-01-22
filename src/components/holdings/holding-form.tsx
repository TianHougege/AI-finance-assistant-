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
import { useState } from 'react';

// Align with Supabase tables:
// public.holding: name/category/market/currency (text), value (numeric, nullable)
// public.portfolio: cash_value (numeric, nullable), cash_currency (captured as text code in the form; map to numeric later if needed)
export type HoldingDraft = {
  name: string;
  category: string;
  market: string;
  currency: string;
  value: number | null;
};

type Props = {
  onCancel?: () => void;
  onSave?: (payload: {
    portfolio: {
      cash_value: number | null;
      cash_currency: string | null;
    };
    holdings: HoldingDraft[];
  }) => void;
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

export function HoldingForm({ onCancel, onSave, saving }: Props) {
  const [rows, setRows] = useState<HoldingDraft[]>([{ ...EMPTY_ROW }]);
  const [cashCurrency, setCashCurrency] = useState<string | null>(null);
  const [cashValue, setCashValue] = useState<number | null>(null);

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
          <div className="text-sm font-semibold">现金（单独填写）</div>
          <div className="text-xs text-muted-foreground">
            现金是安全垫：这里先独立出来，后续也可改成 holdings 的一行。
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cashCurrency">现金币种</Label>
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
            <Label htmlFor="cashValue">现金金额</Label>
            <Input
              id="cashValue"
              placeholder="例如：5000"
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
            <div className="text-sm font-semibold">持仓条目</div>
            <div className="text-xs text-muted-foreground">
              普通表单：一行一行填。后续可替换为下拉选择与自动补全。
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
                <div className="text-sm font-medium">第 {idx + 1} 条</div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length === 1}
                >
                  删除
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`name-${idx}`}>名称</Label>
                  <Input
                    id={`name-${idx}`}
                    placeholder="VOO / AAPL / GOOG"
                    value={row.name}
                    onChange={(e) => updateRow(idx, { name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-${idx}`}>分类</Label>
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
                  <Label htmlFor={`market-${idx}`}>市场</Label>
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
                  <Label htmlFor={`currency-${idx}`}>币种</Label>
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
                  <Label htmlFor={`value-${idx}`}>市值/金额</Label>
                  <Input
                    id={`value-${idx}`}
                    placeholder="例如：12000"
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
          取消
        </Button>
        <Button type="button" onClick={handleSave}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        提示：category / market / currency 现在先用本地枚举
        Select。等你接数据库后，可以把选项从 Supabase 拉取或做映射，并为
        cash_currency 做枚举/映射。
      </div>
    </div>
  );
}

export default HoldingForm;
