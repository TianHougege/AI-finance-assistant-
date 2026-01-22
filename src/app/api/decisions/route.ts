import { createClient } from '@/lib/supabase/server';

type DecisionFormData = {
  plannedTime: string;
  actionType: string;
  objectType: string;
  objectName: string;
  amount: string;
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
  const payload = (await req.json()) as DecisionFormData;
  const ctx = await userData();
  if (ctx === null)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  const { supabase, user } = ctx;

  const { data, error } = await supabase
    .from('decisions')
    .insert({
      planned_time: payload.plannedTime,
      action_type: payload.actionType,
      object_type: payload.objectType,
      object_name: payload.objectName,
      amount: payload.amount,
      user_id: user.id,
    })
    .select()
    .single();
  if (error) {
    console.error('Supabase insert error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  console.log('Supabase insert success, data:', data);
  return new Response(JSON.stringify(data), { status: 201 });
}

export async function GET() {
  const ctx = await userData();
  if (ctx === null)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  const { supabase, user } = ctx;

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('user_id', user.id);
  if (error) {
    console.error('Supabase select error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}
