import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return Response.json(
      { ok: false, message: 'Invalid payload: email/password required' },
      { status: 400 }
    );
  }
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return Response.json(
      { ok: false, message: error.message },
      { status: 401 }
    );
  }

  return Response.json(
    { ok: true, userId: data.user?.id ?? null },
    {
      status: 200,
    }
  );
}
