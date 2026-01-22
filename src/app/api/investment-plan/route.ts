import { createClient } from '@/lib/supabase/server';

interface targetRow {
  id: string;
  symbol: string;
  name: string;
  category: string;
  strategyType: string;
  targetWeight: string;
}

interface investFrame {
  planKey?: string;
  targetRow: targetRow[]; //目标配置（简称/名字/类型/活动类型/投资金额/投资占比）
  planBaseCapital: string;
  investmentPurpose: string; //投资目的
  investmentYear: string; //投资年限
  returnPurpose: string; //总收益
  taskNotes: string; //任务备注
  exitLine: string; //清仓底线
  singleLine: string; //单笔底线
  holdMax: string; //持仓限额
  riskNotes: string; //自定义风险
}

interface AiSnapshot {
  investmentTask: {
    planBaseCapital: string;
    investmentPurpose: string;
    investmentYear: string;
    returnPurpose: string;
    taskNotes: string;
  };
  riskDefense: {
    exitLine: string;
    singleLine: string;
    holdMax: string;
    riskNotes: string;
  };
  targets: targetRowLite[];
}

type targetRowLite = Pick<
  targetRow,
  'symbol' | 'name' | 'category' | 'strategyType' | 'targetWeight'
>;

type TestAiResponse = { ai_reply: string };

const RAW_PROMPT = `
你是“投资框架分析助手”，不是理财顾问。你只能基于用户提供的 SNAPSHOT 进行分析，不得编造用户偏好或事实，不得给出买卖点/具体价格预测。

【输入】
- SNAPSHOT：用户已保存的投资框架数据（包含目标配置、投资任务、风险防御等字段）

【输出要求（必须遵守）】
1) 语言：中文
2) 逻辑结构固定为 1)2)3)4) 四段，标题必须完全一致
3) 篇幅控制：
   - 第1段 <= 60字
   - 第2段最多3条，每条<=35字
   - 第3段表格最多5行（不含表头），每格尽量短
   - 第4段只允许1个问题（<=25字）
4) 禁止内容：
   - 不要长篇免责声明
   - 不要“保证收益/必涨/翻倍”等承诺
   - 不要给出具体买入卖出点位、目标价
5) 选股参考的定位：
   - 只能给“标的/方向/类型”层面的参考（例如ETF/行业方向/因子风格），并解释与用户的目标/风险边界的匹配原因
6) 若用户信息不足：
   - 不要瞎猜，在第4段提出1个最关键的确认问题

【你必须使用下面模板输出】

1) 投资框架摘要
- 用一句话概括：投资目的/年限/收益目标/风险边界（<=60字）

2) 一致性检查（最多3条）
- 每条格式：冲突点/风险点 + 为什么重要 + 一句改进建议

3) 选股参考（Markdown表格，最多5行）
说明：基于用户的目标与风险边界给“候选标的/方向”，不要给买卖点。
表格列固定为：
| 标的/方向 | 类型 | 适配理由 | 主要风险 | 需要用户确认的前提 |

4) 你需要我确认的1个关键问题
- 只问1个问题，用来补齐缺失信息

最后一行（<=20字）：不构成投资建议
`.trim();

const buildSnapshot = (payload: investFrame): AiSnapshot => {
  // 1) targetRow 裁剪：只留 AI 需要的字段
  const targetRowLite: targetRowLite[] = payload.targetRow.map((r) => ({
    symbol: r.symbol,
    name: r.name,
    category: r.category,
    strategyType: r.strategyType,
    targetWeight: r.targetWeight,
  }));

  return {
    investmentTask: {
      planBaseCapital: payload.planBaseCapital,
      investmentPurpose: payload.investmentPurpose,
      investmentYear: payload.investmentYear,
      returnPurpose: payload.returnPurpose,
      taskNotes: payload.taskNotes,
    },
    riskDefense: {
      exitLine: payload.exitLine,
      singleLine: payload.singleLine,
      holdMax: payload.holdMax,
      riskNotes: payload.riskNotes,
    },
    targets: targetRowLite,
  };
};

const userData = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) return null;
  if (error) console.error('get user Data error:', error);
  return { supabase, user };
};

export async function POST(req: Request) {
  const ctx = await userData();
  if (ctx === null)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  const { supabase, user } = ctx;
  try {
    const payload = (await req.json()) as investFrame;

    const insertData = {
      plan_key: payload.planKey ?? 'default',
      target_rows: payload.targetRow,
      plan_base_capital: payload.planBaseCapital,
      investment_purpose: payload.investmentPurpose,
      investment_year: payload.investmentYear,
      return_purpose: payload.returnPurpose,
      task_notes: payload.taskNotes,
      exit_line: payload.exitLine,
      single_line: payload.singleLine,
      hold_max: payload.holdMax,
      risk_notes: payload.riskNotes,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('createvalue')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert createvalue error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    const snapshot = buildSnapshot(payload);
    const aiUrl = new URL('/api/test-ai', req.url);

    const aiRes = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: RAW_PROMPT, snapshot }),
    });

    //parse ai-reply
    let aiReply: string | null = null;
    if (aiRes.ok) {
      const aiJson = (await aiRes.json()) as TestAiResponse;
      aiReply = aiJson.ai_reply?.trim() ? aiJson.ai_reply.trim() : null;
      console.log('RAW AI JSON:', aiJson);
      console.log('PARSED aiReply:', aiReply);
    } else {
      const text = await aiRes.text().catch(() => '');
      console.error('AI error:', aiRes.status, text);
    }

    //post ai-reply
    if (aiReply !== null) {
      const { data: updated, error: updateError } = await supabase
        .from('createvalue')
        .update({ ai_reply: aiReply, ai_reply_at: new Date().toISOString() })
        .eq('id', data.id)
        .eq('user_id', user.id);
      console.log('UPDATED ROWS:', updated);

      if (updateError)
        console.error('supabase update ai_reply error:', updateError);
    }

    let dbResult = data;

    return new Response(JSON.stringify(dbResult), { status: 201 });
  } catch (e) {
    console.error('POST api/investment-plan unexcepted error :', e);
    return new Response(JSON.stringify({ error: 'Unexcepted server error' }), {
      status: 500,
    });
  }
}

export async function GET() {
  const ctx = await userData();
  if (ctx === null)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  const { supabase, user } = ctx;
  const { data, error } = await supabase
    .from('createvalue')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('supabase select createvalue error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
