'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

type TabKey = 'chat' | 'framework';

type TargetRow = {
  id: string;
  symbol: string;
  name: string;
  category: 'equity' | 'bond' | 'cash' | 'other';
  strategyType: 'active' | 'passive';
  targetWeight: string; // %
};

type FrameworkForm = {
  planBaseCapital: string;
  investmentPurpose: string;
  investmentYear: string;
  returnPurpose: string;
  taskNotes: string;

  exitLine: string;
  singleLine: string;
  holdMax: string;
  riskNotes: string;
};

const defaultForm: FrameworkForm = {
  planBaseCapital: '',
  investmentPurpose: '',
  investmentYear: '',
  returnPurpose: '',
  taskNotes: '',

  exitLine: '',
  singleLine: '',
  holdMax: '',
  riskNotes: '',
};

export default function InvestmentFramePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const [isEdit, setIsEdit] = useState(true);

  // Static-only demo state (no persistence yet)
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState(
    'AI reply will appear here (static placeholder).'
  );
  const [isSending, setIsSending] = useState(false);
  const [frameworkReply, setFrameworkReply] = useState(
    'AI reply will appear here (static placeholder).'
  );

  const [isFrameworkSaving, setIsFrameworkSaving] = useState(false);

  const [form, setForm] = useState<FrameworkForm>(defaultForm);

  const [rows, setRows] = useState<TargetRow[]>([
    {
      id: 'row-1',
      symbol: 'AAPL',
      name: 'Apple',
      category: 'equity',
      strategyType: 'passive',
      targetWeight: '20',
    },
  ]);

  //ai reply area
  const handleSend = async () => {
    //1.设置传入字段
    const prompt = chatInput.trim();
    if (!prompt) return;

    setIsSending(true);
    try {
      //2.post数据
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setChatReply(`Error: ${JSON.stringify(json)}`);
        return;
      }
      setChatReply(json.ai_reply ?? json.reply ?? '');
    } catch (e) {
      setChatReply(`Crashed: ${String(e)}`);
    } finally {
      setIsSending(false);
    }
  };

  //framework data POST
  const handleSaveFramework = async (): Promise<boolean> => {
    if (isFrameworkSaving) return false; //这里函数提前结束

    const payload = { targetRow: rows, ...form };

    setIsFrameworkSaving(true);
    try {
      const res = await fetch('/api/investment-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setFrameworkReply(`Error: ${JSON.stringify(json)}`);
        return false;
      }
      setFrameworkReply('Saved. Loading AI reply...');
      await loadFramework();
      return true;
    } catch (e) {
      setFrameworkReply(`crash: ${String(e)}`);
      return false;
    } finally {
      setIsFrameworkSaving(false);
    }
  };

  //async submit framework button function
  const handleToggleEdit = async () => {
    if (isEdit) {
      const ok = await handleSaveFramework();
      if (ok) setIsEdit(false);
      return;
    }

    setIsEdit(true);
  };

  //persist frame data
  const loadFramework = async () => {
    try {
      const res = await fetch('/api/investment-plan', {
        method: 'GET',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setFrameworkReply(
          `Failed to load value plan: ${text || res.statusText || res.status}`
        );
        return;
      }

      const row = (await res.json()) as any;

      setRows((row.target_rows ?? '') as TargetRow[]);
      setForm({
        planBaseCapital: row.plan_base_capital,
        investmentPurpose: row.investment_purpose,
        investmentYear: row.investment_year,
        returnPurpose: row.return_purpose,
        taskNotes: row.task_notes,

        exitLine: row.exit_line,
        singleLine: row.single_line,
        holdMax: row.hold_max,
        riskNotes: row.risk_notes,
      });

      setFrameworkReply(row.ai_reply ?? '(ai_reply is null / empty)');

      setIsEdit(false);
    } catch (e) {
      setFrameworkReply(`Failed to load value framework: ${String(e)}`);
    }
  };

  useEffect(() => {
    loadFramework();
  }, []);

  const setField = <K extends keyof FrameworkForm>(
    key: K,
    value: FrameworkForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${prev.length + 1}`,
        symbol: '',
        name: '',
        category: 'equity',
        strategyType: 'passive',
        targetWeight: '',
      },
    ]);
  };

  const updateRow = <K extends keyof TargetRow>(
    id: string,
    key: K,
    value: TargetRow[K]
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    );
  };

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">投资框架设置</h1>
        <p className="text-sm text-muted-foreground">
          两种交互模式：AI 聊天（快速形成框架）与自主设置（结构化沉淀）。
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">AI 聊天对话框</TabsTrigger>
          <TabsTrigger value="framework">自主设置投资框架</TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI 回复</CardTitle>
              <CardDescription>这里展示本轮 AI 的总结与建议。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[180px] whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                {chatReply}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">你的想法</CardTitle>
              <CardDescription>
                随意输入你当前的投资困惑/想法，v0 版本先做一问一答。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                className="min-h-[120px]"
                placeholder="例如：我想长期投资，但一跌就恐惧卖出…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  className="bg-black hover:bg-black/90"
                  onClick={handleSend}
                  disabled={isSending}
                >
                  {isSending ? '分析中...' : '发送'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Framework Tab */}
        <TabsContent value="framework" className="mt-4 space-y-4">
          {/* 1) AI reply */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI 回复</CardTitle>
              <CardDescription>
                保存后，这里会显示 AI 的分析建议。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[140px] whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                {frameworkReply}
              </div>
            </CardContent>
          </Card>

          {/* 2) Target rows */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  偏好标的物（目标配置）
                </CardTitle>
                <CardDescription>
                  填写你偏好的标的与目标占比（静态页面：仅展示布局）。
                </CardDescription>
              </div>
              <Button variant="outline" onClick={addRow}>
                + 添加一行
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">简称</TableHead>
                      <TableHead className="min-w-[180px]">名字</TableHead>
                      <TableHead className="w-[140px]">类型</TableHead>
                      <TableHead className="w-40">活动类型</TableHead>
                      <TableHead className="w-40">投资占比(%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Input
                            className="h-8"
                            value={r.symbol}
                            disabled={!isEdit}
                            onChange={(e) =>
                              updateRow(r.id, 'symbol', e.target.value)
                            }
                            placeholder="AAPL"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8"
                            value={r.name}
                            disabled={!isEdit}
                            onChange={(e) =>
                              updateRow(r.id, 'name', e.target.value)
                            }
                            placeholder="Apple"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={r.category}
                            onValueChange={(v) =>
                              updateRow(
                                r.id,
                                'category',
                                v as TargetRow['category']
                              )
                            }
                            disabled={!isEdit}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">股票/权益</SelectItem>
                              <SelectItem value="bond">债券</SelectItem>
                              <SelectItem value="cash">现金</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={r.strategyType}
                            onValueChange={(v) =>
                              updateRow(
                                r.id,
                                'strategyType',
                                v as TargetRow['strategyType']
                              )
                            }
                            disabled={!isEdit}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passive">被动</SelectItem>
                              <SelectItem value="active">主动</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8"
                            value={r.targetWeight}
                            disabled={!isEdit}
                            onChange={(e) =>
                              updateRow(r.id, 'targetWeight', e.target.value)
                            }
                            placeholder="20"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 3) Investment task */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">投资任务</CardTitle>
              <CardDescription>
                明确目标，让 AI 更容易判断你是否偏离。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="planBaseCapital"
                  className="text-xs text-muted-foreground"
                >
                  投资总金额
                </Label>
                <Input
                  id="planBaseCapital"
                  placeholder="例如：10000元"
                  value={form.planBaseCapital}
                  onChange={(e) => setField('planBaseCapital', e.target.value)}
                  disabled={!isEdit}
                />
                <Label
                  htmlFor="investmentPurpose"
                  className="text-xs text-muted-foreground"
                >
                  投资目的
                </Label>
                <Input
                  id="investmentPurpose"
                  placeholder="例如：长期增值 / 退休储备 / 抗通胀"
                  value={form.investmentPurpose}
                  onChange={(e) =>
                    setField('investmentPurpose', e.target.value)
                  }
                  disabled={!isEdit}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="investmentYear"
                  className="text-xs text-muted-foreground"
                >
                  投资年限
                </Label>
                <Input
                  id="investmentYear"
                  placeholder="例如：5年 / 10年 / 长期"
                  value={form.investmentYear}
                  onChange={(e) => setField('investmentYear', e.target.value)}
                  disabled={!isEdit}
                />

                <Label
                  htmlFor="returnPurpose"
                  className="text-xs text-muted-foreground"
                >
                  目标收益（年化或阶段）
                </Label>
                <Input
                  id="returnPurpose"
                  placeholder="例如：年化 7% 或 5年累计 +50%"
                  value={form.returnPurpose}
                  onChange={(e) => setField('returnPurpose', e.target.value)}
                  disabled={!isEdit}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="taskNotes"
                  className="text-xs text-muted-foreground"
                >
                  任务备注
                </Label>
                <Textarea
                  id="taskNotes"
                  className="min-h-[90px]"
                  placeholder="例如：我最容易在下跌时恐惧卖出，希望AI在我准备卖出前提醒我遵守计划。"
                  value={form.taskNotes}
                  onChange={(e) => setField('taskNotes', e.target.value)}
                  disabled={!isEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4) Risk management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">风险管理</CardTitle>
              <CardDescription>写下“底线”，避免情绪化决策。</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="exitLine"
                  className="text-xs text-muted-foreground"
                >
                  清仓底线
                </Label>
                <Input
                  id="exitLine"
                  placeholder="例如：单标的回撤 -25% 必须清仓"
                  value={form.exitLine}
                  onChange={(e) => setField('exitLine', e.target.value)}
                  disabled={!isEdit}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="singleLine"
                  className="text-xs text-muted-foreground"
                >
                  单笔跌幅底线
                </Label>
                <Input
                  id="singleLine"
                  placeholder="例如：单笔亏损上限 -8%"
                  value={form.singleLine}
                  onChange={(e) => setField('singleLine', e.target.value)}
                  disabled={!isEdit}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="holdMax"
                  className="text-xs text-muted-foreground"
                >
                  持仓限额
                </Label>
                <Input
                  id="holdMax"
                  placeholder="例如：单标的最高 10%"
                  value={form.holdMax}
                  onChange={(e) => setField('holdMax', e.target.value)}
                  disabled={!isEdit}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="riskNotes"
                  className="text-xs text-muted-foreground"
                >
                  自定义风险
                </Label>
                <Textarea
                  id="riskNotes"
                  className="min-h-[90px]"
                  placeholder="例如：禁止越跌越补；亏损时24小时冷静期。"
                  value={form.riskNotes}
                  onChange={(e) => setField('riskNotes', e.target.value)}
                  disabled={!isEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom: Save/Edit */}
          <div className="flex items-center justify-end">
            <Button
              onClick={handleToggleEdit}
              className="bg-black hover:bg-black/90"
              disabled={isFrameworkSaving}
            >
              {isFrameworkSaving ? '分析中...' : isEdit ? '保存' : '编辑'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
