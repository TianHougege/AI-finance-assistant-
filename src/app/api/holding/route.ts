import { createClient } from '@/lib/supabase/server';

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

const toNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const sumNumbers = (arr: Array<unknown>): number => {
  return arr.reduce<number>((acc, v) => acc + toNumber(v), 0);
};

export async function POST(req: Request) {
  const payload = await req.json();
  // Expected payload shape:
  // {
  //   portfolio: { cash_value: number | null; cash_currency: number | null },
  //   holdings: Array<{ name: string; category: string | null; market: string | null; currency: string | null; value: number | null }>
  // }
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('portfolio' in payload) ||
    !('holdings' in payload)
  ) {
    return new Response(
      JSON.stringify({
        error: 'Invalid payload. Expected { portfolio, holdings }',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  const ctx = await userData();
  if (ctx === null) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { supabase } = ctx;

  try {
    const { data: portfolioId, error } = await supabase.rpc(
      'create_portfolio_snapshot',
      {
        p_portfolio: payload.portfolio,
        p_holdings: payload.holdings,
      }
    );

    if (error) {
      console.error(
        '[API][POST /api/holding][RPC_ERROR] create_portfolio_snapshot failed:',
        {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
        }
      );
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      JSON.stringify({ ok: true, portfolio_id: portfolioId }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('[API][POST /api/holding][UNEXPECTED_RUNTIME_ERROR]', {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  const ctx = await userData();
  if (ctx === null) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { supabase, user } = ctx;

  try {
    //1 lastest portfolio snapshot
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio')
      .select('id, created_at, cash_value, cash_currency')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (portfolioError) {
      console.error('[API][GET /api/holding][PORTFOLIO_ERROR]', {
        message: portfolioError.message,
        details: (portfolioError as any).details,
        hint: (portfolioError as any).hint,
        code: (portfolioError as any).code,
      });

      return new Response(JSON.stringify({ error: portfolioError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // No snapshot yet
    if (!portfolio) {
      return new Response(
        JSON.stringify({
          ok: true,
          portfolio: null,
          holdings: [],
          computed: {
            cash_value: 0,
            holdings_value: 0,
            total_value: 0,
            cash_ratio: 0,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    //2 Holdings under this snapshot
    const { data: holdings, error: holdingsError } = await supabase
      .from('holding')
      .select(
        'id, created_at, user_id, portfolio_id, name, category, market, currency, value'
      )
      .eq('user_id', user.id)
      .eq('portfolio_id', portfolio.id)
      .order('value', { ascending: false });

    if (holdingsError) {
      console.error('[API][GET /api/holding][HOLDINGS_ERROR]', {
        message: holdingsError.message,
        details: (holdingsError as any).details,
        hint: (holdingsError as any).hint,
        code: (holdingsError as any).code,
        portfolio_id: portfolio.id,
      });
      return new Response(JSON.stringify({ error: holdingsError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    //3 computed fields for cash gauge
    const cashValue = toNumber((portfolio as any).cash_value);
    const holdingsValue = sumNumbers((holdings ?? []).map((h: any) => h.value));
    const totalValue = cashValue + holdingsValue;
    const cashRatio = totalValue > 0 ? cashValue / totalValue : 0;
    return new Response(
      JSON.stringify({
        ok: true,
        portfolio: {
          id: portfolio.id,
          created_at: portfolio.created_at,
          cash_value: cashValue,
          cash_currency: (portfolio as any).cash_currency ?? null,
        },
        holdings: holdings ?? [],
        computed: {
          cash_value: cashValue,
          holdings_value: holdingsValue,
          total_value: totalValue,
          cash_ratio: cashRatio,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('[API][GET /api/holding][UNEXPECTED_RUNTIME_ERROR]', {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
