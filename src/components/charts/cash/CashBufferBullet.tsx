'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export type CashFlowGaugeProps = {
  cashValue?: number;
  holdingsValue?: number;
  height?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function CashFlowGauge({
  cashValue = 5000,
  holdingsValue = 10000,
  height = 195,
}: CashFlowGaugeProps) {
  const total = Math.max(0, cashValue) + Math.max(0, holdingsValue);
  const pct01 = total > 0 ? clamp(Math.max(0, cashValue) / total, 0, 1) : 0;

  const option = React.useMemo(() => {
    // Tailwind 600-level: visible & rich, matching treemap hue family
    const axisSegments: [number, string][] = [
      [0.1, '#e11d48'],  // rose-600
      [0.3, '#dc2626'],  // red-600
      [0.5, '#d97706'],  // amber-600
      [0.8, '#16a34a'],  // green-600
      [1,   '#0d9488'],  // teal-600
    ];

    const sharedGaugeProps = {
      center: ['50%', '62%'] as [string, string],
      radius: '88%',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
    };

    return {
      animation: true,
      animationDuration: 700,
      animationEasing: 'cubicOut',

      series: [
        // ── Layer 1: dim background track ──────────────────────────
        {
          type: 'gauge',
          ...sharedGaugeProps,
          splitNumber: 0,
          axisLine: {
            lineStyle: {
              width: 16,
              color: [[1, 'rgba(255,255,255,0.06)']],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          title: { show: false },
          detail: { show: false },
          data: [{ value: 0 }],
        },

        // ── Layer 2: main colored gauge ─────────────────────────────
        {
          type: 'gauge',
          ...sharedGaugeProps,
          splitNumber: 5,

          axisLine: {
            lineStyle: {
              width: 12,
              shadowBlur: 8,
              shadowColor: 'rgba(0,0,0,0.5)',
              color: axisSegments.map(([p, c]) => [p, c]),
            },
          },

          pointer: {
            length: '60%',
            width: 4,
            itemStyle: {
              color: 'auto',
              shadowBlur: 14,
              shadowColor: 'rgba(255,255,255,0.35)',
            },
          },

          axisTick: {
            show: true,
            distance: -12,
            length: 4,
            lineStyle: { color: 'rgba(255,255,255,0.18)', width: 1 },
          },
          splitLine: {
            show: true,
            distance: -12,
            length: 9,
            lineStyle: { color: 'rgba(255,255,255,0.22)', width: 1.5 },
          },
          axisLabel: {
            show: true,
            distance: 18,
            color: '#64748b',
            fontSize: 10,
            formatter: (v: number) => `${v}%`,
          },

          title: {
            show: true,
            offsetCenter: [0, '58%'],
            fontSize: 11,
            color: '#64748b',
            fontWeight: 400,
          },
          detail: {
            valueAnimation: true,
            formatter: (v: number) => `${Math.round(v)}%`,
            offsetCenter: [0, '12%'],
            fontSize: 28,
            fontWeight: 700,
            color: '#e2e8f0',
            shadowBlur: 6,
            shadowColor: 'rgba(255,255,255,0.15)',
          },

          data: [{ value: Math.round(pct01 * 100), name: 'Safety Margin' }],
        },

        // ── Layer 3: center hub dot ─────────────────────────────────
        {
          type: 'gauge',
          ...sharedGaugeProps,
          splitNumber: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          title: { show: false },
          detail: { show: false },
          data: [{ value: 0 }],
          // hub rendered via markPoint workaround — skip; the pointer base handles it
        },
      ],
    };
  }, [pct01]);

  return (
    <div className="w-full" style={{ height }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}

export default CashFlowGauge;
