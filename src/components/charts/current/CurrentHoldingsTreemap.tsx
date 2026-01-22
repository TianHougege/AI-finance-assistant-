'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export type HoldingRowForTreemap = {
  name: string | null;
  category?: string | null;
  value: number | string | null;
};

type Props = {
  holdings: HoldingRowForTreemap[];
  height?: number;
};

const toNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

function buildTreemapData(holdings: HoldingRowForTreemap[]) {
  // Group by category for nicer structure. If category missing, put into "Other".
  const groups = new Map<
    string,
    { name: string; children: Array<{ name: string; value: number }> }
  >();

  for (const h of holdings) {
    const rawName = (h?.name ?? '').trim();
    const name = rawName.length > 0 ? rawName : 'Unnamed';
    const category = (h?.category ?? '').trim() || 'Other';
    const value = toNumber(h?.value);

    if (!groups.has(category)) {
      groups.set(category, { name: category, children: [] });
    }

    // Hide zero/negative values to keep treemap clean
    if (value > 0) {
      groups.get(category)!.children.push({ name, value });
    }
  }

  // Convert to echarts treemap data
  return (
    Array.from(groups.values())
      .map((g) => ({
        name: g.name,
        children: g.children.sort((a, b) => b.value - a.value),
      }))
      // Remove empty groups
      .filter((g) => (g.children?.length ?? 0) > 0)
  );
}

export default function CurrentHoldingsTreemap({
  holdings,
  height = 260,
}: Props) {
  const data = React.useMemo(
    () => buildTreemapData(holdings ?? []),
    [holdings]
  );

  const option = React.useMemo(
    () => ({
      tooltip: {
        formatter: (info: any) => {
          const name = info?.name ?? '';
          const value = info?.value;
          // Show category path if available
          const path = (info?.treePathInfo ?? [])
            .map((p: any) => p?.name)
            .filter(Boolean)
            .slice(1)
            .join(' / ');
          const prefix = path ? `${path}<br/>` : '';
          return `${prefix}${name}: <b>${value}</b>`;
        },
      },
      series: [
        {
          type: 'treemap',
          data,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: '{b}',
            overflow: 'truncate',
          },
          upperLabel: {
            show: true,
            height: 20,
          },
          itemStyle: {
            borderColor: 'rgba(255,255,255,0.18)',
            borderWidth: 1,
            gapWidth: 2,
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 2,
              },
            },
            {
              itemStyle: {
                gapWidth: 2,
              },
            },
          ],
        },
      ],
    }),
    [data]
  );

  // Empty state
  if (!data.length) {
    return (
      <div
        className="h-full w-full rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        暂无持仓数据
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}
