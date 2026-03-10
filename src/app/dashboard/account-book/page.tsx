'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

type AccountEntry = {
  id: string;
  created_at: string;
  text: string | null;
  source: string | null;
  ts: number | null;
  amount: number | null;
  merchant: string | null;
  category: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  食品: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  餐饮: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  交通: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  购物: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  娱乐: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  医疗: 'bg-red-500/15 text-red-300 border-red-500/30',
  住房: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  教育: 'bg-green-500/15 text-green-300 border-green-500/30',
  转账: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  其他: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

function getCategoryColor(category: string | null) {
  if (!category) return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    CATEGORY_COLORS[category] ??
    'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  );
}

function formatDate(ts: number | null, fallback: string): string {
  const d = ts ? new Date(ts * 1000) : new Date(fallback);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatAmount(amount: number | null) {
  if (amount === null || amount === undefined) return '—';
  const abs = Math.abs(amount);
  const formatted =
    '¥' +
    abs.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return amount < 0 ? `-${formatted}` : formatted;
}

const PAGE_SIZE = 50;

const emptyForm = {
  merchant: '',
  amount: '',
  category: '',
  text: '',
  source: '',
  date: '',
};

export default function AccountBookPage() {
  const [entries, setEntries] = useState<AccountEntry[]>([]);
  // allCategories is loaded once and never filtered away
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Add entry dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async (pg: number, cat: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(pg * PAGE_SIZE),
      });
      if (cat) params.set('category', cat);
      const res = await fetch(`/api/accountbook?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      setEntries(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      console.error('[account-book] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: also fetch all categories (no filter, limit=200)
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/accountbook?limit=200&offset=0');
        if (!res.ok) return;
        const json = await res.json();
        const cats = Array.from(
          new Set(
            (json.data ?? [])
              .map((e: AccountEntry) => e.category)
              .filter(Boolean)
          )
        ) as string[];
        setAllCategories(cats);
      } catch {}
    }
    loadCategories();
  }, []);

  useEffect(() => {
    fetchData(page, activeCategory);
  }, [page, activeCategory, fetchData]);

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.merchant?.includes(search) ||
          e.text?.includes(search) ||
          e.category?.includes(search)
      )
    : entries;

  const totalSpend = filtered.reduce((s, e) => s + Math.abs(e.amount ?? 0), 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const setField = (k: keyof typeof emptyForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const ts = form.date
        ? Math.floor(new Date(form.date).getTime() / 1000)
        : null;
      const res = await fetch('/api/accountbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: form.merchant,
          amount: form.amount !== '' ? Number(form.amount) : null,
          category: form.category,
          text: form.text,
          source: form.source || 'manual',
          ts,
        }),
      });
      if (!res.ok) return;
      const json = await res.json();
      // Prepend to list and update categories
      if (json.data) {
        setEntries((prev) => [json.data, ...prev]);
        setTotal((t) => t + 1);
        if (json.data.category && !allCategories.includes(json.data.category)) {
          setAllCategories((prev) => [...prev, json.data.category]);
        }
      }
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (e) {
      console.error('[account-book] submit error', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Book</h1>
          <p className="text-sm text-slate-400 mt-1">
            Daily spending records &amp; transaction history
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">
            Showing {filtered.length} records
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {'¥'}
            {totalSpend.toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Category chips + Add button on same row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveCategory(null);
              setPage(0);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              activeCategory === null
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(0);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialogOpen(true)}
          className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Entry
        </Button>
      </div>

      {/* Main table card */}
      <Card className="bg-slate-900 border-slate-800 gap-0">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Transactions</CardTitle>
              <CardDescription className="text-slate-400">
                {total} records total
              </CardDescription>
            </div>
            <Input
              placeholder="Search merchant / desc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm h-8"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 text-xs w-28">
                  Date
                </TableHead>
                <TableHead className="text-slate-400 text-xs">
                  Merchant
                </TableHead>
                <TableHead className="text-slate-400 text-xs">
                  Description
                </TableHead>
                <TableHead className="text-slate-400 text-xs w-24">
                  Category
                </TableHead>
                <TableHead className="text-slate-400 text-xs w-20">
                  Source
                </TableHead>
                <TableHead className="text-slate-400 text-xs text-right w-28">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-slate-800/60 hover:bg-slate-800/40 transition-colors h-9"
                  >
                    <TableCell className="text-slate-400 text-xs tabular-nums py-1.5">
                      {formatDate(entry.ts, entry.created_at)}
                    </TableCell>
                    <TableCell className="text-slate-200 text-xs font-medium py-1.5">
                      {entry.merchant ?? (
                        <span className="text-slate-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs max-w-xs truncate py-1.5">
                      {entry.text ?? <span className="text-slate-600">—</span>}
                    </TableCell>
                    <TableCell className="py-1.5">
                      {entry.category ? (
                        <Badge
                          variant="outline"
                          className={`text-[11px] px-2 py-0 border ${getCategoryColor(entry.category)}`}
                        >
                          {entry.category}
                        </Badge>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs py-1.5">
                      {entry.source ?? '—'}
                    </TableCell>
                    <TableCell
                      className={`text-right text-xs font-semibold tabular-nums py-1.5 ${
                        (entry.amount ?? 0) < 0
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatAmount(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Page {page + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 h-7 text-xs"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Entry</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Manually record a spending transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setField('date', e.target.value)}
                  className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Amount (negative = expense)</Label>
                <Input
                  type="number"
                  placeholder="-50"
                  value={form.amount}
                  onChange={(e) => setField('amount', e.target.value)}
                  className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Merchant</Label>
              <Input
                placeholder="e.g. Starbucks"
                value={form.merchant}
                onChange={(e) => setField('merchant', e.target.value)}
                className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Category</Label>
                <Input
                  placeholder="e.g. 餐饮"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Source</Label>
                <Input
                  placeholder="e.g. Alipay"
                  value={form.source}
                  onChange={(e) => setField('source', e.target.value)}
                  className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Description</Label>
              <Input
                placeholder="Optional note"
                value={form.text}
                onChange={(e) => setField('text', e.target.value)}
                className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDialogOpen(false);
                setForm(emptyForm);
              }}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
