'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Settings2, TrendingUp, BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Decisions', href: '/dashboard/decision-list', icon: ListChecks },
  { label: 'Framework', href: '/dashboard/investment-frame', icon: Settings2 },
  { label: 'Account Book', href: '/dashboard/account-book', icon: BookOpen },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col" style={{ background: '#0f1117' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/icon.svg"
            alt="SideKick"
            width={28}
            height={28}
            sizes="28px"
            priority
            className="h-7 w-7 rounded-lg"
          />
          <span className="text-sm font-semibold tracking-tight text-white">SideKick</span>
        </div>
        <span className="rounded border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">
          BETA
        </span>
      </div>

      {/* Nav items */}
      <ul className="mt-2 flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Long Term Card */}
      <div className="mx-3 mb-3 rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(30,41,90,0.9) 0%, rgba(49,46,129,0.7) 50%, rgba(15,23,42,0.9) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-300">Long Term</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Stay invested. Don&apos;t let short-term noise change a long-term plan.
        </p>
      </div>

      {/* Account section */}
      <div className="border-t border-slate-800 px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-600 shrink-0 flex items-center justify-center">
          <span className="text-xs font-medium text-slate-200">A</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">Account</p>
          <p className="text-xs text-slate-500">Pro Plan</p>
        </div>
      </div>
    </nav>
  );
}
