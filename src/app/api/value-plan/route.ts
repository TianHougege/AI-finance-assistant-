import { supabaseServer } from '@/lib/supabaseServer';

type ValuePlanPayload = {
  targetRows: any[]; // 先用 any[]，以后可以换成 allocationRow[]
  planBaseCapital: string;

  rules: {
    rebalancingFrequency: string;
    rebalancingThreshold: string;
    maxSinglePosition: string;
    minHoldingPeriod: string;
  };

  sellConditions: string;
};

export async function POST(req: Request) {
  const payload = (await req.json()) as ValuePlanPayload;

  const insertData = {
    target_rows: payload.targetRows,
    plan_base_capital: payload.planBaseCapital,
    rebalancing_frequency: payload.rules.rebalancingFrequency,
    rebalancing_threshold: payload.rules.rebalancingThreshold,
    max_single_position: payload.rules.maxSinglePosition,
    min_holding_period: payload.rules.minHoldingPeriod,
    sell_conditions: payload.sellConditions,
  };

  const { data: existing, error: existingError } = await supabaseServer
    .from('createvalue')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error('Supabase fetch existing createvalue error:', existingError);
    return new Response(JSON.stringify({ error: existingError.message }), {
      status: 500,
    });
  }

  let dbResult;

  if (existing) {
    const { data, error } = await supabaseServer
      .from('createvalue')
      .update(insertData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update createvalue error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    dbResult = data;
  } else {
    const { data, error } = await supabaseServer
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

    dbResult = data;
  }
  return new Response(JSON.stringify(dbResult), { status: 201 });
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from('createvalue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('Supabase select value_plan error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function PATCH(req: Request) {
  try {
    const payload = (await req.json().catch(() => {})) as any;
    const ai_reply = payload?.ai_reply;
    if (typeof ai_reply != 'string' || ai_reply.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid ai_reply' }),
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabaseServer
      .from('createvalue')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(
        'Supabase fetch existing createvalue error:',
        existingError
      );
      return new Response(JSON.stringify({ error: existingError.message }), {
        status: 500,
      });
    }

    if (!existing) {
      return new Response(JSON.stringify({ error: 'No plan row to update' }), {
        status: 404,
      });
    }

    const { data, error } = await supabaseServer
      .from('createvalue')
      .update({
        ai_reply,
        ai_update_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Supabse update ai_reply error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error('PATCH /api/value-plan unexpected error: ', e);
    return new Response(JSON.stringify({ error: 'Unexcepted server error' }), {
      status: 500,
    });
  }
}
