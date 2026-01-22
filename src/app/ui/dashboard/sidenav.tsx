import Link from 'next/link';
import Image from 'next/image';
const navItems = [
  { label: '投资驾驶舱', href: '/dashboard' },
  { label: '决策列表', href: '/dashboard/decision-list' },
  { label: '投资框架设置', href: '/dashboard/investment-frame' },
];

export default function SideNav() {
  return (
    <nav className="flex h-full flex-col">
      {/* 顶部 logo / 标题区域 */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* Logo 图标 */}
          <Image
            src="/sidekick_logo_whitebg_256.png"
            alt="Sidekick"
            width={28}
            height={28}
            sizes="28px"
            priority
            className="h-7 w-7"
          />

          {/* 可选：旁边再加字，比如 Sidekick */}
          <span className="text-sm font-semibold tracking-tight">Sidekick</span>
        </div>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
          beta
        </span>
      </div>

      {/* 菜单列表 */}
      <ul className="mt-2 flex-1 space-y-1 px-2 text-sm md:px-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-50 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 底部理财提醒 */}
      <div className="border-t border-slate-800 px-4 py-3 text-[11px] leading-snug text-slate-400">
        <p>
          Stay invested. Don&apos;t let short-term noise change a long-term
          plan.
        </p>
      </div>
    </nav>
  );
}
