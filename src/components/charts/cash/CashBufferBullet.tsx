'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Client-only to avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export type CashSafetyLevel = {
  key: 'excellent' | 'good' | 'caution' | 'danger' | 'critical';
  label: string;
  hint: string;
  color: string;
};

export type CashFlowGaugeProps = {
  /** Cash amount (no FX conversion in v0). */
  cashValue?: number;
  /** Current holdings total value (no FX conversion in v0). */
  holdingsValue?: number;
  /** Optional height for the chart container. */
  height?: number;
  /** Optional title shown above the gauge (UI-only). */
  title?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatPct01(v01: number) {
  return `${Math.round(v01 * 100)}%`;
}

function getCashLevel(pct01: number): CashSafetyLevel {
  // Thresholds requested: 80%, 50%, 30%, 10%
  if (pct01 >= 0.8) {
    return {
      key: 'excellent',
      label: '很安全',
      hint: '现金缓冲充足，可从容应对波动/机会。',
      color: '#389e0d',
    };
  }
  if (pct01 >= 0.5) {
    return {
      key: 'good',
      label: '安全',
      hint: '现金缓冲较稳，注意别让持仓过快膨胀。',
      color: '#52c41a',
    };
  }
  if (pct01 >= 0.3) {
    return {
      key: 'caution',
      label: '偏紧',
      hint: '现金缓冲开始变薄，谨慎加仓，优先补现金。',
      color: '#faad14',
    };
  }
  if (pct01 >= 0.1) {
    return {
      key: 'danger',
      label: '危险',
      hint: '现金缓冲很薄，建议暂停加仓/先恢复现金比例。',
      color: '#ff4d4f',
    };
  }
  return {
    key: 'critical',
    label: '极危险',
    hint: '几乎没有现金缓冲，任何波动都可能被迫行动。',
    color: '#a8071a',
  };
}

/**
 * Cash flow safety gauge (static framework).
 * Ratio = cash / (cash + holdings). No FX conversion in v0.
 */
export function CashFlowGauge({
  cashValue = 5000,
  holdingsValue = 10000,
  height = 220,
}: CashFlowGaugeProps) {
  const total = Math.max(0, cashValue) + Math.max(0, holdingsValue);
  const pct01 = total > 0 ? clamp(Math.max(0, cashValue) / total, 0, 1) : 0;
  const level = getCashLevel(pct01);

  const option = React.useMemo(() => {
    // Colored arcs by threshold (0..1)
    const axisSegments: [number, string][] = [
      [0.1, '#a8071a'],
      [0.3, '#ff4d4f'],
      [0.5, '#faad14'],
      [0.8, '#52c41a'],
      [1, '#389e0d'],
    ];

    return {
      animation: true,
      animationDuration: 700,
      animationEasing: 'cubicOut',

      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          splitNumber: 5,

          axisLine: {
            lineStyle: {
              width: 14,
              color: axisSegments.map(([p, c]) => [p, c]),
            },
          },

          pointer: {
            length: '58%',
            width: 6,
            itemStyle: { color: level.color },
          },

          axisTick: {
            show: true,
            distance: -14,
            length: 6,
            lineStyle: { opacity: 0.25 },
          },
          splitLine: {
            show: true,
            distance: -14,
            length: 12,
            lineStyle: { opacity: 0.25 },
          },
          axisLabel: {
            show: true,
            distance: 18,
            formatter: (v: number) => `${v}%`,
          },

          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            formatter: (v: number) => `${Math.round(v)}%`,
            offsetCenter: [0, '10%'],
            fontSize: 26,
            fontWeight: 700,
          },

          data: [
            {
              value: Math.round(pct01 * 100),
              name: level.label,
            },
          ],
        },
      ],

      // Extra annotation under gauge
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '82%',
          style: {
            text: `现金: ${cashValue}  |  持仓: ${holdingsValue}  |  占比: ${formatPct01(
              pct01
            )}`,
            fontSize: 12,
            opacity: 0.7,
          },
        },
      ],
    };
  }, [cashValue, holdingsValue, pct01, level.color, level.label]);

  return (
    <div className="w-full">
      <div className="rounded-md" style={{ height }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      <div className="mt-2 text-xs opacity-80">{level.hint}</div>
    </div>
  );
}

// Keep a default export for convenience in imports.
export default CashFlowGauge;
