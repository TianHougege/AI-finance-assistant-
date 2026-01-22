import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code');
  if (!code) redirect('/auth');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const msg = encodeURIComponent(error.message ?? 'callback_failed');
    redirect(`/auth?error=callback_failed&message=${msg}`);
  }

  redirect('/dashboard');
}
