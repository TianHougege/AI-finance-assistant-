'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DecisionDialog from './decisionDialog';

type DecisionItem = {
  id: number;
  createdAt: string;
  plannedTime: string;
  actionType: 'buy' | 'sell' | 'trim' | 'add' | 'dca' | 'resist';
  objectType: 'stock' | 'fund' | 'bond' | 'cash' | 'crypto' | 'other';
  objectName: string;
  amount: string;
};

function mapRowToDecisionItem(row: any): DecisionItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    plannedTime: row.planned_time,
    actionType: row.action_type,
    objectType: row.object_type,
    objectName: row.object_name,
    amount: row.amount,
  };
}

const ACTION_COLORS: Record<string, string> = {
  buy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  add: 'bg-green-500/15 text-green-300 border-green-500/30',
  dca: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  sell: 'bg-red-500/15 text-red-300 border-red-500/30',
  trim: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  resist: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

const OBJECT_COLORS: Record<string, string> = {
  stock: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  fund: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  bond: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  cash: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  crypto: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  other: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function DecisionListSection() {
  const [items, setItems] = useState<DecisionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    async function loadDecisions() {
      try {
        const res = await fetch('/api/decisions');
        if (!res.ok) return;
        const rows = await res.json();
        setItems(rows.map((row: any) => mapRowToDecisionItem(row)));
      } catch (err) {
        console.error('Failed to load decisions', err);
      }
    }
    loadDecisions();
  }, []);

  const handleAddDecision = async (payload: {
    plannedTime: string;
    actionType: DecisionItem['actionType'];
    objectType: DecisionItem['objectType'];
    objectName: string;
    amount: string;
  }) => {
    const res = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    const raw = await res.json();
    setItems((prev) => [...prev, mapRowToDecisionItem(raw)]);
  };

  const handleDelete = async (item: DecisionItem) => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) return;
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setToastMsg('Deleted successfully');
      if ((globalThis as any).__decisionToastTimerRef) {
        clearTimeout((globalThis as any).__decisionToastTimerRef);
      }
      (globalThis as any).__decisionToastTimerRef = setTimeout(() => {
        setToastMsg('');
      }, 1800);
    } catch (err) {
      console.error('Failed to delete decision', err);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2">
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
            {toastMsg}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Decision Log</h1>
          <p className="text-sm text-slate-400 mt-1">
            Record every planned action before you trade. Stay disciplined.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          + New Decision
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 gap-0">
        <CardHeader className="pb-0">
          <CardTitle className="text-white">Planned Actions</CardTitle>
          <CardDescription className="text-slate-400">
            {items.length} decision{items.length !== 1 ? 's' : ''} logged
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 text-xs w-10">#</TableHead>
                <TableHead className="text-slate-400 text-xs w-28">Planned Date</TableHead>
                <TableHead className="text-slate-400 text-xs w-28">Action</TableHead>
                <TableHead className="text-slate-400 text-xs w-28">Asset Type</TableHead>
                <TableHead className="text-slate-400 text-xs">Name</TableHead>
                <TableHead className="text-slate-400 text-xs w-24">Amount</TableHead>
                <TableHead className="text-slate-400 text-xs w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No decisions yet. Click &quot;New Decision&quot; to add one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="border-slate-800/60 hover:bg-slate-800/40 transition-colors h-9"
                  >
                    <TableCell className="text-slate-500 text-xs py-1.5">{index + 1}</TableCell>
                    <TableCell className="text-slate-400 text-xs tabular-nums py-1.5">
                      {item.plannedTime}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0 border ${ACTION_COLORS[item.actionType] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}
                      >
                        {item.actionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0 border ${OBJECT_COLORS[item.objectType] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}
                      >
                        {item.objectType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-200 text-xs font-medium py-1.5">
                      {item.objectName}
                    </TableCell>
                    <TableCell className="text-slate-300 text-xs tabular-nums py-1.5">
                      {item.amount}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        className="h-6 px-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DecisionDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleAddDecision}
      />
    </section>
  );
}
