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

// Mirrors the treemap's KNOWN_COLORS: [vibrant, dark]
type ColorPair = [string, string];

const KNOWN_COLORS: Record<string, ColorPair> = {
  etf: ['#818cf8', '#3730a3'],
  stock: ['#60a5fa', '#1e40af'],
  bond: ['#38bdf8', '#075985'],
  treasury: ['#34d399', '#065f46'],
  gold: ['#fbbf24', '#92400e'],
  crypto: ['#c084fc', '#6b21a8'],
  cash: ['#2dd4bf', '#134e4a'],
  deposit: ['#67e8f9', '#164e63'],
  other: ['#94a3b8', '#334155'],
};

const AUTO_PALETTE: ColorPair[] = [
  ['#f472b6', '#9d174d'],
  ['#fb923c', '#9a3412'],
  ['#a3e635', '#3f6212'],
  ['#4ade80', '#166534'],
  ['#e879f9', '#86198f'],
  ['#f87171', '#991b1b'],
  ['#facc15', '#854d0e'],
  ['#22d3ee', '#155e75'],
];

function hashCategory(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i);
  return Math.abs(h);
}

function getColors(category: string): ColorPair {
  const key = category.toLowerCase();
  return (
    KNOWN_COLORS[key] ?? AUTO_PALETTE[hashCategory(key) % AUTO_PALETTE.length]
  );
}

function makeGradient(c0: string, c1: string) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: c0 },
      { offset: 1, color: c1 },
    ],
  };
}

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
          overflow: 'truncate',
          width: 72,
          margin: 8,
          color: '#94a3b8',
          fontSize: 12,
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
          lineStyle: { color: '#1e293b', type: 'dashed' },
        },
        axisLabel: {
          show: true,
          color: '#64748b',
          fontSize: 11,
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
          barWidth: 16,
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(255,255,255,0.05)',
            borderRadius: [0, 6, 6, 0],
          },
          data: values,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: (params: any) => {
              const idx = Number(params?.dataIndex ?? 0);
              const cat = ordered[idx]?.category ?? '';
              const [c0, c1] = getColors(cat);
              return makeGradient(c0, c1);
            },
          },
          label: { show: false },
          emphasis: { focus: 'series' },
        },
      ],
    };
  }, [ordered]);

  return <Echart option={option} loading={loading} />;
}
