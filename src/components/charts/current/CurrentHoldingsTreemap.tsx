'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Avoid SSR issues
const ReactECharts: any = dynamic(() => import('echarts-for-react'), {
  ssr: false,
});

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

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const chartRef = React.useRef<any>(null);

  // Resize when height/data changes (wait 2 frames so DOM height is applied)
  React.useEffect(() => {
    const inst = chartRef.current?.getEchartsInstance?.();
    if (!inst) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => inst.resize());
    });
  }, [data.length, height]);

  // Also observe container size changes (more reliable than window resize)
  React.useEffect(() => {
    const el = containerRef.current;
    const inst = chartRef.current?.getEchartsInstance?.();
    if (!el || !inst || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      try {
        inst.resize();
      } catch {}
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const option = React.useMemo(
    () => ({
      tooltip: {
        formatter: (info: any) => {
          // In some edge cases (e.g., during auth hydration), ECharts may dispatch events
          // while the series data is being replaced. Guard against missing params.
          if (!info) return '';

          // Prefer `info.data` for treemap nodes (leaf vs group). Group nodes can have `children`.
          const node = info?.data;
          if (!node) return '';

          const name = String(info?.name ?? '');
          const value = info?.value;

          // If this is a group node (category), keep tooltip minimal to avoid internal param issues.
          if (node?.children) {
            return `<b>${name}</b>`;
          }

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
          bottom: 30,
          top: 0,
          left: 0,
          right: 0,
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
            height: 14,
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

  const chartKey = React.useMemo(() => {
    // Force remount when treemap data changes to avoid stale event dispatchers
    // referencing old data during rapid auth/data hydration.
    const signature = data
      .map((g: any) => `${g.name}:${(g.children ?? []).length}`)
      .join('|');
    return `${data.length}-${holdings?.length ?? 0}-${signature}`;
  }, [data, holdings]);

  // Empty state
  if (!data.length) {
    return (
      <div
        ref={containerRef}
        data-treemap-wrapper
        className="h-full w-full rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        暂无持仓数据
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-treemap-wrapper
      style={{ height: `${height}px` }}
    >
      <ReactECharts
        ref={chartRef}
        key={`${chartKey}-${height}`}
        option={option}
        style={{ height: `${height}px`, width: '100%' }}
        notMerge
        lazyUpdate
        autoResize
      />
    </div>
  );
}
