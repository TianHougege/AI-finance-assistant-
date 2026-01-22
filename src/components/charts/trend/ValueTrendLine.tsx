'use client';

import { useMemo } from 'react';
import Echart from '@/components/charts/Echart';

export type ValueTrendLineProps = {
  /** Starting principal (e.g., 10000) */
  principal: number;
  /** Annual rate as a decimal (e.g., 0.07 for 7%) */
  annualRate: number;
  /** How many years to project (e.g., 20). Defaults to 20. */
  years?: number;
  /** Optional: show loading overlay */
  loading?: boolean;
};

function computeSeries(principal: number, annualRate: number, years: number) {
  // TODO: switch to monthly points later if you want smoother curve.
  // For v0, yearly points are enough and render fast.
  const x: string[] = [];
  const y: number[] = [];
  for (let t = 0; t <= years; t += 1) {
    x.push(String(t));
    const v = principal * Math.pow(1 + annualRate, t);
    // Keep it readable; format in tooltip/axis later if needed.
    y.push(Number(v.toFixed(2)));
  }
  return { x, y };
}

export default function ValueTrendLine({
  principal,
  annualRate,
  years = 20,
  loading = false,
}: ValueTrendLineProps) {
  const series = useMemo(
    () => computeSeries(principal, annualRate, years),
    [principal, annualRate, years]
  );

  const option = useMemo(
    () => ({
      // ---- Animation (v0: line draws in) ----
      animation: true,
      animationDuration: 1200,
      animationEasing: 'cubicOut',

      // ---- Layout ----
      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },

      // ---- Axes ----
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: series.x,
        axisLabel: { show: true },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { show: true },
        splitLine: { show: true },
      },

      // ---- Tooltip ----
      tooltip: {
        trigger: 'axis',
      },

      // ---- Series ----
      series: [
        {
          name: 'Projected Value',
          type: 'line',
          data: series.y,
          showSymbol: false,
          smooth: true,
          // Optional: subtle fill feels more “product”.
          areaStyle: {},
        },
      ],
    }),
    [series.x, series.y]
  );

  return <Echart option={option} loading={loading} />;
}
