'use client';

import { useState, useEffect } from 'react';

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
  targetWeight: string; // 目前是 "20"
};

type InvestmentPlanDTO = {
  target_rows: TargetRow[] | string; // 兼容后端可能返回 string 的情况
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

  // From GET /api/holding (null means "no snapshot yet")
  const cashValue = holdingComputed?.cash_value ?? 0;
  const holdingsValue = holdingComputed?.holdings_value ?? 0;

  const totalValue = Math.max(0, cashValue) + Math.max(0, holdingsValue);
  const cashPct01 = totalValue > 0 ? Math.max(0, cashValue) / totalValue : 0;

  // Cash safety label for the CardHeader (kept in Dashboard so layout is controllable)
  const level = (() => {
    if (cashPct01 >= 0.8) return { label: '很安全', color: '#16a34a' };
    if (cashPct01 >= 0.5) return { label: '安全', color: '#22c55e' };
    if (cashPct01 >= 0.3) return { label: '偏紧', color: '#f59e0b' };
    if (cashPct01 >= 0.1) return { label: '危险', color: '#ef4444' };
    return { label: '极危险', color: '#b91c1c' };
  })();

  useEffect(() => {
    fetchClientData();
    fetchHoldingSnapshot();
  }, []);

  async function fetchClientData() {
    try {
      const res = await fetch('/api/investment-plan', {
        method: 'GET',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(
          '[api/investment-plan] Failed to load plan:',
          text || res.statusText || res.status
        );
        return;
      }

      const data = (await res.json()) as InvestmentPlanDTO;
      const raw = data.target_rows;
      const rows =
        typeof raw === 'string'
          ? (JSON.parse(raw) as TargetRow[])
          : (raw as TargetRow[]);
      const mapped = rows.map((r) => ({
        category: r.name,
        weight: Number(r.targetWeight),
      }));
      setTargetAllocations(mapped);
    } catch (e) {
      console.error('[api/investment-plan] Request error:', e);
    }
  }

  async function handleSaveHoldings(snapshot: any) {
    // v0: verify the data pipeline; later we'll POST to Supabase
    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch('/api/holding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snapshot),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `保存失败（${res.status})`);
      }

      // Refresh dashboard data after saving
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
      const res = await fetch('/api/holding', {
        method: 'GET',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(
          '[api/holding] Failed to load data:',
          text || res.statusText || res.status
        );
        return;
      }
      const data = await res.json();
      const { portfolio, holdings, computed } = data;

      // Store for charts
      setHoldingComputed(computed ?? null);
      setHoldingRows(holdings ?? []);

      console.log('[api/holding] portfolio:', portfolio);
      console.log('[api/holding] holdings length:', (holdings ?? []).length);
      console.log('[api/holding] computed:', computed);

      return { portfolio, holdings, computed };
    } catch (e) {
      console.error('[api/holding] Request error:', e);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2">
      {/* Dashboard grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-20">
        {/* Left column (13/20) */}
        <div className="min-w-0 flex flex-col gap-3 lg:col-span-13">
          {/* Current Holdings */}
          <Card className="h-[360px] overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>现有持仓</CardTitle>
                  <CardDescription>
                    展示当前已持有资产的构成与占比。
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenHolding(true)}
                >
                  填写持仓
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3 flex-1">
              {/* IMPORTANT: ECharts needs a non-zero height. Control it here. */}
              <div className="min-w-0 flex-1 rounded-md -mt-2">
                <CurrentHoldingsTreemap holdings={holdingRows} height={278} />
              </div>
            </CardContent>
          </Card>

          {/* Target Holdings */}
          <Card className="h-[360px] overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>目标持仓</CardTitle>
              <CardDescription>展示长期目标资产配置</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              {/* IMPORTANT: ECharts needs a non-zero height. Control it here. */}
              <div className="min-w-0 h-60 rounded-md">
                <TargetHoldingsStackBar target={targetAllocations} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column (7/20) */}
        <div className="min-w-0 flex flex-col gap-3 lg:col-span-7">
          {/* Cash Flow */}
          <Card className="h-[360px] overflow-hidden flex flex-col">
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>现金流情况</CardTitle>
                  <CardDescription>现金占比与安全边际提示</CardDescription>
                </div>

                <div
                  className="text-xs font-medium"
                  style={{ color: level.color }}
                >
                  {level.label}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1 pb-3 flex-1">
              {/* IMPORTANT: ECharts needs a non-zero height. Control it here. */}
              <div className="min-w-0 flex-1 rounded-md">
                <CashFlowGauge
                  height={220}
                  cashValue={cashValue}
                  holdingsValue={holdingsValue}
                />
              </div>
            </CardContent>
          </Card>

          {/* Long-term Value Trend */}
          <Card className="h-[360px] overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>价值投资趋势</CardTitle>
              <CardDescription>5 / 10 / 20 年复利效果动画区域</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {/* IMPORTANT: ECharts needs a non-zero height. Control it here. */}
              <div className="min-w-0 h-60 rounded-md">
                <ValueTrendLine
                  principal={10000}
                  annualRate={0.07}
                  years={20}
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
      />
    </section>
  );
}
