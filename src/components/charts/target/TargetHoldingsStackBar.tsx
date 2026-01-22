'use client';

import { useMemo } from 'react';
import Echart from '@/components/charts/Echart';

/**
 * Target Holdings Chart (V0)
 * - Visual: 100% horizontal stacked bar
 * - Great fit for a wide rectangular card
 *
 * Data idea:
 * - Pull target allocation from InvestmentPlan (e.g., by category)
 * - Convert to weights that sum to 1 (or 100)
 */

export type TargetAllocation = {
  /** e.g., 'Stock', 'Bond', 'Gold', 'Cash' */
  category: string;
  /** weight as decimal (0~1) OR percent (0~100). We'll normalize. */
  weight: number;
};

export type TargetHoldingsStackBarProps = {
  /**
   * TODO: feed this from InvestmentPlan.
   * Example: [{ category:'Stock', weight:0.6 }, { category:'Bond', weight:0.3 }, ...]
   */
  target?: TargetAllocation[];
  loading?: boolean;
  /** Optional: lock category order for consistent legend */
  categoryOrder?: string[];
};

const DEFAULT_TARGET: TargetAllocation[] = [
  { category: 'Stock', weight: 60 },
  { category: 'Bond', weight: 30 },
  { category: 'Gold', weight: 10 },
];

// 10-color palette for up to ~10 segments; will cycle if more.
const PALETTE = [
  '#5470C6',
  '#91CC75',
  '#FAC858',
  '#EE6666',
  '#73C0DE',
  '#3BA272',
  '#FC8452',
  '#9A60B4',
  '#EA7CCC',
  '#2F4554',
];

function normalize(target: TargetAllocation[]) {
  // Accept either 0~1 or 0~100; normalize to 0~100 for the bar.
  const weights = target.map((t) => Number(t.weight) || 0);
  const max = Math.max(...weights);
  const asPercent = max <= 1.0000001 ? weights.map((w) => w * 100) : weights;
  const sum = asPercent.reduce((a, b) => a + b, 0);
  if (sum <= 0) return target.map((t) => ({ ...t, weight: 0 }));

  // Normalize to 100 exactly (helps stacked bar look clean)
  return target.map((t, idx) => ({
    category: t.category,
    weight: (asPercent[idx] / sum) * 100,
  }));
}

export default function TargetHoldingsStackBar({
  target,
  loading = false,
  categoryOrder,
}: TargetHoldingsStackBarProps) {
  const normalized = useMemo(
    () => normalize(target?.length ? target : DEFAULT_TARGET),
    [target]
  );

  const ordered = useMemo(() => {
    if (!categoryOrder?.length) return normalized;
    const map = new Map(normalized.map((x) => [x.category, x.weight]));
    return categoryOrder
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, weight: map.get(c) ?? 0 }));
  }, [normalized, categoryOrder]);

  const option = useMemo(() => {
    const categories = ordered.map((x) => x.category);
    const values = ordered.map((x) => Number(x.weight.toFixed(2)));

    const maxVal = Math.max(0, ...values);
    const axisMax = maxVal > 0 ? Math.ceil(maxVal * 1.1) : 100;

    return {
      animation: true,
      animationDuration: 700,
      animationEasing: 'cubicOut',

      grid: { left: 28, right: 12, top: 8, bottom: 8, containLabel: true },

      yAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          // Leave room for longer Chinese names
          overflow: 'truncate',
          width: 72,
          margin: 2,
        },
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: axisMax,
        splitNumber: 5,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', opacity: 0.35 },
        },
        axisLabel: {
          show: true,
          formatter: '{value}%',
        },
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const name = p?.name ?? '';
          const val = p?.value ?? 0;
          return `${name}: ${val}%`;
        },
      },

      series: [
        {
          name: 'Target',
          type: 'bar',
          barWidth: 18,
          data: values,
          itemStyle: {
            color: (params: any) => {
              const idx = Number(params?.dataIndex ?? 0);
              return PALETTE[idx % PALETTE.length];
            },
          },
          label: { show: true, position: 'right', formatter: '{c}%' },
          emphasis: { focus: 'series' },
        },
      ],
    };
  }, [ordered]);

  return <Echart option={option} loading={loading} />;
}
