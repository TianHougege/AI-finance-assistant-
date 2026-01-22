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
  id: string;
  createdAt: string;
  plannedTime: string;
  actionType: 'buy' | 'sell' | 'trim' | 'add' | 'dca' | 'resist';
  objectType: 'stock' | 'fund' | 'bond' | 'cash' | 'crypto' | 'other';
  objectName: string;
  amount: string;
};

function mapRowToDecisionItem(row: any): DecisionItem {
  return {
    id: String(row.id),
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

  return (
    <section className="space-y-4">
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
                <TableHead className="text-xs">Object name</TableHead>
                <TableHead className="w-20 text-xs text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                    <TableCell className="text-right">{item.amount}</TableCell>
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
