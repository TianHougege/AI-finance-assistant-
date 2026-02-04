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

const initialDecisions: DecisionItem[] = [];

export default function DecisionListSection() {
  const [items, setItems] = useState<DecisionItem[]>(initialDecisions);
  const [open, setOpen] = useState(false);

  // lightweight toast (no extra libs)
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    async function loadDecisions() {
      try {
        const res = await fetch('/api/decisions');
        if (!res.ok) {
          console.error('Failed to load decisions');
          return;
        }
        const rows = await res.json();

        const mapped: DecisionItem[] = rows.map((row: any) =>
          mapRowToDecisionItem(row)
        );
        setItems(mapped);
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
    if (!res.ok) {
      console.error('failed');
      return;
    }
    const raw = await res.json();
    const created = mapRowToDecisionItem(raw);
    setItems((prev) => [...prev, created]);
  };

  const handleDelete = async (item: DecisionItem) => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(
          'delete actions failed:',
          res.status,
          res.statusText,
          text
        );
        return;
      }

      // Update UI immediately after server confirms deletion
      setItems((prev) => prev.filter((x) => x.id !== item.id));

      // Show a small success toast (bottom-right)
      setToastMsg('Deleted successfully');
      if ((globalThis as any).__decisionToastTimerRef) {
        clearTimeout((globalThis as any).__decisionToastTimerRef);
      }
      (globalThis as any).__decisionToastTimerRef = setTimeout(() => {
        setToastMsg('');
      }, 1800);
    } catch (err) {
      console.error('Failed to delete actions', err);
    }
  };

  return (
    <section className="space-y-4">
      {toastMsg ? (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white shadow-md">
            {toastMsg}
          </div>
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Decision list</CardTitle>
          <CardDescription className="text-xs">
            Log each planned action here before you trade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              This table will show your pre-trade decisions.
            </p>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              + New decision
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-xs">#</TableHead>
                <TableHead className="w-[120px] text-xs">Time</TableHead>
                <TableHead className="w-[100px] text-xs">Action</TableHead>
                <TableHead className="w-[100px] text-xs">Object type</TableHead>
                <TableHead className="w-[100px] text-xs">Object name</TableHead>
                <TableHead className="w-20 text-xs">Amount</TableHead>
                <TableHead className="w-[90px] text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-xs text-muted-foreground"
                  >
                    No decisions yet. Click “New decision” to add one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.plannedTime}</TableCell>
                    <TableCell>{item.actionType}</TableCell>
                    <TableCell>{item.objectType}</TableCell>
                    <TableCell>{item.objectName}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleDelete(item)}>Delete</Button>
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
