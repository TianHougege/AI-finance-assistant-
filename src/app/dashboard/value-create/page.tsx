'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

type allocationRow = {
  id: string;
  symbol: string;
  name: string;
  category: string;
  strategyType: string;
  amount: string;
  targetWeight: string;
};

type PlanSnapshot = {
  id: string; // 比如 'plan-2025-12-01T15:23:00'
  createdAt: string; // ISO 时间戳

  targetRows: allocationRow[];
  planBaseCapital: string;

  rules: {
    rebalancingFrequency: string;
    rebalancingThreshold: string;
    maxSinglePosition: string;
    minHoldingPeriod: string;
  };

  sellConditions: string; // free text
};

type FormState = {
  id: string;
  createdAt: string;

  targetRow: [
    {
      id: string;
      symbol: string;
      name: string;
      category: string;
      strategyType: string;
      amount: string;
      targetweight: string;
    }
  ]; //目标配置（简称/名字/类型/活动类型/投资金额/投资占比）
  planBaseCapital: string;
  investmentPurpose: string; //投资目的
  investmentYear: string; //投资年限
  returnPurpose: string; //总收益
  taskNotes: string; //任务备注
  exitLine: string; //清仓底线
  singleLine: string; //单笔底线
  holdMax: string; //持仓限额
  riskNotes: string; //自定义风险
};

type PlanInsight = {
  profile: string; // 一句话画像：你是怎样的投资者
  strengths: string[]; // 2–3 条优点
  risks: string[]; // 2–3 条风险点
  guardrails: string[]; // 2–3 条行动建议/防线
};

const STORAGE_KEY = 'sidekick-active-plan-v0';

export default function ValueCreateSection() {
  const [rows, setRows] = useState<allocationRow[]>([
    {
      id: 'row-1',
      symbol: '',
      name: '',
      category: 'equity',
      strategyType: 'active',
      amount: '',
      targetWeight: '',
    },
  ]);

  const [planBaseCapital, setPlanBaseCapital] = useState('');
  const [rebalancingFrequency, setRebalancingFrequency] = useState('');
  const [rebalancingThreshold, setRebalancingThreshold] = useState('');
  const [maxSinglePosition, setMaxSinglePosition] = useState('');
  const [minHoldingPeriod, setMinHoldingPeriod] = useState('');
  const [sellConditions, setSellConditions] = useState('');
  const [isEdit, setIsEdit] = useState(true);
  const [reply, setReply] = useState<string>('');
  const [isHydrating, setIsHydrating] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrateFormServer() {
      setLoadError('');
      setIsHydrating(true);

      try {
        const res = await fetch('/api/value-plan', { method: 'GET' });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error(
            'Failed to load value plan:',
            res.status,
            res.statusText,
            text
          );
          if (!cancelled)
            setLoadError(`加载失败：${res.status} ${res.statusText}`);
          return;
        }
        const row = (await res.json()) as any;
        if (!row) return;
        if (!cancelled) {
          setRows(Array.isArray(row.target_rows) ? row.target_rows : []);
          setPlanBaseCapital(row.plan_base_capital ?? '');
          setRebalancingFrequency(row.rebalancing_frequency ?? '');
          setRebalancingThreshold(row.rebalancing_threshold ?? '');
          setMaxSinglePosition(row.max_single_position ?? '');
          setMinHoldingPeriod(row.min_holding_period ?? '');
          setSellConditions(row.sell_conditions ?? '');
          setReply(row.ai_reply ?? '');
        }

        setIsEdit(false);
      } catch (e) {
        console.error('Error hydrating value plan:', e);
        if (!cancelled) setLoadError('加载失败：请求异常（查看控制台）');
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }
    hydrateFormServer();
    return () => {
      cancelled = true;
    };
  }, []);

  // target plan: per-row change
  const handleRowChange = (id: string, field: string, value: string) => {
    const newRows = rows.map((row) => {
      if (row.id !== id) return row;
      const copy = { ...row };
      if (field === 'symbol') {
        copy.symbol = value;
      } else if (field === 'name') {
        copy.name = value;
      } else if (field === 'category') {
        copy.category = value;
      } else if (field === 'strategyType') {
        copy.strategyType = value;
      } else if (field === 'amount') {
        copy.amount = value;
      } else if (field === 'targetWeight') {
        copy.targetWeight = value;
      }
      return copy;
    });
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${prev.length + 1}`,
        symbol: '',
        name: '',
        category: 'equity',
        strategyType: 'active',
        amount: '',
        targetWeight: '',
      },
    ]);
  };

  // amount computed
  const amountCompute = (baseCapital: string, weight: string) => {
    const base = Number(baseCapital);
    const weightNum = Number(weight);
    const weightRatio = weightNum / 100;
    const amountNum = base * weightRatio;
    if (!Number.isFinite(amountNum)) return '0.00';
    return amountNum.toFixed(2);
  };

  function buildPlanSnapShot(): PlanSnapshot {
    return {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      targetRows: rows,
      planBaseCapital,
      rules: {
        rebalancingFrequency,
        rebalancingThreshold,
        maxSinglePosition,
        minHoldingPeriod,
      },
      sellConditions,
    };
  }

  async function savePlanToServer(snapshot: PlanSnapshot): Promise<any | null> {
    try {
      const res = await fetch('/api/value-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) {
        console.error('Failed to save value plan');
        return null;
      }
      const saved = await res.json();
      return saved;
    } catch (err) {
      console.error('Error saving value plan', err);
      return null;
    }
  }

  async function handleSavePlan() {
    const shot = buildPlanSnapShot();
    // 本地备份一份
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shot));
    const saved = await savePlanToServer(shot);
    console.log('saved row from supabase:', saved);
    if (!saved) return;
    setIsEdit(false);
    const res = await fetch('/api/test-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Please review my investment plan and give risks + guardrails.',
        snapshot: saved,
      }),
    });
    if (!res.ok) {
      console.error('error message about ai return');
      return;
    }
    const data = (await res.json()) as { reply?: string };
    const aiReply = data.reply ?? '';
    setReply(aiReply);

    //fetch ai reply to supabase
    if (aiReply.trim().length > 0) {
      const patchRes = await fetch('/api/value-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_reply: aiReply }),
      });
      if (!patchRes.ok) {
        const text = await patchRes.text().catch(() => '');
        console.error(
          'PATCH /api/value-plan failed:',
          patchRes.status,
          patchRes.statusText,
          text
        );
        return;
      }
      const patchedRow = await patchRes.json().catch(() => null);
      console.log('patched row (ai_reply saved):', patchedRow);
    }
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">投资框架设置</h2>
        <p className="text-sm text-muted-foreground">
          设置你的投资目标和行为红线，让AI助手围绕这些设定给你提供帮助.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-6">
        {/* Target plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">AI Suggestion</CardTitle>
          </CardHeader>
          <CardContent>{reply}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">目标配置</CardTitle>
            <CardDescription className="text-xs">
              选择你计划长期持有的标的，并且设置投资比例（如股票、基金、理财产品等）.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">标的代码</TableHead>
                  <TableHead className="text-xs">名称</TableHead>
                  <TableHead className="text-xs">类型</TableHead>
                  <TableHead className="text-xs">投资方式</TableHead>
                  <TableHead className="text-xs">投资金额</TableHead>
                  <TableHead className="text-right text-xs">
                    投资比例 %
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="p-1">
                      <Input
                        value={row.symbol}
                        onChange={(e) =>
                          handleRowChange(row.id, 'symbol', e.target.value)
                        }
                        disabled={!isEdit}
                      />
                    </TableCell>
                    <TableCell className="p1">
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          handleRowChange(row.id, 'name', e.target.value)
                        }
                        disabled={!isEdit}
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Select
                        value={row.category}
                        onValueChange={(val) =>
                          handleRowChange(row.id, 'category', val)
                        }
                        disabled={!isEdit}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="bond">Bond</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1">
                      <Select
                        value={row.strategyType}
                        onValueChange={(val) =>
                          handleRowChange(row.id, 'strategyType', val)
                        }
                        disabled={!isEdit}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="strategyType" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">active</SelectItem>
                          <SelectItem value="passive">passive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1 text-center">
                      $ {amountCompute(planBaseCapital, row.targetWeight)}
                    </TableCell>
                    <TableCell className="p-1 text-right">
                      <Input
                        value={row.targetWeight}
                        onChange={(e) =>
                          handleRowChange(
                            row.id,
                            'targetWeight',
                            e.target.value
                          )
                        }
                        placeholder="%"
                        className="h-8 text-right text-xs"
                        disabled={!isEdit}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-dashed border-muted-foreground/60 px-2 text-xs text-muted-foreground hover:bg-muted"
                        hidden={!isEdit}
                      >
                        + Add row
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-2 flex items-center justify-between border-t pt-3">
              <Label
                htmlFor="plan-base-capital"
                className="text-xs font-normal text-muted-foreground"
              >
                Plan base capital
              </Label>
              <Input
                id="plan-base-capital"
                placeholder="e.g. 100000"
                className="h-8 max-w-40 text-xs"
                value={planBaseCapital}
                onChange={(e) => setPlanBaseCapital(e.target.value)}
                disabled={!isEdit}
              />
            </div>
          </CardContent>
        </Card>

        {/* 投资任务 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">投资任务</CardTitle>
            <CardDescription className="text-xs"></CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="rebalancing-frequency"
                  className="flex-1 text-xs font-normal text-muted-foreground"
                >
                  投资目的
                </Label>
                <Input
                  id="investiment-purpose"
                  placeholder="例如：长期增值/退休储备/抗通胀/子女教育"
                  className="h-8 w-[180px] text-xs"
                  value={rebalancingFrequency}
                  onChange={(e) => setRebalancingFrequency(e.target.value)}
                  disabled={!isEdit}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="rebalancing-threshold"
                  className="flex-1 text-xs font-normal text-muted-foreground"
                >
                  投资年限
                </Label>
                <Input
                  id="rebalancing-threshold"
                  placeholder="e.g. 5"
                  className="h-8 w-[140px] text-xs"
                  value={rebalancingThreshold}
                  onChange={(e) => setRebalancingThreshold(e.target.value)}
                  disabled={!isEdit}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="max-single-position"
                  className="flex-1 text-xs font-normal text-muted-foreground"
                >
                  收益目标
                </Label>
                <Input
                  id="max-single-position"
                  placeholder="例如： 年化7%或者5年总收益50%"
                  className="h-8 w-[180px] text-xs"
                  value={maxSinglePosition}
                  onChange={(e) => setMaxSinglePosition(e.target.value)}
                  disabled={!isEdit}
                />
              </div>
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">
              v1: Add max category %, min cash buffer %, and max new capital per
              period.
            </p>
          </CardContent>
        </Card>

        {/* Guardrails per position */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Guardrails per position</CardTitle>
            <CardDescription className="text-xs">
              Principles to protect you from emotional decisions for each asset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="min-holding-period"
                  className="flex-1 text-xs font-normal text-muted-foreground"
                >
                  Minimum holding period
                </Label>
                <Input
                  id="min-holding-period"
                  placeholder="e.g. 5 years"
                  className="h-8 w-40 text-xs"
                  value={minHoldingPeriod}
                  onChange={(e) => setMinHoldingPeriod(e.target.value)}
                  disabled={!isEdit}
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="sell-conditions"
                  className="text-xs font-normal text-muted-foreground"
                >
                  Sell conditions (high-level)
                </Label>
                <Textarea
                  id="sell-conditions"
                  placeholder="Write in your own words when you would consider selling, beyond short-term price moves."
                  className="min-h-20 text-xs"
                  value={sellConditions}
                  onChange={(e) => setSellConditions(e.target.value)}
                  disabled={!isEdit}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              v1: Add no-add zone rules, max loss tolerance, and emotion notes
              for each position.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            className="min-w-40 h-9 px-6 text-sm text-muted-foreground hover:text-black hover:border-black transition-colors"
            onClick={async () => {
              if (isEdit) {
                await handleSavePlan();
              } else {
                setIsEdit(true);
              }
            }}
          >
            {isEdit ? 'Save Plan' : 'Edit Plan'}
          </Button>
        </div>
      </div>
    </section>
  );
}
