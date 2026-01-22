// src/app/dashboard/layout.tsx 顶部加上：

import SideNav from '../ui/dashboard/sidenav';
import { Toaster } from 'sonner';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UserMenu from '@/components/user-menu';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }
  return (
    <div className="flex h-screen flex-row md:overflow-hidden bg-slate-950 text-slate-50">
      {/* 左侧 Sidebar */}
      <aside className="w-full flex-none md:w-64 border-b md:border-b-0 md:border-r border-slate-800">
        <SideNav />
      </aside>

      {/* 右侧主区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部条 */}
        <header className="h-14 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 左侧：页面标题占位（之后可替换为真实标题） */}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <UserMenu />
          </div>
        </header>

        {/* 内容滚动区 */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 bg-slate-950/60">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}
