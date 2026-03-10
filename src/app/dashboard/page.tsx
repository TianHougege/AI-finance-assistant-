'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Plus } from 'lucide-react';

import HoldingDrawer from '@/components/holdings/holding-drawer';
import ValueTrendLine from '@/components/charts/trend/ValueTrendLine';
import TargetHoldingsStackBar from '@/components/charts/target/TargetHoldingsStackBar';
import CashFlowGauge from '@/components/charts/cash/CashBufferBullet';
import CurrentHoldingsTreemap from '@/components/charts/current/CurrentHoldingsTreemap';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TargetAllocation } from '@/components/charts/target/TargetHoldingsStackBar';

type TargetRow = {
  id: string;
  name: string;
  targetWeight: string;
};

type InvestmentPlanDTO = {
  target_rows: TargetRow[] | string;
};

export default function DashboardPage() {
  const [openHolding, setOpenHolding] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [targetAllocations, setTargetAllocations] = useState<
    TargetAllocation[]
  >([]);

  const [holdingComputed, setHoldingComputed] = useState<{
    cash_value: number;
    holdings_value: number;
    total_value: number;
    cash_ratio: number;
  } | null>(null);

  const [holdingRows, setHoldingRows] = useState<any[]>([]);
  const [holdingPortfolio, setHoldingPortfolio] = useState<{
    cash_value: number;
    cash_currency: string | null;
  } | null>(null);

  const cashValue = holdingComputed?.cash_value ?? 0;
  const holdingsValue = holdingComputed?.holdings_value ?? 0;
  const totalValue = Math.max(0, cashValue) + Math.max(0, holdingsValue);
  const cashPct01 = totalValue > 0 ? Math.max(0, cashValue) / totalValue : 0;

  const level = (() => {
    if (cashPct01 >= 0.8)
      return {
        label: 'Very Safe',
        color: '#16a34a',
        bgColor: 'rgba(22,163,74,0.15)',
        hint: "Cash buffer is strong. You're well positioned for opportunities.",
      };
    if (cashPct01 >= 0.5)
      return {
        label: 'Safe',
        color: '#22c55e',
        bgColor: 'rgba(34,197,94,0.15)',
        hint: 'Cash buffer is healthy. No immediate action needed.',
      };
    if (cashPct01 >= 0.3)
      return {
        label: 'Tight',
        color: '#f59e0b',
        bgColor: 'rgba(245,158,11,0.15)',
        hint: 'Cash buffer is getting thin. Consider reducing new positions.',
      };
    if (cashPct01 >= 0.1)
      return {
        label: 'Dangerous',
        color: '#ef4444',
        bgColor: 'rgba(239,68,68,0.15)',
        hint: 'Cash buffer is low. Pause new investments and restore cash.',
      };
    return {
      label: 'Critical',
      color: '#b91c1c',
      bgColor: 'rgba(185,28,28,0.15)',
      hint: 'Almost no cash buffer. Any volatility could force your hand.',
    };
  })();

  useEffect(() => {
    fetchClientData();
    fetchHoldingSnapshot();
  }, []);

  async function fetchClientData() {
    try {
      const res = await fetch('/api/investment-plan', { method: 'GET' });
      if (!res.ok) return;
      const data = (await res.json()) as InvestmentPlanDTO;
      const raw = data.target_rows;
      const rows =
        typeof raw === 'string'
          ? (JSON.parse(raw) as TargetRow[])
          : (raw as TargetRow[]);
      setTargetAllocations(
        rows.map((r) => ({ category: r.name, weight: Number(r.targetWeight) }))
      );
    } catch (e) {
      console.error('[api/investment-plan] Request error:', e);
    }
  }

  async function handleSaveHoldings(snapshot: any) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/holding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `保存失败（${res.status})`);
      }
      await fetchHoldingSnapshot();
      setOpenHolding(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function fetchHoldingSnapshot() {
    try {
      const res = await fetch('/api/holding', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      const { holdings, computed, portfolio } = data;
      setHoldingComputed(computed ?? null);
      setHoldingRows(holdings ?? []);
      setHoldingPortfolio(portfolio ?? null);
    } catch (e) {
      console.error('[api/holding] Request error:', e);
    }
  }

  const fmt = (n: number) =>
    '$' +
    n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back. Your long-term strategy is on track.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Total Net Worth</p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {fmt(totalValue)}
          </p>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-20">
        {/* Left column (13/20) */}
        <div className="min-w-0 flex flex-col gap-3 lg:col-span-13">
          {/* Current Holdings */}
          <Card className="h-[380px] overflow-hidden flex flex-col bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-white">Current Holdings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Asset Allocation Breakdown
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white shrink-0"
                  onClick={() => setOpenHolding(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3 flex-1">
              <div className="min-w-0 flex-1 rounded-md -mt-2">
                <CurrentHoldingsTreemap holdings={holdingRows} height={295} />
              </div>
            </CardContent>
          </Card>

          {/* Target Allocation */}
          <Card className="h-[360px] overflow-hidden flex flex-col bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Target Allocation</CardTitle>
              <CardDescription className="text-slate-400">
                Long-term Goals vs Reality
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="min-w-0 h-60 rounded-md">
                <TargetHoldingsStackBar target={targetAllocations} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column (7/20) */}
        <div className="min-w-0 flex flex-col gap-3 lg:col-span-7">
          {/* Cash Flow */}
          <Card className="h-[380px] overflow-hidden flex flex-col bg-slate-900 border-slate-800">
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Cash Flow</CardTitle>
                  <CardDescription className="text-slate-400">
                    Safety Margin &amp; Liquidity
                  </CardDescription>
                </div>
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0"
                  style={{ backgroundColor: level.bgColor, color: level.color }}
                >
                  <CheckCircle className="h-3 w-3" />
                  {level.label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-3 flex-1 flex flex-col">
              <div className="min-w-0 rounded-md">
                <CashFlowGauge
                  height={165}
                  cashValue={cashValue}
                  holdingsValue={holdingsValue}
                />
              </div>
              <div className="mt-1 space-y-1.5 px-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Cash Balance</span>
                  <span className="font-semibold text-white">
                    {fmt(cashValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Invested</span>
                  <span className="font-semibold text-slate-300">
                    {fmt(holdingsValue)}
                  </span>
                </div>
              </div>
              <p className="mt-2 px-1 text-xs text-slate-500 leading-snug">
                {level.hint}
              </p>
            </CardContent>
          </Card>

          {/* Compound Growth */}
          <Card className="h-[360px] overflow-hidden flex flex-col bg-slate-900 border-slate-800">
            <CardHeader className="pb-1">
              <CardTitle className="text-white">Compound Growth</CardTitle>
              <CardDescription className="text-slate-400">
                20-Year Projection
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-1">
              <div className="min-w-0 h-[270px] rounded-md">
                <ValueTrendLine
                  principal={totalValue > 0 ? totalValue : 10000}
                  annualRate={0.07}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <HoldingDrawer
        open={openHolding}
        onOpenChange={setOpenHolding}
        onSave={handleSaveHoldings}
        saving={saving}
        initialData={
          holdingPortfolio
            ? {
                portfolio: {
                  cash_value: holdingPortfolio.cash_value,
                  cash_currency: holdingPortfolio.cash_currency,
                },
                holdings: holdingRows.map((h) => ({
                  name: h.name ?? '',
                  category: h.category ?? '',
                  market: h.market ?? '',
                  currency: h.currency ?? '',
                  value: h.value ?? null,
                })),
              }
            : undefined
        }
      />
    </section>
  );
}
