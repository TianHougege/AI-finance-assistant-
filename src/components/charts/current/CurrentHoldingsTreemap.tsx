'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

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

// [vibrant, dark] — diagonal gradient top-left(vibrant) → bottom-right(dark)
type ColorPair = [string, string];

const KNOWN_COLORS: Record<string, ColorPair> = {
  etf:      ['#818cf8', '#3730a3'],  // indigo
  stock:    ['#60a5fa', '#1e40af'],  // blue
  bond:     ['#38bdf8', '#075985'],  // sky
  treasury: ['#34d399', '#065f46'],  // emerald
  gold:     ['#fbbf24', '#92400e'],  // amber
  crypto:   ['#c084fc', '#6b21a8'],  // purple
  cash:     ['#2dd4bf', '#134e4a'],  // teal
  deposit:  ['#67e8f9', '#164e63'],  // cyan
  other:    ['#94a3b8', '#334155'],  // slate
};

const AUTO_PALETTE: ColorPair[] = [
  ['#f472b6', '#9d174d'],  // pink
  ['#fb923c', '#9a3412'],  // orange
  ['#a3e635', '#3f6212'],  // lime
  ['#4ade80', '#166534'],  // green
  ['#e879f9', '#86198f'],  // fuchsia
  ['#f87171', '#991b1b'],  // red
  ['#facc15', '#854d0e'],  // yellow
  ['#22d3ee', '#155e75'],  // cyan-alt
];

function hashCategory(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
  }
  return Math.abs(h);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function getColors(category: string): ColorPair {
  const key = category.toLowerCase();
  return KNOWN_COLORS[key] ?? AUTO_PALETTE[hashCategory(key) % AUTO_PALETTE.length];
}

function makeGradient(c0: string, c1: string) {
  return {
    type: 'linear' as const,
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: c0 },
      { offset: 1, color: c1 },
    ],
  };
}

function getItemStyle(c: ColorPair) {
  return {
    color: makeGradient(c[0], c[1]),
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: hexToRgba(c[0], 0.35),
  };
}

function getEmphasisItemStyle(c: ColorPair) {
  return {
    color: makeGradient(lightenHex(c[0], 0.25), lightenHex(c[1], 0.18)),
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowBlur: 22,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: hexToRgba(c[0], 0.6),
  };
}

function buildTreemapData(holdings: HoldingRowForTreemap[]) {
  const groups = new Map<
    string,
    { name: string; children: Array<{ name: string; value: number }> }
  >();

  let totalValue = 0;
  for (const h of holdings) {
    const v = toNumber(h?.value);
    if (v > 0) totalValue += v;
  }

  for (const h of holdings) {
    const rawName = (h?.name ?? '').trim();
    const name = rawName.length > 0 ? rawName : 'Unnamed';
    const category = (h?.category ?? '').trim() || 'Other';
    const value = toNumber(h?.value);

    if (!groups.has(category)) {
      groups.set(category, { name: category, children: [] });
    }
    if (value > 0) {
      groups.get(category)!.children.push({ name, value });
    }
  }

  return Array.from(groups.values())
    .map((g) => {
      const colors = getColors(g.name);
      return {
        name: g.name,
        itemStyle: getItemStyle(colors),
        emphasis: { itemStyle: getEmphasisItemStyle(colors) },
        children: g.children
          .sort((a, b) => b.value - a.value)
          .map((c) => ({
            name: c.name,
            value: c.value,
            percent: totalValue > 0 ? (c.value / totalValue * 100).toFixed(1) : '0',
          })),
      };
    })
    .filter((g) => (g.children?.length ?? 0) > 0);
}

export default function CurrentHoldingsTreemap({
  holdings,
  height = 260,
}: Props) {
  const data = React.useMemo(
    () => buildTreemapData(holdings ?? []),
    [holdings],
  );

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    const inst = chartRef.current?.getEchartsInstance?.();
    if (!inst) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => inst.resize());
    });
  }, [data.length, height]);

  React.useEffect(() => {
    const el = containerRef.current;
    const inst = chartRef.current?.getEchartsInstance?.();
    if (!el || !inst || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      try { inst.resize(); } catch {}
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const option = React.useMemo(
    () => ({
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (info: any) => {
          if (!info?.data) return '';
          const node = info.data;
          if (node?.children) return `<b style="color:#cbd5e1">${info.name}</b>`;
          const path = (info?.treePathInfo ?? [])
            .map((p: any) => p?.name)
            .filter(Boolean)
            .slice(1)
            .join(' / ');
          const prefix = path
            ? `<span style="color:#64748b;font-size:11px">${path}</span><br/>`
            : '';
          return `${prefix}<b>${info.name}</b>: $${Number(info.value).toLocaleString()} <span style="color:#94a3b8">(${node.percent}%)</span>`;
        },
      },
      series: [
        {
          type: 'treemap',
          bottom: 0, top: 0, left: 0, right: 0,
          data,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            align: 'center' as const,
            verticalAlign: 'middle' as const,
            formatter: (params: any) => {
              const node = params.data;
              const w = params.rect?.width ?? 0;
              const h = params.rect?.height ?? 0;
              if (w > 80 && h > 52) {
                return `{name|${params.name}}\n{pct|${node.percent ?? ''}%}`;
              }
              return `{name|${params.name}}`;
            },
            rich: {
              name: {
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                textShadowBlur: 6,
                textShadowColor: 'rgba(0,0,0,0.55)',
                lineHeight: 18,
              },
              pct: {
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                fontWeight: 400,
                lineHeight: 16,
              },
            },
            overflow: 'truncate',
          },
          upperLabel: { show: false },
          itemStyle: {
            borderWidth: 0,
            gapWidth: 3,
            borderColor: 'transparent',
            borderRadius: 8,
          },
          emphasis: {
            focus: 'self' as const,
            scale: true,
            scaleSize: 5,
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 3,
                borderColor: 'transparent',
                borderRadius: 8,
              },
            },
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 3,
                borderColor: 'transparent',
                borderRadius: 8,
              },
            },
          ],
        },
      ],
    }),
    [data],
  );

  const chartKey = React.useMemo(() => {
    const signature = data
      .map((g: any) => `${g.name}:${(g.children ?? []).length}`)
      .join('|');
    return `${data.length}-${holdings?.length ?? 0}-${signature}`;
  }, [data, holdings]);

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
      style={{ height: `${height}px`, borderRadius: 8, overflow: 'hidden' }}
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