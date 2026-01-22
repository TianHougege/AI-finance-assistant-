import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type HoldingRow = {
  id: string;
  name: string;
  category:
    | 'stock'
    | 'etf'
    | 'bond'
    | 'cash'
    | 'gold'
    | 'crypto'
    | 'real_estate'
    | 'other';
  market: 'US' | 'CN' | 'HK' | 'Global' | 'Other';
  currency: 'USD' | 'CNY' | 'HKD' | 'JPY' | 'Other';
  value: number;
};

const demoRows: HoldingRow[] = [
  {
    id: 'row-1',
    name: 'VOO',
    category: 'etf',
    market: 'US',
    currency: 'USD',
    value: 12000,
  },
  {
    id: 'row-2',
    name: 'GOOG',
    category: 'stock',
    market: 'US',
    currency: 'USD',
    value: 8000,
  },
  {
    id: 'row-3',
    name: '现金',
    category: 'cash',
    market: 'Global',
    currency: 'USD',
    value: 5000,
  },
];

function formatMoney(value: number, currency: HoldingRow['currency']) {
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency === 'Other' ? 'USD' : currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(value);
  }
}

function categoryLabel(c: HoldingRow['category']) {
  switch (c) {
    case 'stock':
      return '股票';
    case 'etf':
      return 'ETF';
    case 'bond':
      return '债券';
    case 'cash':
      return '现金';
    case 'gold':
      return '黄金';
    case 'crypto':
      return '加密';
    case 'real_estate':
      return '不动产';
    default:
      return '其他';
  }
}

export function HoldingTable() {
  const total = demoRows.reduce((sum, r) => sum + r.value, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">现有持仓</CardTitle>
            <CardDescription>
              静态示例：后续接 Supabase 数据与计算权重。
            </CardDescription>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground">总资产（示例）</div>
            <div className="text-sm font-semibold">
              {formatMoney(total, 'USD')}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead className="w-[110px]">分类</TableHead>
                <TableHead className="w-[110px]">市场</TableHead>
                <TableHead className="w-[110px]">币种</TableHead>
                <TableHead className="text-right">市值</TableHead>
                <TableHead className="text-right w-[110px]">权重</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {demoRows.map((r) => {
                const weight = total === 0 ? 0 : (r.value / total) * 100;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {categoryLabel(r.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.market}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.currency}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(r.value, r.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {weight.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          v0
          说明：这里先用静态数据占位，后面会把「现金」独立成固定输入框（如果你决定这么做）。
        </div>
      </CardContent>
    </Card>
  );
}

export default HoldingTable;
