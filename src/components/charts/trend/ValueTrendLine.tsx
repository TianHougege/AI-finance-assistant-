'use client';

import { useMemo, useState } from 'react';
import Echart from '@/components/charts/Echart';

export type ValueTrendLineProps = {
  principal: number;
  annualRate: number;
  years?: number;
  loading?: boolean;
};

const BASE_YEAR = new Date().getFullYear();

function computeSeries(principal: number, annualRate: number, years: number) {
  const x: string[] = [];
  const y: number[] = [];
  for (let t = 0; t <= years; t += 1) {
    x.push(String(BASE_YEAR + t));
    y.push(Number((principal * Math.pow(1 + annualRate, t)).toFixed(2)));
  }
  return { x, y };
}

const PERIODS = [
  { label: '5Y', years: 5 },
  { label: '10Y', years: 10 },
  { label: '20Y', years: 20 },
];

export default function ValueTrendLine({
  principal,
  annualRate,
  loading = false,
}: ValueTrendLineProps) {
  const [selectedYears, setSelectedYears] = useState(20);

  const series = useMemo(
    () => computeSeries(principal, annualRate, selectedYears),
    [principal, annualRate, selectedYears]
  );

  const option = useMemo(
    () => ({
      animation: true,
      animationDuration: 1200,
      animationEasing: 'cubicOut',

      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },

      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: series.x,
        axisLabel: {
          show: true,
          color: '#64748b',
          fontSize: 11,
          interval: Math.floor(selectedYears / 4) - 1,
        },
        axisLine: { lineStyle: { color: '#1e293b' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: false,
        axisLabel: {
          show: true,
          color: '#64748b',
          fontSize: 11,
          formatter: (v: number) => {
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return String(v);
          },
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#1e293b', type: 'dashed' },
        },
      },

      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const val = Number(p?.value ?? 0);
          return `${p?.axisValue}<br/><b>$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b>`;
        },
      },

      series: [
        {
          name: 'Projected Value',
          type: 'line',
          data: series.y,
          showSymbol: false,
          smooth: true,
          lineStyle: { color: '#818cf8', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(129,140,248,0.35)' },
                { offset: 1, color: 'rgba(129,140,248,0.02)' },
              ],
            },
          },
        },
      ],
    }),
    [series.x, series.y, selectedYears]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Period tabs */}
      <div className="flex gap-1 mb-2">
        {PERIODS.map((p) => (
          <button
            key={p.label}
            onClick={() => setSelectedYears(p.years)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedYears === p.years
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <Echart option={option} loading={loading} />
      </div>
    </div>
  );
}
