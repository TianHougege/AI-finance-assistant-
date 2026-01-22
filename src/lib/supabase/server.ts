//服务端 anon key + session（用途：路由保护，auth callback/protect）

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        // TODO 1: 从 cookieStore 读取 cookie 值并返回 string | undefined
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // TODO 2: 写 cookie（有些 Next 场景写 cookie 会报错，所以建议 try/catch）
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {}
      },
    },
  });
}
