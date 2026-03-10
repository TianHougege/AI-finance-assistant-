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

  const handleSend = async () => {
    const prompt = chatInput.trim();
    if (!prompt) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
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

  const handleSaveFramework = async (): Promise<boolean> => {
    if (isFrameworkSaving) return false;

    const payload = { targetRow: rows, ...form };

    setIsFrameworkSaving(true);
    try {
      const res = await fetch('/api/investment-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setFrameworkReply(`Crash: ${String(e)}`);
      return false;
    } finally {
      setIsFrameworkSaving(false);
    }
  };

  const handleToggleEdit = async () => {
    if (isEdit) {
      const ok = await handleSaveFramework();
      if (ok) setIsEdit(false);
      return;
    }
    setIsEdit(true);
  };

  const loadFramework = async () => {
    try {
      const res = await fetch('/api/investment-plan', { method: 'GET' });
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
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Investment Framework</h1>
        <p className="text-sm text-slate-400 mt-1">
          Two interaction modes: AI chat (rapid framework building) and manual setup (structured configuration).
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="chat"
            className="text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            AI Chat
          </TabsTrigger>
          <TabsTrigger
            value="framework"
            className="text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            Manual Setup
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="mt-4 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">AI Reply</CardTitle>
              <CardDescription className="text-slate-400">
                AI summary and suggestions from this session will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[180px] whitespace-pre-wrap rounded-md bg-slate-800/60 border border-slate-700/50 p-3 text-sm text-slate-300">
                {chatReply}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Your Thoughts</CardTitle>
              <CardDescription className="text-slate-400">
                Share your current investment questions or ideas — one question at a time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                className="min-h-[120px] bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                placeholder="e.g. I want to invest long-term, but I panic sell whenever the market dips…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                  onClick={handleSend}
                  disabled={isSending}
                >
                  {isSending ? 'Analyzing...' : 'Send'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Framework Tab */}
        <TabsContent value="framework" className="mt-4 space-y-4">
          {/* 1) AI reply */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">AI Reply</CardTitle>
              <CardDescription className="text-slate-400">
                After saving, AI analysis and recommendations will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[140px] whitespace-pre-wrap rounded-md bg-slate-800/60 border border-slate-700/50 p-3 text-sm text-slate-300">
                {frameworkReply}
              </div>
            </CardContent>
          </Card>

          {/* 2) Target rows */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-white">
                    Target Allocations
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Define your preferred assets and target portfolio weights.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={addRow}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white shrink-0"
                >
                  + Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="w-[120px] text-slate-400 text-xs">Symbol</TableHead>
                      <TableHead className="min-w-[180px] text-slate-400 text-xs">Name</TableHead>
                      <TableHead className="w-[140px] text-slate-400 text-xs">Asset Type</TableHead>
                      <TableHead className="w-40 text-slate-400 text-xs">Strategy</TableHead>
                      <TableHead className="w-40 text-slate-400 text-xs">Target Weight (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id} className="border-slate-800/60 hover:bg-slate-800/40">
                        <TableCell>
                          <Input
                            className="h-8 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
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
                            className="h-8 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
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
                              updateRow(r.id, 'category', v as TargetRow['category'])
                            }
                            disabled={!isEdit}
                          >
                            <SelectTrigger className="h-8 bg-slate-800 border-slate-700 text-slate-200">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="bond">Bond</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={r.strategyType}
                            onValueChange={(v) =>
                              updateRow(r.id, 'strategyType', v as TargetRow['strategyType'])
                            }
                            disabled={!isEdit}
                          >
                            <SelectTrigger className="h-8 bg-slate-800 border-slate-700 text-slate-200">
                              <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                              <SelectItem value="passive">Passive</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
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
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Investment Goals</CardTitle>
              <CardDescription className="text-slate-400">
                Define clear objectives so AI can better assess whether you are staying on track.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planBaseCapital" className="text-xs text-slate-400">
                  Total Capital
                </Label>
                <Input
                  id="planBaseCapital"
                  placeholder="e.g. $10,000"
                  value={form.planBaseCapital}
                  onChange={(e) => setField('planBaseCapital', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
                <Label htmlFor="investmentPurpose" className="text-xs text-slate-400">
                  Investment Purpose
                </Label>
                <Input
                  id="investmentPurpose"
                  placeholder="e.g. Long-term growth / Retirement / Inflation hedge"
                  value={form.investmentPurpose}
                  onChange={(e) => setField('investmentPurpose', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentYear" className="text-xs text-slate-400">
                  Time Horizon
                </Label>
                <Input
                  id="investmentYear"
                  placeholder="e.g. 5 years / 10 years / Long-term"
                  value={form.investmentYear}
                  onChange={(e) => setField('investmentYear', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />

                <Label htmlFor="returnPurpose" className="text-xs text-slate-400">
                  Target Return (annualized or per period)
                </Label>
                <Input
                  id="returnPurpose"
                  placeholder="e.g. 7% annualized or +50% over 5 years"
                  value={form.returnPurpose}
                  onChange={(e) => setField('returnPurpose', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="taskNotes" className="text-xs text-slate-400">
                  Additional Notes
                </Label>
                <Textarea
                  id="taskNotes"
                  className="min-h-[90px] bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  placeholder="e.g. I tend to panic sell during downturns — ask AI to remind me to stick to the plan."
                  value={form.taskNotes}
                  onChange={(e) => setField('taskNotes', e.target.value)}
                  disabled={!isEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4) Risk management */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Risk Management</CardTitle>
              <CardDescription className="text-slate-400">
                Set hard limits to prevent emotional decision-making.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exitLine" className="text-xs text-slate-400">
                  Exit Threshold
                </Label>
                <Input
                  id="exitLine"
                  placeholder="e.g. Exit if a single position drops -25%"
                  value={form.exitLine}
                  onChange={(e) => setField('exitLine', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="singleLine" className="text-xs text-slate-400">
                  Single-Trade Loss Limit
                </Label>
                <Input
                  id="singleLine"
                  placeholder="e.g. Max loss per trade -8%"
                  value={form.singleLine}
                  onChange={(e) => setField('singleLine', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holdMax" className="text-xs text-slate-400">
                  Max Position Size
                </Label>
                <Input
                  id="holdMax"
                  placeholder="e.g. No single asset exceeds 10% of portfolio"
                  value={form.holdMax}
                  onChange={(e) => setField('holdMax', e.target.value)}
                  disabled={!isEdit}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="riskNotes" className="text-xs text-slate-400">
                  Custom Risk Rules
                </Label>
                <Textarea
                  id="riskNotes"
                  className="min-h-[90px] bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  placeholder="e.g. No averaging down on losses; mandatory 24-hour cooling-off period before any sell decision."
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
              disabled={isFrameworkSaving}
            >
              {isFrameworkSaving ? 'Analyzing...' : isEdit ? 'Save' : 'Edit'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
