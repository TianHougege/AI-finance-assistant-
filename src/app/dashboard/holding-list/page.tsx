import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HoldingListPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">驾驶舱</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            现有持仓 / 目标持仓 / 现金流 / 复利趋势（v0 静态框架）
          </p>
        </div>

        {/* Left-top button: open/close holding form (wire up later) */}
        <Button
          type="button"
          variant="secondary"
          aria-label="打开/关闭持仓表单"
        >
          持仓表单
        </Button>
      </div>

      {/* Content: 6:4 split, 4 zones */}
      <div className="grid grid-cols-10 gap-6">
        {/* Left column (6/10) */}
        <div className="col-span-10 space-y-6 lg:col-span-6">
          {/* Existing holdings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">现有持仓</CardTitle>
              <CardDescription>
                这里将显示你的现有持仓列表与分类汇总（稍后接表单与数据库）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-background/50 p-4 text-sm text-muted-foreground">
                占位：现有持仓表格 / 列表
              </div>
            </CardContent>
          </Card>

          {/* Target holdings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">目标持仓</CardTitle>
              <CardDescription>
                这里将显示目标持仓分布（稍后接你的
                investment-plan/value-plan）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-background/50 p-4 text-sm text-muted-foreground">
                占位：目标持仓图表 / 分布
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column (4/10) */}
        <div className="col-span-10 space-y-6 lg:col-span-4">
          {/* Cash gauge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">现金流情况</CardTitle>
              <CardDescription>
                仪表盘/油表：现金占比过低时显示风险提示（后续接图表）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-background/50 p-4 text-sm text-muted-foreground">
                占位：现金流油表
              </div>
            </CardContent>
          </Card>

          {/* Compounding trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">价值投资趋势</CardTitle>
              <CardDescription>
                5/10/20 年复利可视化（后续接动画/图表）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-background/50 p-4 text-sm text-muted-foreground">
                占位：复利效应动态图
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
