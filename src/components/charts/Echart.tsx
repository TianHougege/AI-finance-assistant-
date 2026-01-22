'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';

/**
 * EChart “player” component
 * - Solves Next.js SSR issues by dynamically importing echarts-for-react (ssr:false)
 * - Unifies common props (option, loading, sizing)
 *
 * Hint-mode notes:
 * - Keep business-specific option building in separate chart components.
 * - This wrapper only renders a given `option`.
 */

// Dynamic import to avoid `window is not defined` during SSR
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export type EchartPlayerProps = {
  /** ECharts option object (build this in each chart component) */
  option: unknown;
  /** Optional: show built-in loading overlay */
  loading?: boolean;
  /** Optional sizing: usually set height/width to 100% and control via parent div */
  style?: CSSProperties;
  className?: string;

  /**
   * Optional advanced hooks (use later if needed)
   * TODO: only add/enable these when you actually need them.
   */
  // onEvents?: Record<string, (params: unknown) => void>;
  // opts?: { renderer?: 'canvas' | 'svg'; devicePixelRatio?: number };
  // theme?: string | object;

  /** Control update behavior */
  notMerge?: boolean;
  lazyUpdate?: boolean;
};

export default function Echart({
  option,
  loading = false,
  style,
  className,
  notMerge = true,
  lazyUpdate = true,
}: EchartPlayerProps) {
  return (
    <ReactECharts
      option={option as any}
      showLoading={loading}
      notMerge={notMerge}
      lazyUpdate={lazyUpdate}
      /**
       * IMPORTANT: ECharts needs a non-zero height.
       * Best practice: parent wrapper sets a fixed height (e.g. h-48),
       * and we set 100% here.
       */
      style={{ width: '100%', height: '100%', ...style }}
      className={className}
    />
  );
}
